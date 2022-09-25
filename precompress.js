#!/usr/bin/env node
import minimist from "minimist";
import pMap from "p-map";
import {rrdir} from "rrdir";
import {constants, gzip, brotliCompress} from "zlib";
import {cpus} from "os";
import {hrtime, argv, exit} from "process";
import {promisify} from "util";
import {stat, readFile, writeFile, realpath} from "fs/promises";
import {readFileSync} from "fs";

const args = minimist(argv.slice(2), {
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

function finish(err) {
  if (err) console.error(err.stack || err.message || err);
  exit(err ? 1 : 0);
}

if (args.version) {
  const {version} = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8"));
  console.info(version);
  finish();
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
  finish();
}

const types = args.types ? args.types.split(",") : ["gz", "br"];

const gzipOpts = {
  level: constants.Z_BEST_COMPRESSION,
};

const brotliOpts = {
  params: {
    [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
    [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
  }
};

let gzipEncode;
if (types.includes("gz")) {
  const gzipPromise = promisify(gzip);
  gzipEncode = data => gzipPromise(data, gzipOpts);
}

let brotliEncode;
if (types.includes("br")) {
  const brotliPromise = promisify(brotliCompress);
  brotliEncode = data => brotliPromise(data, brotliOpts);
}

// TODO: use performance.now when targeting node 16
function time() {
  const t = hrtime();
  return Math.round((t[0] * 1e9 + t[1]) / 1e6);
}

function filters(name) {
  const arg = args[name];
  if (!arg) return null;

  const arr = (Array.isArray(arg) ? arg : [arg]).flatMap(item => item.split(",")).filter(Boolean);
  if (!arr?.length) return null;

  return arr.map(ext => `**/*.${ext}`);
}

async function compress(file) {
  const start = args.silent ? null : time();

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
    if (!skipGzip && gzipEncode) await writeFile(`${file}.gz`, await gzipEncode(data));
    if (!skipBrotli && brotliEncode) await writeFile(`${file}.br`, await brotliEncode(data));
  } catch (err) {
    console.info(`Error on ${file}: ${err.code}`);
  }

  if (start) console.info(`Compressed ${file} in ${time() - start}ms`);
}

async function main() {
  const start = args.silent ? null : time();

  const rrdirOpts = {
    include: filters("include"),
    exclude: filters("exclude"),
    followSymlinks: args.follow,
  };

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
  if (start) console.info(`Done in ${time() - start}ms`);
}

main().then(finish).catch(finish);
