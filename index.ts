#!/usr/bin/env node
import pMap from "p-map";
import {rrdir, type RRDirOpts} from "rrdir";
import {constants, gzip, brotliCompress, zstdCompress} from "node:zlib";
import {availableParallelism} from "node:os";
import {argv, exit, versions, env} from "node:process";
import {parseArgs, promisify, styleText, type ParseArgsConfig} from "node:util";
import {stat, readFile, writeFile, realpath, mkdir, unlink} from "node:fs/promises";
import {extname, relative, join, dirname, normalize, resolve} from "node:path";
import {isBinaryFileSync} from "isbinaryfile";
import picomatch from "picomatch";
import pkg from "./package.json" with {type: "json"};

const alwaysExclude = ["**.gz", "**.br", "**.zst"];
const numCores = availableParallelism();

// raise libuv threadpool over default 4 when more cores are available
if (versions.uv && numCores > 4) {
  env.UV_THREADPOOL_SIZE = String(numCores);
}

function parseArgv<T extends ParseArgsConfig>(config: T): ReturnType<typeof parseArgs<T>> {
  try {
    return parseArgs(config);
  } catch (err) {
    console.error((err as Error).message);
    return exit(1);
  }
}

const {values: args, positionals} = parseArgv({
  args: argv.slice(2),
  allowPositionals: true,
  strict: true,
  options: {
    basedir: {type: "string", short: "b"},
    concurrency: {type: "string", short: "c"},
    delete: {type: "boolean", short: "d"},
    exclude: {type: "string", short: "e", multiple: true},
    extensionless: {type: "boolean", short: "E"},
    follow: {type: "boolean", short: "f"},
    help: {type: "boolean", short: "h"},
    include: {type: "string", short: "i", multiple: true},
    mtime: {type: "boolean", short: "m"},
    outdir: {type: "string", short: "o"},
    sensitive: {type: "boolean", short: "S"},
    silent: {type: "boolean", short: "s"},
    types: {type: "string", short: "t", multiple: true},
    verbose: {type: "boolean", short: "V"},
    version: {type: "boolean", short: "v"},
  },
});

function end(err: Error | void) {
  if (err) console.error(err.stack || err.message || err);
  exit(err ? 1 : 0);
}

if (args.version) {
  console.info(pkg.version);
  end();
}

if (!positionals.length || args.help) {
  console.info(`usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>    Types of files to generate. Default: gz,br,zst
    -i, --include <glob,...>  Only include given globs. Default: unset
    -e, --exclude <glob,...>  Exclude given globs. Default: ${alwaysExclude.join(",")}
    -m, --mtime               Skip outputs that are newer than their source file
    -f, --follow              Follow symbolic links
    -d, --delete              Delete source file after compression
    -o, --outdir              Output directory, will preserve relative path structure
    -b, --basedir             Base directory to derive output path, use with --outdir
    -E, --extensionless       Do not output an extension, use with single --type and --outdir
    -s, --silent              Do not print anything
    -S, --sensitive           Treat include and exclude patterns case-sensitively
    -c, --concurrency <num>   Number of concurrent operations. Default: auto
    -V, --verbose             Print individual file compression times
    -h, --help                Show this text
    -v, --version             Show the version

  Examples:
    $ precompress ./build`);
  end();
}

const {
  Z_BEST_COMPRESSION,
  BROTLI_PARAM_QUALITY,
  BROTLI_MAX_QUALITY,
  BROTLI_PARAM_MODE,
  BROTLI_MODE_FONT,
  BROTLI_MODE_GENERIC,
  BROTLI_MODE_TEXT,
  ZSTD_c_strategy,
  ZSTD_btultra2,
} = constants;

function getBrotliMode(data: Buffer, path: string) {
  if (extname(path).toLowerCase() === ".woff2") {
    return BROTLI_MODE_FONT;
  } else if (isBinaryFileSync(data)) {
    return BROTLI_MODE_GENERIC;
  } else {
    return BROTLI_MODE_TEXT;
  }
}

function reductionText(data: Buffer, newData: Buffer) {
  const change = (newData.byteLength / data.byteLength) * 100;
  const color = change <= 80 ? "green" : (change < 100 ? "yellow" : "red");
  return `(${styleText(color, `${change.toPrecision(3)}%`)} size)`;
}

