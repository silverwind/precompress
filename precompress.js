#!/usr/bin/env node
"use strict";

const args = require("minimist")(process.argv.slice(2), {
  boolean: [
    "v", "verbose",
    "h", "help",
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
    v: "verbose",
    h: "help",
  },
});

const exit = err => {
  if (err) console.error(err.message || err);
  process.exit(err ? 1 : 0);
};

if (!args._.length || args.help) {
  console.info(`usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>   Types of files to generate. Default: gz,br
    -c, --concurrency <num>  Number of concurrent operations. Default: auto
    -i, --include <ext,...>  Only include given file extensions
    -e, --exclude <ext,...>  Exclude given file extensions
    -v, --verbose            Print additional information
    -h, --help               Show this text

  Examples:
    $ precompress -v build`);
  exit();
}

const util = require("util");
const fs = require("fs-extra");
const evenChunks = require("even-chunks");
const os = require("os");
const pAll = require("p-all");
const rrdir = require("rrdir");
const zlib = require("zlib");

const types = args.types ? args.types.split(",") : ["gz", "br"];

let brotli, gzip;

const opts = {
  gzip: {level: zlib.constants.Z_BEST_COMPRESSION},
  brotli: {[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY},
  iltorb: {quality: 11},
};

if (types.includes("gz")) {
  gzip = (data) => util.promisify(zlib.gzip)(data, opts.gzip);
}

if (types.includes("br")) {
  if (zlib.brotliCompress) {
    brotli = (data) => util.promisify(zlib.brotliCompress)(data, opts.brotli);
  } else {
    try {
      brotli = (data) => require("iltorb").compress(data, opts.iltorb);
    } catch (err) {}
  }
}

const time = () => {
  const t = process.hrtime();
  return Math.round((t[0] * 1e9 + t[1]) / 1e6);
};

const compress = async file => {
  let start;

  if (args.verbose) {
    start = time();
  }

  try {
    const data = await fs.readFile(file);
    if (gzip) await fs.writeFile(file + ".gz", await gzip(data));
    if (brotli) await fs.writeFile(file + ".br", await brotli(data));
  } catch (err) {
    console.info(`Error on ${file}: ${err.code}`);
  }

  if (args.verbose) {
    console.info(`Compressed ${file} in ${time() - start}ms`);
  }
};

async function main() {
  // obtain file paths
  let files = args._.map(path => {
    if (fs.statSync(path).isDirectory()) {
      return rrdir.sync(path).filter(entry => entry.directory === false).map(entry => entry.path);
    } else {
      return path;
    }
  });

  // flatten arrays
  files = [].concat(...files);

  // remove already compressed files
  files = files.filter(file => {
    return !file.endsWith(".br") && !file.endsWith(".gz");
  });

  if (args.include) {
    files = files.filter(file => args.include.split(",").some(include => file.endsWith(include)));
  }

  if (args.exclude) {
    files = files.filter(file => !args.exclude.split(",").some(exclude => file.endsWith(exclude)));
  }

  let concurrency;
  if (args.concurrency && typeof args.concurrency === "number" && args.concurrency > 0) {
    concurrency = args.concurrency;
  } else {
    concurrency = Math.min(files.length, os.cpus().length);
  }

  if (args.verbose) {
    console.info(`Going to compress ${files.length} files using ${concurrency} CPU cores`);
  }

  if (types.includes(brotli) && !brotli) {
    console.info(`Warning: iltorb module is unavailable, will not create .br files`);
  }

  // split files into chunks for each CPU
  const chunks = evenChunks(files, concurrency, evenChunks.ROUND_ROBIN);

  // within a chunk, run one compression at a time
  const chunkActions = chunks.map(files => {
    const actions = files.map(file => () => compress(file));
    return () => pAll(actions, {concurrency: 1});
  });

  // start compressing
  await pAll(chunkActions, {concurrency});
}

main().then(exit).catch(exit);
