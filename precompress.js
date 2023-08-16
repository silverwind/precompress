#!/usr/bin/env node
import minimist from "minimist";
import pMap from "p-map";
import {rrdir} from "rrdir";
import {constants, gzip, brotliCompress} from "node:zlib";
import os from "node:os";
import {argv, exit, versions} from "node:process";
import {promisify} from "node:util";
import {stat, readFile, writeFile, realpath, mkdir, unlink} from "node:fs/promises";
import {extname, relative, join, dirname} from "node:path";
import {isBinaryFileSync} from "isbinaryfile";
import {readFileSync} from "node:fs";
import supportsColor from "supports-color";
import {green, magenta, red, yellow, disableColor} from "glowie";

const alwaysExclude = ["gz", "br"];
const numCores = os.availableParallelism?.() ?? os.cpus().length ?? 4;

// raise libuv threadpool over default 4 when more cores are available
if (versions?.uv && numCores > 4) {
  process.env.UV_THREADPOOL_SIZE = String(numCores);
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

if (!supportsColor.stdout) disableColor();

function finish(err) {
  if (err) console.error(err.stack || err.message || err);
  exit(err ? 1 : 0);
}

let version = import.meta.VERSION;
if (!version) {
  version = JSON.parse(readFileSync(new URL("package.json", import.meta.url))).version;
}

if (args.version) {
  console.info(import.meta.VERSION);
  finish();
}

if (!args._.length || args.help) {
  console.info(`usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>   Types of files to generate. Default: gz,br
    -c, --concurrency <num>  Number of concurrent operations. Default: auto
    -i, --include <ext,...>  Only include given file extensions. Default: unset
    -e, --exclude <ext,...>  Exclude given file extensions. Default: ${alwaysExclude}
    -m, --mtime              Skip creating existing files when source file is newer
    -f, --follow             Follow symbolic links
    -d, --delete             Delete source file after compression
    -o, --outdir             Output directory, will preserve relative path structure
    -b, --basedir            Base directory to derive output path, use with --outdir
    -E, --extensionless      Do not output a extension, use with single --type and --outdir
    -s, --silent             Do not print anything
    -S, --sensitive          Treat include and exclude patterns case-sensitively
    -V, --verbose            Print individual file compression times
    -h, --help               Show this text
    -v, --version            Show the version

  Examples:
    $ precompress ./build`);
  finish();
}

function getBrotliMode(data, path) {
  if (extname(path).toLowerCase() === ".woff2") {
    return constants.BROTLI_MODE_FONT;
  } else if (isBinaryFileSync(data)) {
    return constants.BROTLI_MODE_GENERIC;
  } else {
    return constants.BROTLI_MODE_TEXT;
  }
}

function reductionText(data, newData) {
  const change = (((newData.byteLength / data.byteLength) * 100)).toPrecision(3);

  if (change <= 80) {
    return `(${green(`${change}%`)} size)`;
  } else if (change < 100) {
    return `(${yellow(`${change}%`)} size)`;
  } else {
    return `(${red(`${change}%`)} size)`;
  }
}

const types = args.types ? args.types.split(",") : ["gz", "br"];
const gzipEncode = types.includes("gz") && (data => promisify(gzip)(data, {
  level: constants.Z_BEST_COMPRESSION,
}));
const brotliEncode = types.includes("br") && ((data, path) => promisify(brotliCompress)(data, {
  params: {
    [constants.BROTLI_PARAM_MODE]: getBrotliMode(data, path),
    [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
  }
}));

function argToArray(arg) {
  if (typeof arg === "boolean" || !arg) return [];
  return (Array.isArray(arg) ? arg : [arg]).flatMap(item => item.split(",")).filter(Boolean);
}

function getOutputPath(path, ext) {
  const outPath = args.basedir ? relative(args.basedir, path) : path;
  const ret = args.outdir ? join(args.outdir, outPath) : outPath;
  return args.extensionless ? ret : `${ret}${ext}`;
}

async function compress(path) {
  const start = (args.silent || !args.verbose) ? null : performance.now();

  let skipGzip = false, skipBrotli = false;
  if (args.mtime && gzipEncode) {
    try {
      const [statsSource, statsTarget] = await Promise.all([stat(path), stat(`${path}.gz`)]);
      if (statsSource && statsTarget && statsTarget.mtime > statsSource.mtime) skipGzip = true;
    } catch {}
  }
  if (args.mtime && brotliEncode) {
    try {
      const [statsSource, statsTarget] = await Promise.all([stat(path), stat(`${path}.br`)]);
      if (statsSource && statsTarget && statsTarget.mtime > statsSource.mtime) skipBrotli = true;
    } catch {}
  }
  if (skipGzip && skipBrotli) return;

  try {
    const data = await readFile(path);
    if (!skipGzip && gzipEncode) {
      const newPath = getOutputPath(path, ".gz");
      const newData = await gzipEncode(data);
      await mkdir(dirname(newPath), {recursive: true});
      await writeFile(newPath, newData);
      if (args.delete) await unlink(path);

      if (start) {
        const ms = Math.round(performance.now() - start);
        const red = reductionText(data, newData);
        console.info(`✓ compressed ${magenta(newPath)} in ${ms}ms ${red}`);
      }
    }
    if (!skipBrotli && brotliEncode) {
      const newPath = getOutputPath(path, ".br");
      const newData = await brotliEncode(data, path);
      await mkdir(dirname(newPath), {recursive: true});
      await writeFile(newPath, newData);
      if (args.delete) await unlink(path);
      if (start) {
        const ms = Math.round(performance.now() - start);
        const red = reductionText(data, newData);
        console.info(`✓ compressed ${magenta(newPath)} in ${ms}ms ${red}`);
      }
    }
  } catch (err) {
    console.info(`Error on ${path}: ${err.code}`);
  }
}

async function main() {
  const start = args.silent ? null : performance.now();
  const includeExts = new Set(Array.from(argToArray(args.include), ext => `.${ext}`));
  const excludeExts = new Set([
    ...alwaysExclude,
    ...argToArray(args.exclude),
  ].map(ext => `.${ext}`));

  const rrdirOpts = {
    include: includeExts.size ? Array.from(includeExts, ext => `**/*${ext}`) : null,
    exclude: excludeExts.size ? Array.from(excludeExts, ext => `**/*${ext}`) : null,
    followSymlinks: args.follow,
    insensitive: !args.sensitive,
  };

  const files = [];
  for (const file of args._) {
    const stats = await stat(file);
    if (stats.isDirectory()) {
      for await (const entry of rrdir(file, rrdirOpts)) {
        if (!entry.directory) files.push(entry.path);
      }
    } else {
      let include;
      const ext = extname(file);
      if (ext) {
        if (includeExts.size) {
          include = !excludeExts.has(ext);
        } else {
          include = includeExts.has(ext);
        }
      } else {
        include = true;
      }
      if (include) {
        files.push(args.follow ? await realpath(file) : file);
      }
    }
  }

  const filesText = `${files.length} file${files.length > 1 ? "s" : ""}`;

  if (!files.length) throw new Error(`No matching files found`);
  if (!args.silent) console.info(`precompress ${version} compressing ${filesText}...`);

  const concurrency = args.concurrency > 0 ? args.concurrency : Math.min(files.length, numCores);
  await pMap(files, compress, {concurrency});
  if (start) console.info(green(
    `✓ ${filesText} done in ${Math.round(performance.now() - start)}ms`,
  ));
}

main().then(finish).catch(finish);
