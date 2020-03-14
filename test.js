"use strict";

const del = require("del");
const execa = require("execa");
const tempy = require("tempy");
const {join} = require("path");
const {chdir} = require("process");
const {writeFileSync, readdirSync} = require("fs");
const {test, expect, beforeEach, afterAll} = global;
const testDir = tempy.directory();
const {bin} = require("./package.json");

beforeEach(() => {
  chdir(testDir);
  del.sync("*");
  writeFileSync("index.html", (new Array(1e4)).join("index"));
  writeFileSync("image.png", (new Array(1e4)).join("image"));
});

afterAll(() => {
  del.sync(testDir, {force: true});
});

async function run(args) {
  const argsArr = [".", ...args.split(/\s+/).map(s => s.trim()).filter(s => !!s)];
  return execa(join(__dirname, bin), argsArr, {cwd: testDir});
}

function makeTest(args, expected) {
  return async () => {
    await run(args);
    expect(readdirSync(testDir).sort()).toEqual(expected.sort());
  };
}

test("simple", makeTest("", ["index.html", "index.html.br", "index.html.gz", "image.png", "image.png.br", "image.png.gz"]));

test("exclude", makeTest("-e png", ["index.html", "index.html.br", "index.html.gz", "image.png"]));

test("error", async () => {
  await expect(run("-e png,html")).rejects.toThrow();
});
