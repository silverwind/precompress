#!/usr/bin/env node
import minimist from "minimist";
import pMap from "p-map";
import {rrdir} from "rrdir";
import {constants, gzip, brotliCompress} from "node:zlib";
import os from "node:os";
import {argv, exit, versions} from "node:process";
import {promisify} from "node:util";
import {stat, readFile, writeFile, realpath} from "node:fs/promises";
import {extname} from "node:path";
import {isBinaryFileSync} from "isbinaryfile";
import {readFileSync} from "node:fs";
import supportsColor from "supports-color";
import {green, magenta, cyan, red, yellow, disableColor} from "glowie";

const alwaysExclude = ["gz", "br"];
const numCores = os.availableParallelism?.() ?? os.cpus().length ?? 4;

// raise libuv threadpool over default 4 when more cores are available
if (versions?.uv && numCores > 4) {
  process.env.UV_THREADPOOL_SIZE = String(numCores);
}

const args = minimist(argv.slice(2), {
  boolean: [
    "f", "follow",
    "h", "help",
    "m", "mtime",
    "s", "silent",
    "S", "sensitive",
    "v", "version",
    "V", "verbose",
  ],
  string: [
    "t", "types",
    "_"
  ],
  number: [
    "c", "concurrency",
  ],
  alias: {
    c: "concurrency",
    e: "exclude",
    h: "help",
    i: "include",
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
    return `(${green(change)}%)`;
  } else if (change <= 100) {
    return `(${yellow(change)}%)`;
  } else {
    return `(${red(change)}%)`;
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
  if (typeof arg === "boolean") return [];
  return (Array.isArray(arg) ? arg : [arg]).flatMap(item => item.split(",")).filter(Boolean);
}

async function compress(file) {
  const start = (args.silent || !args.verbose) ? null : performance.now();

  let skipGzip = false, skipBrotli = false;
  if (args.mtime && gzipEncode) {
    try {
      const [statsSource, statsTarget] = await Promise.all([stat(file), stat(`${file}.gz`)]);
      if (statsSource && statsTarget && statsTarget.mtime > statsSource.mtime) skipGzip = true;
    } catch {}
  }
  if (args.mtime && brotliEncode) {
    try {
      const [statsSource, statsTarget] = await Promise.all([stat(file), stat(`${file}.br`)]);
      if (statsSource && statsTarget && statsTarget.mtime > statsSource.mtime) skipBrotli = true;
    } catch {}
  }
  if (skipGzip && skipBrotli) return;

  try {
    const data = await readFile(file);
    if (!skipGzip && gzipEncode) {
      const newFile = `${file}.gz`;
      const newData = await gzipEncode(data);
      await writeFile(newFile, newData);

      if (start) {
        const ms = Math.round(performance.now() - start);
        const red = reductionText(data, newData);
        console.info(`✓ compressed ${magenta(newFile)} in ${ms}ms ${red}`);
      }
    }
    if (!skipBrotli && brotliEncode) {
      const newFile = `${file}.br`;
      const newData = await brotliEncode(data, file);
      await writeFile(newFile, newData);
      if (start) {
        const ms = Math.round(performance.now() - start);
        const red = reductionText(data, newData);
        console.info(`✓ compressed ${magenta(newFile)} in ${ms}ms ${red}`);
      }
    }
  } catch (err) {
    console.info(`Error on ${file}: ${err.code}`);
  }
}

const extGlob = ext => `**/*.${ext}`;

async function main() {
  const start = args.silent ? null : performance.now();
  const rrdirOpts = {
    include: args.include ? argToArray(args.include).map(extGlob) : null,
    exclude: [
      ...alwaysExclude,
      ...(args.exclude ? argToArray(args.exclude) : [])
    ].map(extGlob),
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
      files.push(args.follow ? await realpath(file) : file);
    }
  }

  const filesText = `${files.length} file${files.length > 1 ? "s" : ""}`;

  if (!files.length) throw new Error(`No matching files found`);
  if (!args.silent) console.info(`${cyan(`precompress ${version}`)} ${green(`compressing ${filesText}...`)}`);

  const concurrency = args.concurrency > 0 ? args.concurrency : Math.min(files.length, numCores);
  await pMap(files, compress, {concurrency});
  if (start) console.info(green(
    `✓ done in ${Math.round(performance.now() - start)}ms`,
  ));
}

main().then(finish).catch(finish);
