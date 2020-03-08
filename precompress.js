#!/usr/bin/env node
"use strict";

const minimist = require("minimist");
const pMap = require("p-map");
const rrdir = require("rrdir");
const {constants, gzip, brotliCompress} = require("zlib");
const {cpus} = require("os");
const {hrtime} = require("process");
const {promisify} = require("util");
const {stat, readFile, writeFile} = require("fs").promises;
const {version} = require("./package.json");

const args = minimist(process.argv.slice(2), {
  boolean: [
    "h", "help",
    "v", "version",
    "s", "silent",
  ],
  string: [
    "t", "types",
    "_"
  ],
  number: [
    "c", "concurrency",
  ],
  alias: {
    t: "types",
    c: "concurrency",
    i: "include",
    e: "exclude",
    h: "help",
    v: "version",
    s: "silent",
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
  gzipEncode = (data) => promisify(gzip)(data, {level: constants.Z_BEST_COMPRESSION});
}

let brotliEncode;
if (types.includes("br")) {
  brotliEncode = (data) => promisify(brotliCompress)(data, {[constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY});
}

function time() {
  const t = hrtime();
  return Math.round((t[0] * 1e9 + t[1]) / 1e6);
}

function filters(name) {
  const arg = args[name];
  if (!arg) return null;

  const arr = typeof arg === "string" ? arg.split(",").filter(v => !!v) : arg;
  if (!arr || !arr.length) return null;

  return arr.map(ext => `**/*.${ext}`);
}

async function compress(file) {
  let start;
  if (!args.silent) {
    start = time();
  }

  try {
    const data = await readFile(file);
    if (gzipEncode) await writeFile(`${file}.gz`, await gzipEncode(data));
    if (brotliEncode) await writeFile(`${file}.br`, await brotliEncode(data));
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

  // obtain file paths
  let files = [];
  for (const file of args._) {
    const stats = await stat(file);
    if (stats.isDirectory()) {
      for await (const entry of rrdir.stream(file, {include: filters("include"), exclude: filters("exclude")})) {
        if (!entry.directory) {
          files.push(entry.path);
        }
      }
    } else {
      files.push(file);
    }
  }

  // exclude already compressed files
  files = files.filter(file => {
    return !file.endsWith(".br") && !file.endsWith(".gz");
  });

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
