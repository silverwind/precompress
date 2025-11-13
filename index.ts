#!/usr/bin/env node
import minimist from "minimist";
import pMap from "p-map";
import {rrdir} from "rrdir";
import {constants, gzip, brotliCompress, zstdCompress} from "node:zlib";
import {availableParallelism, cpus} from "node:os";
import {argv, exit, versions, env} from "node:process";
import {promisify, styleText} from "node:util";
import {stat, readFile, writeFile, realpath, mkdir, unlink} from "node:fs/promises";
import {extname, relative, join, dirname} from "node:path";
import {isBinaryFileSync} from "isbinaryfile";
import picomatch from "picomatch";
import pkg from "./package.json" with {type: "json"};

const packageVersion = pkg.version || "0.0.0";
const alwaysExclude = ["**.gz", "**.br", "**.zst"];
const numCores = availableParallelism?.() ?? cpus().length ?? 4;

// raise libuv threadpool over default 4 when more cores are available
if (versions?.uv && numCores > 4) {
  env.UV_THREADPOOL_SIZE = String(numCores);
}

const args = minimist(argv.slice(2), {
  boolean: [
    "d", "delete",
    "E", "extensionless",
    "f", "follow",
    "h", "help",
    "m", "mtime",
    "s", "silent",
    "S", "sensitive",
    "v", "version",
    "V", "verbose",
  ],
  string: [
    "b", "basedir",
    "o", "outdir",
    "t", "types",
    "_"
  ],
  // @ts-expect-error
  number: [
    "c", "concurrency",
  ],
  alias: {
    b: "basedir",
    c: "concurrency",
    d: "delete",
    e: "exclude",
    E: "extensionless",
    h: "help",
    i: "include",
    o: "outdir",
    m: "mtime",
    s: "silent",
    S: "sensitive",
    t: "types",
    v: "version",
    V: "verbose",
  },
});

function finish(err: Error | void) {
  if (err) console.error(err.stack || err.message || err);
  exit(err ? 1 : 0);
}

if (args.version) {
  console.info(packageVersion);
  finish();
}

if (!args._.length || args.help) {
  console.info(`usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>    Types of files to generate. Default: gz,br,zst
    -i, --include <glob,...>  Only include given globs. Default: unset
    -e, --exclude <glob,...>  Exclude given globs. Default: ${alwaysExclude}
    -m, --mtime               Skip creating existing files when source file is newer
    -f, --follow              Follow symbolic links
    -d, --delete              Delete source file after compression
    -o, --outdir              Output directory, will preserve relative path structure
    -b, --basedir             Base directory to derive output path, use with --outdir
    -E, --extensionless       Do not output a extension, use with single --type and --outdir
    -s, --silent              Do not print anything
    -S, --sensitive           Treat include and exclude patterns case-sensitively
    -c, --concurrency <num>   Number of concurrent operations. Default: auto
    -V, --verbose             Print individual file compression times
    -h, --help                Show this text
    -v, --version             Show the version

  Examples:
    $ precompress ./build`);
  finish();
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
  const change = (((newData.byteLength / data.byteLength) * 100));

  if (change <= 80) {
    return `(${styleText("green", `${change.toPrecision(3)}%`)} size)`;
  } else if (change < 100) {
    return `(${styleText("yellow", `${change.toPrecision(3)}%`)} size)`;
  } else {
    return `(${styleText("red", `${change.toPrecision(3)}%`)} size)`;
  }
}

const types = args.types ? args.types.split(",") : ["gz", "br", "zst"];

const gzipEncode = types.includes("gz") && ((data: Buffer) => promisify(gzip)(data, {
  level: Z_BEST_COMPRESSION,
}));
const brotliEncode = types.includes("br") && ((data: Buffer, path: string) => promisify(brotliCompress)(data, {
  params: {
    [BROTLI_PARAM_MODE]: getBrotliMode(data, path),
    [BROTLI_PARAM_QUALITY]: BROTLI_MAX_QUALITY,
  }
}));
const zstdEncode = types.includes("zst") && ((data: Buffer) => promisify(zstdCompress)(data, {
  params: {
    [ZSTD_c_strategy]: ZSTD_btultra2,
  }
}));

function argToArray(arg: boolean | Array<string>) {
  if (typeof arg === "boolean" || !arg) return [];
  return (Array.isArray(arg) ? arg : [arg]).flatMap(item => item.split(",")).filter(Boolean);
}

