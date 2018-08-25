#!/usr/bin/env node
"use strict";

const args = require("minimist")(process.argv.slice(2), {
  boolean: [
    "v", "verbose",
    "h", "help",
  ],
  alias: {
    i: "include",
    e: "exclude",
    v: "verbose",
    h: "help",
  },
});

if (!args._.length || args.help) {
  console.info(`usage: precompress [FILES,DIRS]...

  Options:
    -i, --include <ext,...>  Only include given file extensions
    -e, --exclude <ext,...>  Exclude given file extensions
    -v, --verbose            Print additional information
    -h, --help               Show this text

  Examples:
    $ precompress -v build`);
}

const util = require("util");
const fs = require("fs-extra");
const gzip = util.promisify(require("zlib").gzip);
const brotli = require("iltorb").compress;
const evenChunks = require("even-chunks");
const os = require("os");
const pAll = require("p-all");

const walkSync = function(dir) {
  let files = [];
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const path = dir + "/" + entry;
    if (fs.statSync(path).isDirectory()) {
      files = files.concat(walkSync(path));
    } else {
      files.push(path);
    }
  }
  return files;
};

const time = () => {
  const t = process.hrtime();
  return Math.round((t[0] * 1e9 + t[1]) / 1e6);
};

const compress = async file => {
  let start;

  if (args.verbose) {
    start = time();
  }

  const data = await fs.readFile(file);
  await fs.writeFile(file + ".gz", await gzip(data));
  await fs.writeFile(file + ".br", await brotli(data));

  if (args.verbose) {
    console.info(`Compressed ${file} in ${time() - start}ms`);
  }
};

const exit = err => {
  if (err) console.error(err.message || err);
  process.exit(err ? 1 : 0);
};

(async () => {
  let files;

  try {
    // obtain file paths
    files = args._.map(path => {
      return fs.statSync(path).isDirectory() ? walkSync(path) : path;
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

    const concurrency = Math.min(files.length, os.cpus().length);

    if (args.verbose) {
      console.info(`Going to compress ${files.length} files using ${concurrency} cores`);
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
  } catch (err) {
    exit(err);
  }
})();
