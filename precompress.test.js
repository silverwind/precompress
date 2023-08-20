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
  writeFileSync(join(testDir, "outer.html"), (new Array(1e4)).join("index"));
  writeFileSync(join(testDir, "already.gz"), (new Array(1e4)).join("index"));
  writeFileSync(join(testDir, "outer.png"), (new Array(1e4)).join("image"));
  const srcDir = join(testDir, "src");
  mkdirSync(srcDir);
  writeFileSync(join(srcDir, "inner.js"), (new Array(1e4)).join("index"));
  writeFileSync(join(srcDir, "inner.css"), (new Array(1e4)).join("index"));
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
  const {version} = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8"));
  const {stdout, exitCode} = await execa("node", [script, "-v"]);
  expect(stdout).toEqual(version);
  expect(exitCode).toEqual(0);
});

test("simple", makeTest(""));
test("delete", makeTest("-d"));
test("include", makeTest("-i html,foo"));
test("include #2", makeTest("-i HTML"));
test("exclude", makeTest("-e png"));
test("exclude #2", makeTest("-e png -e png,png"));
test("exclude #3", makeTest("-e html"));
test("exclude #4", makeTest("-e ''"));
test("mtime", makeTest("-m"));
test("outdir", makeTest(`-o ${testDir}/dist`));
test("outdir,basedir", makeTest(`-o ${testDir}/dist -b src`));
test("outdir,extensionless", makeTest(`-o ${testDir}/dist -t gz -E`));

test("no matching files", async () => {
  await expect(run("-e png,html,js,css")).rejects.toThrow();
  await expect(run("-i HTML -S")).rejects.toThrow();
});