function getOutputPath(path: string, type: string) {
  const outPath = args.basedir ? relative(args.basedir, path) : path;
  const ret = args.outdir ? join(args.outdir, outPath) : outPath;
  return args.extensionless ? ret : `${ret}.${type}`;
}

async function compressFile(data: Buffer, path: string, start: number, type: string) {
  const newPath = getOutputPath(path, type);
  let newData: Buffer;
  if (type === "gz") {
    newData = await gzipEncode(data);
  } else if (type === "br") {
    newData = await brotliEncode(data, path);
  } else if (type === "zst") {
    newData = await zstdEncode(data);
  }
  await mkdir(dirname(newPath), {recursive: true});
  await writeFile(newPath, newData);
  if (args.delete) await unlink(path);

  if (start) {
    const ms = Math.round(performance.now() - start);
    const red = reductionText(data, newData);
    console.info(`✓ compressed ${styleText("magenta", newPath)} in ${ms}ms ${red}`);
  }
}

async function compress(path: string) {
  const start = (args.silent || !args.verbose) ? null : performance.now();

  let skipGzip = false;
  let skipBrotli = false;
  let skipZstd = false;

  if (args.mtime && gzipEncode) {
    try {
      const [statsSource, statsTarget] = await Promise.all([stat(path), stat(`${path}.gz`)]);
      if (statsSource && statsTarget && statsTarget.mtime > statsSource.mtime) {
        skipGzip = true;
      }
    } catch {}
  }
  if (args.mtime && brotliEncode) {
    try {
      const [statsSource, statsTarget] = await Promise.all([stat(path), stat(`${path}.br`)]);
      if (statsSource && statsTarget && statsTarget.mtime > statsSource.mtime) {
        skipBrotli = true;
      }
    } catch {}
  }
  if (args.mtime && zstdEncode) {
    try {
      const [statsSource, statsTarget] = await Promise.all([stat(path), stat(`${path}.zst`)]);
      if (statsSource && statsTarget && statsTarget.mtime > statsSource.mtime) {
        skipZstd = true;
      }
    } catch {}
  }
  if (skipGzip && skipBrotli && skipZstd) return;

  try {
    const data = await readFile(path);

    if (!skipGzip && gzipEncode) await compressFile(data, path, start, "gz");
    if (!skipBrotli && brotliEncode) await compressFile(data, path, start, "br");
    if (!skipZstd && zstdEncode) await compressFile(data, path, start, "zst");
  } catch (err) {
    console.info(`Error on ${path}: ${err.code} ${err.message}`);
  }
}

function isIncluded(path: string, includeMatcher: (path: string) => boolean, excludeMatcher: (path: string) => boolean) {
  if (excludeMatcher?.(path)) return false;
  if (!includeMatcher) return true;
  return includeMatcher(path);
}

async function main() {
  const start = args.silent ? null : performance.now();
  const includeGlobs = new Set(argToArray(args.include));
  const excludeGlobs = new Set([...alwaysExclude, ...argToArray(args.exclude)]);

  const rrdirOpts = {
    include: includeGlobs.size ? Array.from(includeGlobs) : null,
    exclude: excludeGlobs.size ? Array.from(excludeGlobs) : null,
    followSymlinks: args.follow,
    insensitive: !args.sensitive,
  };

  const picoOpts = {dot: true, flags: args.sensitive ? "i" : undefined};
  const includeMatcher = includeGlobs.size && picomatch(Array.from(includeGlobs), picoOpts);
  const excludeMatcher = excludeGlobs.size && picomatch(Array.from(excludeGlobs), picoOpts);

  const files = [];
  for (const file of args._) {
    const stats = await stat(file);
    if (stats.isDirectory()) {
      for await (const entry of rrdir(file, rrdirOpts)) {
        if (!entry.directory) files.push(entry.path);
      }
    } else {
      if (isIncluded(file, includeMatcher, excludeMatcher)) {
        files.push(args.follow ? await realpath(file) : file);
      }
    }
  }

  const filesText = `${files.length} file${files.length > 1 ? "s" : ""}`;

  if (!files.length) throw new Error(`No matching files found`);
  if (!args.silent) console.info(`precompress ${packageVersion} compressing ${filesText}...`);

  const concurrency = args.concurrency > 0 ? args.concurrency : Math.min(files.length, numCores);
  await pMap(files, compress, {concurrency});
  if (start) console.info(styleText("green",
    `✓ ${filesText} done in ${Math.round(performance.now() - start)}ms`,
  ));
}

main().then(finish).catch(finish);
