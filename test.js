"use strict";

const assert = require("assert");
const execa = require("execa");
const {join} = require("path");
const {promisify} = require("util");
const mkdir = promisify(require("fs").mkdir);
const writeFile = promisify(require("fs").writeFile);
const readdir = promisify(require("fs").readdir);
const rimraf = promisify(require("rimraf"));

const script = join(__dirname, "precompress.js");
const dir = join(__dirname, "dir");
const file = join(__dirname, "dir", "index.html");

async function exit(err) {
  await rimraf(dir);
  if (err) console.info(err);
  process.exit(err ? 1 : 0);
}

async function main() {
  await rimraf(dir);
  await mkdir(dir);
  await writeFile(file, (new Array(1e4)).join("a"));

  await execa("node", [script, dir]);

  const files = await readdir(dir);
  assert(files.includes("index.html"));
  assert(files.includes("index.html.br"));
  assert(files.includes("index.html.gz"));
}

main().then(exit).catch(exit);
