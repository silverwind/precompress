#!/usr/bin/env node
"use strict";

const args = require("minimist")(process.argv.slice(2), {
  boolean: [
    "h", "help",
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
    t: "types",
    c: "concurrency",
    i: "include",
    e: "exclude",
    h: "help",
    v: "version",
  },
});

const exit = err => {
  if (err) console.error(err.stack || err.message || err);
  process.exit(err ? 1 : 0);
};

if (args.version) {
  console.info(require(require("path").join(__dirname, "package.json")).version);
  process.exit(0);
}

if (!args._.length || args.help) {
  console.info(`usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>   Types of files to generate. Default: gz,br
    -c, --concurrency <num>  Number of concurrent operations. Default: auto
    -i, --include <ext,...>  Only include given file extensions
    -e, --exclude <ext,...>  Exclude given file extensions
    -h, --help               Show this text
    -v, --version            Show the version

  Examples:
    $ precompress build`);
  exit();
}

const {promisify} = require("util");
const stat = promisify(require("fs").stat);
const readFile = promisify(require("fs").readFile);
const writeFile = promisify(require("fs").writeFile);
const os = require("os");
const pMap = require("p-map");
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
  gzip = (data) => promisify(zlib.gzip)(data, opts.gzip);
}

if (types.includes("br")) {
  if (zlib.brotliCompress) {
    brotli = (data) => promisify(zlib.brotliCompress)(data, opts.brotli);
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
  const start = time();

  try {
    const data = await readFile(file);
    if (gzip) await writeFile(file + ".gz", await gzip(data));
    if (brotli) await writeFile(file + ".br", await brotli(data));
  } catch (err) {
    console.info(`Error on ${file}: ${err.code}`);
  }

  console.info(`Compressed ${file} in ${time() - start}ms`);
};

async function main() {
  const start = time();

  // obtain file paths
  let files = [];
  for (const file of args._) {
    const stats = await stat(file);
    if (stats.isDirectory()) {
      for await (const entry of rrdir.stream(file)) {
        if (!entry.directory) {
          files.push(entry.path);
        }
      }
    } else {
      files.push(file);
    }
  }

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

  if (types.includes(brotli) && !brotli) {
    console.info(`Warning: iltorb module is unavailable, will not create .br files`);
  }

  await pMap(files, compress, {concurrency});
  console.info(`Done in ${time() - start}ms`);
}

main().then(exit).catch(exit);
