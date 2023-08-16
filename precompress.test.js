import {deleteSync} from "del";
import {execa} from "execa";
import {temporaryDirectory} from "tempy";
import {fileURLToPath} from "node:url";
import {writeFileSync, readFileSync, mkdirSync, statSync} from "node:fs";
import {join} from "node:path";
import fastGlob from "fast-glob";

const testDir = temporaryDirectory();
const script = fileURLToPath(new URL("bin/precompress.js", import.meta.url));

beforeEach(() => {
  deleteSync(join(testDir, "*"), {force: true});
  writeFileSync(join(testDir, "index.html"), (new Array(1e4)).join("index"));
  writeFileSync(join(testDir, "already.gz"), (new Array(1e4)).join("index"));
  writeFileSync(join(testDir, "image.png"), (new Array(1e4)).join("image"));
  mkdirSync(join(testDir, "src"));
  writeFileSync(join(testDir, "index.js"), (new Array(1e4)).join("index"));
  writeFileSync(join(testDir, "index.css"), (new Array(1e4)).join("index"));
});

afterAll(() => {
  deleteSync(testDir, {force: true});
});

async function run(args) {
  const argsArr = [".", ...args.split(/\s+/).map(s => s.trim()).filter(Boolean)];
  return execa(script, argsArr, {cwd: testDir});
}

function makeTest(args) {
  return async () => {
    await run(args);
    const paths = fastGlob.sync(`**/*`, {cwd: testDir}).sort()
      .filter(p => !statSync(join(testDir, p)).isDirectory());
    expect(paths).toMatchSnapshot();
  };
}

test("version", async () => {
  const {version: expected} = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8"));
  const {stdout, exitCode} = await execa("node", [script, "-v"]);
  expect(stdout).toEqual(expected);
  expect(exitCode).toEqual(0);
});

test("simple", makeTest(""));
test("include", makeTest("-i html,foo"));
test("include #2", makeTest("-i HTML"));
test("exclude", makeTest("-e png"));
test("exclude #2", makeTest("-e png -e png,png"));
test("exclude #3", makeTest("-e html"));
test("exclude #4", makeTest("-e ''"));
test("mtime", makeTest("-m"));
test("outdir", makeTest(`-o ${testDir}/dist`)); // TODO: path wrong
test("outdir,extensionless", makeTest(`-o ${testDir}/dist -t gz -E`)); // TODO: include already compressed when extensionless

test("no matching files", async () => {
  await expect(run("-e png,html,js,css")).rejects.toThrow();
  await expect(run("-i HTML -S")).rejects.toThrow();
});
