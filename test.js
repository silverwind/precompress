"use strict";

const del = require("del");
const execa = require("execa");
const {join} = require("path");
const {mkdir, writeFile, readdir} = require("fs").promises;
const {test, expect, beforeAll, afterAll} = global;

const script = join(__dirname, "precompress");
const dir = join(__dirname, "dir");
const file = join(__dirname, "dir", "index.html");

beforeAll(async () => {
  await del(dir);
  await mkdir(dir);
  await writeFile(file, (new Array(1e4)).join("a"));
});

test("simple compress", async () => {
  await execa("node", [script, dir]);
  const files = await readdir(dir);
  expect(files).toContain("index.html");
  expect(files).toContain("index.html.br");
  expect(files).toContain("index.html.gz");
});

afterAll(async () => {
  await del(dir);
});
