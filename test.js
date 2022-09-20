import {deleteSync} from "del";
import {execa} from "execa";
import {temporaryDirectory} from "tempy";
import {fileURLToPath} from "url";
import {writeFileSync, readdirSync} from "fs";

const testDir = temporaryDirectory();
const script = fileURLToPath(new URL("bin/precompress.js", import.meta.url));

beforeEach(() => {
  deleteSync(`${testDir}/*`, {force: true});
  writeFileSync(`${testDir}/index.html`, (new Array(1e4)).join("index"));
  writeFileSync(`${testDir}/image.png`, (new Array(1e4)).join("image"));
});

afterAll(() => {
  deleteSync(testDir, {force: true});
});

async function run(args) {
  const argsArr = [".", ...args.split(/\s+/).map(s => s.trim()).filter(s => !!s)];
  return execa(script, argsArr, {cwd: testDir});
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
