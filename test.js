import {deleteSync} from "del";
import {execa} from "execa";
import {temporaryDirectory} from "tempy";
import {fileURLToPath} from "node:url";
import {writeFileSync, readdirSync, readFileSync} from "node:fs";

const testDir = temporaryDirectory();
const script = fileURLToPath(new URL("bin/precompress.js", import.meta.url));

beforeEach(() => {
  deleteSync(`${testDir}/*`, {force: true});
  writeFileSync(`${testDir}/index.html`, (new Array(1e4)).join("index"));
  writeFileSync(`${testDir}/already.gz`, (new Array(1e4)).join("index"));
  writeFileSync(`${testDir}/image.png`, (new Array(1e4)).join("image"));
});

afterAll(() => {
  deleteSync(testDir, {force: true});
});

async function run(args) {
  const argsArr = [".", ...args.split(/\s+/).map(s => s.trim()).filter(Boolean)];
  return execa(script, argsArr, {cwd: testDir});
}

function makeTest(args, expected) {
  return async () => {
    await run(args);
    expect(readdirSync(testDir).sort()).toEqual(expected.sort());
  };
}

test("version", async () => {
  const {version: expected} = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8"));
  const {stdout, exitCode} = await execa("node", [script, "-v"]);
  expect(stdout).toEqual(expected);
  expect(exitCode).toEqual(0);
});

test("simple", makeTest("", [
  "already.gz",
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png",
  "image.png.br",
  "image.png.gz",
]));

test("include", makeTest("-i html,foo", [
  "already.gz",
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png",
]));

test("include #2", makeTest("-i HTML", [
  "already.gz",
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png",
]));

test("exclude", makeTest("-e png", [
  "already.gz",
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png",
]));

test("exclude #2", makeTest("-e png -e png,png", [
  "already.gz",
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png",
]));

test("exclude #3", makeTest("-e html", [
  "already.gz",
  "index.html",
  "image.png",
  "image.png.br",
  "image.png.gz",
]));

test("exclude #4", makeTest("-e ''", [
  "already.gz",
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png",
  "image.png.br",
  "image.png.gz",
]));

test("mtime", makeTest("-m", [
  "already.gz",
  "index.html",
  "index.html.br",
  "index.html.gz",
  "image.png",
  "image.png.br",
  "image.png.gz",
]));

test("error", async () => {
  await expect(run("-e png,html")).rejects.toThrow();
  await expect(run("-i HTML -S")).rejects.toThrow();
});
