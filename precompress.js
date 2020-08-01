#!/usr/bin/env node
"use strict";

const minimist = require("minimist");
const pMap = require("p-map");
const rrdir = require("rrdir");
const {constants, gzip, brotliCompress} = require("zlib");
const {cpus} = require("os");
const {hrtime} = require("process");
const {promisify} = require("util");
const {stat, readFile, writeFile, realpath} = require("fs").promises;
const {version} = require("./package.json");

const args = minimist(process.argv.slice(2), {
  boolean: [
    "f", "follow",
    "h", "help",
    "m", "mtime",
    "s", "silent",
    "v", "version",
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
    t: "types",
    v: "version",
  },
});

function exit(err) {
  if (err) console.error(err.stack || err.message || err);
  process.exit(err ? 1 : 0);
}

if (args.version) {
  console.info(version);
  process.exit(0);
}

if (!args._.length || args.help) {
  console.info(`usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>   Types of files to generate. Default: gz,br
    -c, --concurrency <num>  Number of concurrent operations. Default: auto
    -i, --include <ext,...>  Only include given file extensions
    -e, --exclude <ext,...>  Exclude given file extensions
    -m, --mtime              Skip creating existing files when source file is newer
    -f, --follow             Follow symbolic links
    -s, --silent             Do not print compression times
    -h, --help               Show this text
    -v, --version            Show the version

  Examples:
    $ precompress build`);
  exit();
}

const types = args.types ? args.types.split(",") : ["gz", "br"];

let gzipEncode;
if (types.includes("gz")) {
  const gzipPromise = promisify(gzip);
  const gzipOpts = {level: constants.Z_BEST_COMPRESSION};
  gzipEncode = (data) => gzipPromise(data, gzipOpts);
}

let brotliEncode;
if (types.includes("br")) {
  const brotliPromise = promisify(brotliCompress);
  const brotliOpts = {[constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY};
  brotliEncode = (data) => brotliPromise(data, brotliOpts);
}

function flat(arr) {
  return [].concat(...arr);
}

function time() {
  const t = hrtime();
  return Math.round((t[0] * 1e9 + t[1]) / 1e6);
}

function filters(name) {
  const arg = args[name];
  if (!arg) return null;

  const arr = flat((Array.isArray(arg) ? arg : [arg]).map(item => item.split(","))).filter(v => !!v);
  if (!arr || !arr.length) return null;

  return arr.map(ext => `**/*.${ext}`);
}

async function compress(file) {
  let start;
  if (!args.silent) {
    start = time();
  }

  let skipGzip = false, skipBrotli = false;
  if (args.mtime) {
    if (gzipEncode) {
      try {
        const [statsSource, statsTarget] = await Promise.all([stat(file), stat(`${file}.gz`)]);
        if (statsSource && statsTarget && statsTarget.mtime > statsSource.mtime) skipGzip = true;
      } catch {}
    }
    if (brotliEncode) {
      try {
        const [statsSource, statsTarget] = await Promise.all([stat(file), stat(`${file}.br`)]);
        if (statsSource && statsTarget && statsTarget.mtime > statsSource.mtime) skipBrotli = true;
      } catch {}
    }
  }

  if (skipBrotli && skipGzip) return;

  try {
    const data = await readFile(file);
    if (!skipGzip && gzipEncode) await writeFile(`${file}.gz`, await gzipEncode(data));
    if (!skipBrotli && brotliEncode) await writeFile(`${file}.br`, await brotliEncode(data));
  } catch (err) {
    console.info(`Error on ${file}: ${err.code}`);
  }

  if (!args.silent) {
    console.info(`Compressed ${file} in ${time() - start}ms`);
  }
}

async function main() {
  let start;
  if (!args.silent) {
    start = time();
  }

  const rrdirOpts = {
    include: filters("include"),
    exclude: filters("exclude"),
  };

  if (args.follow) {
    rrdirOpts.followSymlinks = true;
  }

  // obtain file paths
  let files = [];
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

  // exclude already compressed files
  files = files.filter(file => {
    return !file.endsWith(".br") && !file.endsWith(".gz");
  });

  if (!files.length) {
    throw new Error(`No matching files found`);
  }

  let concurrency;
  if (args.concurrency && typeof args.concurrency === "number" && args.concurrency > 0) {
    concurrency = args.concurrency;
  } else {
    concurrency = Math.min(files.length, cpus().length);
  }

  await pMap(files, compress, {concurrency});

  if (!args.silent) {
    console.info(`Done in ${time() - start}ms`);
  }
}

main().then(exit).catch(exit);
