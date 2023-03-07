#!/usr/bin/env node
import minimist from "minimist";
import pMap from "p-map";
import {rrdir} from "rrdir";
import {constants, gzip, brotliCompress} from "node:zlib";
import {cpus} from "node:os";
import {argv, exit} from "node:process";
import {promisify} from "node:util";
import {stat, readFile, writeFile, realpath} from "node:fs/promises";

const alwaysExclude = ["gz", "br"];
const defaultExclude = ["apng", "avif", "gif", "jpg", "png", "webp"];

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

function finish(err) {
  if (err) console.error(err.stack || err.message || err);
  exit(err ? 1 : 0);
}

if (args.version) {
  console.info(import.meta.VERSION);
  finish();
}

if (!args._.length || args.help) {
  const excludes = [...alwaysExclude, ...defaultExclude].sort().join(",");
  console.info(`usage: precompress [options] <files,dirs,...>

  Options:
    -t, --types <type,...>   Types of files to generate. Default: gz,br
    -c, --concurrency <num>  Number of concurrent operations. Default: auto
    -i, --include <ext,...>  Only include given file extensions. Default: unset
    -e, --exclude <ext,...>  Exclude given file extensions. Default: ${excludes}
    -m, --mtime              Skip creating existing files when source file is newer
    -f, --follow             Follow symbolic links
    -s, --silent             Do not print anything
    -S, --sensitive          Treat include and exclude patterns case-sensitively
    -V, --verbose            Print individual file compression times
    -h, --help               Show this text
    -v, --version            Show the version

  Examples:
    $ precompress build`);
  finish();
}

const types = args.types ? args.types.split(",") : ["gz", "br"];
const gzipEncode = types.includes("gz") && (data => promisify(gzip)(data, {
  level: constants.Z_BEST_COMPRESSION,
}));
const brotliEncode = types.includes("br") && (data => promisify(brotliCompress)(data, {
  params: {
    [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
    [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
  }
}));
const extGlob = ext => `**/*.${ext}`;

function argToArray(arg) {
  if (typeof arg === "boolean") return [];
  return (Array.isArray(arg) ? arg : [arg]).flatMap(item => item.split(",")).filter(Boolean);
}

function getExcludes() {
  if (!args.exclude) {
    return [...alwaysExclude, ...defaultExclude].map(extGlob);
  } else {
    return [...alwaysExclude, ...argToArray(args.exclude)].map(extGlob);
  }
}

function getIncludes() {
  if (!args.include) {
    return null;
  } else {
    return [argToArray(args.include)].map(extGlob);
  }
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
    if (!skipGzip && gzipEncode) await writeFile(`${file}.gz`, await gzipEncode(data));
    if (!skipBrotli && brotliEncode) await writeFile(`${file}.br`, await brotliEncode(data));
  } catch (err) {
    console.info(`Error on ${file}: ${err.code}`);
  }

  if (start) console.info(`Compressed ${file} in ${Math.round(performance.now() - start)}ms`);
}

async function main() {
  const start = args.silent ? null : performance.now();

  const rrdirOpts = {
    include: getIncludes(),
    exclude: getExcludes(),
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
  if (!args.silent) console.info(`Compressing ${filesText}...`);

  const concurrency = args.concurrency > 0 ? args.concurrency : Math.min(files.length, cpus().length);
  await pMap(files, compress, {concurrency});
  if (start) console.info(`Compressed ${filesText} in ${Math.round(performance.now() - start)}ms`);
}

main().then(finish).catch(finish);
