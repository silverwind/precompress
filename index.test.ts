import {execa} from "execa";
import {fileURLToPath} from "node:url";
import {writeFileSync, readFileSync, mkdirSync, statSync, mkdtempSync, rmSync} from "node:fs";
import {join} from "node:path";
import fastGlob from "fast-glob";
import {tmpdir} from "node:os";
import type {expect as vitestExpect} from "vitest";

const script = fileURLToPath(new URL("dist/index.js", import.meta.url));

function setupTestDir() {
  const testDir = mkdtempSync(join(tmpdir(), "precompress-"));
  const srcDir = join(testDir, "src");
  mkdirSync(srcDir, {recursive: true});
  writeFileSync(join(testDir, "outer.html"), (new Array(1e4)).join("index"));
  writeFileSync(join(testDir, "already.gz"), (new Array(1e4)).join("index"));
  writeFileSync(join(testDir, "outer.png"), (new Array(1e4)).join("image"));
  writeFileSync(join(srcDir, "inner.js"), (new Array(1e4)).join("index"));
  writeFileSync(join(srcDir, "inner.css"), (new Array(1e4)).join("index"));
  return testDir;
}

async function run(testDir: string, args: string) {
  const argsArr = [".", ...args.split(/\s+/).map(s => s.trim()).filter(Boolean)];
  return execa(script, argsArr, {cwd: testDir});
}

function makeTest(argsFn: (testDir: string) => string) {
  return async ({expect}: {expect: typeof vitestExpect}) => {
    const testDir = setupTestDir();
    try {
      await run(testDir, argsFn(testDir));
      const paths = fastGlob.sync(`**`, {cwd: testDir}).sort()
        .filter(p => !statSync(join(testDir, p)).isDirectory());
      expect(paths).toMatchSnapshot();
    } finally {
      rmSync(testDir, {recursive: true, force: true});
    }
  };
}

test("version", async ({expect}) => {
  const {version} = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8"));
  const {stdout, exitCode} = await execa("node", [script, "-v"]);
  expect(stdout).toEqual(version);
  expect(exitCode).toEqual(0);
});

test("simple", makeTest(() => ""));
test("delete", makeTest(() => "-d"));
test("include 1", makeTest(() => "-i **.html,**.foo"));
test("include 2", makeTest(() => "-i **.HTML"));
test("exclude 1", makeTest(() => "-e **.png"));
test("exclude 2", makeTest(() => "-e **.png -e **.png,**.png"));
test("exclude 3", makeTest(() => "-e **.html"));
test("exclude 4", makeTest(() => "-e ''"));
test("mtime", makeTest(() => "-m"));
test("outdir", makeTest(testDir => `-o ${testDir}/dist`));
test("outdir,basedir", makeTest(testDir => `-o ${testDir}/dist -b src`));
test("outdir,extensionless", makeTest(testDir => `-o ${testDir}/dist -t gz -E`));

test("no matching files 1", async ({expect}) => {
  const testDir = setupTestDir();
  try {
    await expect(run(testDir, "-e **.png,**.html -e **.js,**.css")).rejects.toThrow();
  } finally {
    rmSync(testDir, {recursive: true, force: true});
  }
});

test("no matching files 2", async ({expect}) => {
  const testDir = setupTestDir();
  try {
    await expect(run(testDir, "-i HTML -S")).rejects.toThrow();
  } finally {
    rmSync(testDir, {recursive: true, force: true});
  }
});
