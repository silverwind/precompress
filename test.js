"use strict";

const assert = require("assert");
const tempy = require("tempy");
const execa = require("execa");
const path = require("path");
const fs = require("fs-extra");
const util = require("util");
const rimraf = util.promisify(require("rimraf"));

function exit(err) {
  if (err) console.info(err);
  process.exit(err ? 1 : 0);
}

async function main() {
  const dir = tempy.directory();
  const textfile = path.join(dir, "index.html");

  await fs.writeFile(textfile, (new Array(1e4)).join("a"));
  await execa("node", [path.join(__dirname, "precompress.js"), dir]);

  const files = await fs.readdir(dir);
  assert(files.includes("index.html"));
  assert(files.includes("index.html.br"));
  assert(files.includes("index.html.gz"));

  await rimraf(dir);
}

main().then(exit).catch(exit);
