import del from "del";
import execa from "execa";
import tempy from "tempy";
import {join, dirname} from "path";
import {chdir} from "process";
import {fileURLToPath} from "url";
import {writeFileSync, readdirSync} from "fs";
const {test, expect, beforeEach, afterAll} = global;
const testDir = tempy.directory();

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  return execa(join(__dirname, "bin/precompress.js"), argsArr, {cwd: testDir});
}

function makeTest(args, expected) {
  return async () => {
    await run(args);
    expect(readdirSync(testDir).sort()).toEqual(expected.sort());
  };
}

test("simple", makeTest("", [
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png",
  "image.png.br",
  "image.png.gz"
]));

test("exclude", makeTest("-e png", [
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png"
]));

test("exclude #2", makeTest("-e png -e png,png", [
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png"
]));

test("mtime", makeTest("-m", [
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png",
  "image.png.br",
  "image.png.gz"
]));

test("error", async () => {
  await expect(run("-e png,html")).rejects.toThrow();
});