const encoders: Record<string, (data: Buffer, path: string) => Promise<Buffer>> = {
  gz: data => promisify(gzip)(data, {level: Z_BEST_COMPRESSION}),
  br: (data, path) => promisify(brotliCompress)(data, {
    params: {
      [BROTLI_PARAM_MODE]: getBrotliMode(data, path),
      [BROTLI_PARAM_QUALITY]: BROTLI_MAX_QUALITY,
    }
  }),
  zst: data => promisify(zstdCompress)(data, {params: {[ZSTD_c_strategy]: ZSTD_btultra2}}),
};
const allTypes = Object.keys(encoders);
const types = args.types ? argToArray(args.types) : allTypes;
const enabledTypes = allTypes.filter(type => types.includes(type));

function argToArray(arg: Array<string> = []) {
  return arg.flatMap(item => item.split(",")).filter(Boolean);
}

function getOutputPath(path: string, type: string) {
  const outPath = args.basedir ? relative(args.basedir, path) : path;
  const ret = args.outdir ? join(args.outdir, outPath) : outPath;
  return args.extensionless ? ret : `${ret}.${type}`;
}

async function compressFile(data: Buffer, path: string, start: number | null, type: string) {
  const newPath = getOutputPath(path, type);
  const newData = await encoders[type](data, path);
  await mkdir(dirname(newPath), {recursive: true});
  await writeFile(newPath, newData);

  if (start) {
    const ms = Math.round(performance.now() - start);
    const red = reductionText(data, newData);
    console.info(`✓ compressed ${styleText("magenta", newPath)} in ${ms}ms ${red}`);
  }
}

async function isTargetNewer(path: string, type: string) {
  try {
    const [statsSource, statsTarget] = await Promise.all([stat(path), stat(getOutputPath(path, type))]);
    return statsTarget.mtime > statsSource.mtime;
  } catch {
    return false;
  }
}

async function compress(path: string) {
  const start = (args.silent || !args.verbose) ? null : performance.now();

  const pendingTypes: Array<string> = [];
  for (const type of enabledTypes) {
    if (!args.mtime || !(await isTargetNewer(path, type))) pendingTypes.push(type);
  }
  if (!pendingTypes.length) return;

  try {
    const data = await readFile(path);
    for (const type of pendingTypes) await compressFile(data, path, start, type);
    if (args.delete) await unlink(path);
  } catch (err) {
    const {code, message} = err as NodeJS.ErrnoException;
    console.info(`Error on ${path}: ${code} ${message}`);
  }
}

function matchesPath(matcher: picomatch.Matcher, path: string) {
  return matcher(normalize(path)) || matcher(resolve(path));
}

async function main() {
  const start = args.silent ? null : performance.now();
  const includeGlobs = Array.from(new Set(argToArray(args.include)));
  const excludeGlobs = Array.from(new Set([...alwaysExclude, ...argToArray(args.exclude)]));

  const rrdirOpts: RRDirOpts = {
    include: includeGlobs.length ? includeGlobs : undefined,
    exclude: excludeGlobs,
    followSymlinks: args.follow,
    insensitive: !args.sensitive,
  };

  const picoOpts = {dot: true, nocase: !args.sensitive};
  const includeMatcher = includeGlobs.length ? picomatch(includeGlobs, picoOpts) : undefined;
  const excludeMatcher = picomatch(excludeGlobs, picoOpts);

  const files: Array<string> = [];
  for (const file of positionals) {
    if ((await stat(file)).isDirectory()) {
      for await (const entry of rrdir(file, rrdirOpts)) {
        if (!entry.directory) files.push(entry.path);
      }
    } else if (!matchesPath(excludeMatcher, file) && (!includeMatcher || matchesPath(includeMatcher, file))) {
      files.push(args.follow ? await realpath(file) : file);
    }
  }

  const filesText = `${files.length} file${files.length > 1 ? "s" : ""}`;

  if (!files.length) throw new Error(`No matching files found`);
  if (!args.silent) console.info(`precompress ${pkg.version} compressing ${filesText}...`);

  const requestedConcurrency = Number(args.concurrency);
  const concurrency = requestedConcurrency > 0 ? requestedConcurrency : Math.min(files.length, numCores);
  await pMap(files, compress, {concurrency});
  if (start) console.info(styleText("green",
    `✓ ${filesText} done in ${Math.round(performance.now() - start)}ms`,
  ));
}

try {
  await main();
  end();
} catch (err) {
  end(err as Error);
}
