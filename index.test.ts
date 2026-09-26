import {execa} from "execa";
import {fileURLToPath} from "node:url";
import {writeFileSync, readFileSync, mkdirSync, mkdtempSync, rmSync} from "node:fs";
import {join} from "node:path";
import fastGlob from "fast-glob";
import {tmpdir} from "node:os";

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
  return execa(script, [".", ...args.split(/\s+/).filter(Boolean)], {cwd: testDir});
}

function makeTest(argsFn: (testDir: string) => string, expectedPaths: string[]) {
  return async () => {
    const testDir = setupTestDir();
    try {
      await run(testDir, argsFn(testDir));
      expect(fastGlob.sync(`**`, {cwd: testDir}).sort()).toEqual(expectedPaths);
    } finally {
      rmSync(testDir, {recursive: true, force: true});
    }
  };
}

test("help and version", async () => {
  const {version} = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8"));
  for (const flag of ["-v", "--version"]) {
    const {stdout, exitCode} = await execa("node", [script, flag]);
    expect(stdout).toEqual(version);
    expect(exitCode).toEqual(0);
  }
  for (const flag of ["-h", "--help"]) {
    const {stdout, exitCode} = await execa("node", [script, flag]);
    expect(stdout).toContain("usage: precompress");
    expect(exitCode).toEqual(0);
  }
});

test("concurrency", makeTest(() => "-c 2", [
  "already.gz",
  "outer.html",
  "outer.html.br",
  "outer.html.gz",
  "outer.html.zst",
  "outer.png",
  "outer.png.br",
  "outer.png.gz",
  "outer.png.zst",
  "src/inner.css",
  "src/inner.css.br",
  "src/inner.css.gz",
  "src/inner.css.zst",
  "src/inner.js",
  "src/inner.js.br",
  "src/inner.js.gz",
  "src/inner.js.zst",
]));
test("delete", makeTest(() => "-d", [
  "already.gz",
  "outer.html.br",
  "outer.html.gz",
  "outer.html.zst",
  "outer.png.br",
  "outer.png.gz",
  "outer.png.zst",
  "src/inner.css.br",
  "src/inner.css.gz",
  "src/inner.css.zst",
  "src/inner.js.br",
  "src/inner.js.gz",
  "src/inner.js.zst",
]));
test("include 1", makeTest(() => "-i **.html,**.foo -i **.css", [
  "already.gz",
  "outer.html",
  "outer.html.br",
  "outer.html.gz",
  "outer.html.zst",
  "outer.png",
  "src/inner.css",
  "src/inner.css.br",
  "src/inner.css.gz",
  "src/inner.css.zst",
  "src/inner.js",
]));
test("include 2", makeTest(() => "-i **.HTML", [
  "already.gz",
  "outer.html",
  "outer.html.br",
  "outer.html.gz",
  "outer.html.zst",
  "outer.png",
  "src/inner.css",
  "src/inner.js",
]));
test("exclude 1", makeTest(() => "-e **.png", [
  "already.gz",
  "outer.html",
  "outer.html.br",
  "outer.html.gz",
  "outer.html.zst",
  "outer.png",
  "src/inner.css",
  "src/inner.css.br",
  "src/inner.css.gz",
  "src/inner.css.zst",
  "src/inner.js",
  "src/inner.js.br",
  "src/inner.js.gz",
  "src/inner.js.zst",
]));
test("exclude 2", makeTest(() => "-e **.png -e **.html", [
  "already.gz",
  "outer.html",
  "outer.png",
  "src/inner.css",
  "src/inner.css.br",
  "src/inner.css.gz",
  "src/inner.css.zst",
  "src/inner.js",
  "src/inner.js.br",
  "src/inner.js.gz",
  "src/inner.js.zst",
]));
test("exclude 3", makeTest(() => "-e **.html", [
  "already.gz",
  "outer.html",
  "outer.png",
  "outer.png.br",
  "outer.png.gz",
  "outer.png.zst",
  "src/inner.css",
  "src/inner.css.br",
  "src/inner.css.gz",
  "src/inner.css.zst",
  "src/inner.js",
  "src/inner.js.br",
  "src/inner.js.gz",
  "src/inner.js.zst",
]));
test("exclude 4", makeTest(() => "-e ''", [
  "already.gz",
  "outer.html",
  "outer.html.br",
  "outer.html.gz",
  "outer.html.zst",
  "outer.png",
  "outer.png.br",
  "outer.png.gz",
  "outer.png.zst",
  "src/inner.css",
  "src/inner.css.br",
  "src/inner.css.gz",
  "src/inner.css.zst",
  "src/inner.js",
  "src/inner.js.br",
  "src/inner.js.gz",
  "src/inner.js.zst",
]));
test("mtime", makeTest(() => "-m", [
  "already.gz",
  "outer.html",
  "outer.html.br",
  "outer.html.gz",
  "outer.html.zst",
  "outer.png",
  "outer.png.br",
  "outer.png.gz",
  "outer.png.zst",
  "src/inner.css",
  "src/inner.css.br",
  "src/inner.css.gz",
  "src/inner.css.zst",
  "src/inner.js",
  "src/inner.js.br",
  "src/inner.js.gz",
  "src/inner.js.zst",
]));
test("outdir", makeTest(testDir => `-o ${testDir}/dist --types gz,br --types zst`, [
  "already.gz",
  "dist/outer.html.br",
  "dist/outer.html.gz",
  "dist/outer.html.zst",
  "dist/outer.png.br",
  "dist/outer.png.gz",
  "dist/outer.png.zst",
  "dist/src/inner.css.br",
  "dist/src/inner.css.gz",
  "dist/src/inner.css.zst",
  "dist/src/inner.js.br",
  "dist/src/inner.js.gz",
  "dist/src/inner.js.zst",
  "outer.html",
  "outer.png",
  "src/inner.css",
  "src/inner.js",
]));
test("outdir,basedir", makeTest(testDir => `--outdir ${testDir}/dist --basedir src`, [
  "already.gz",
  "dist/inner.css.br",
  "dist/inner.css.gz",
  "dist/inner.css.zst",
  "dist/inner.js.br",
  "dist/inner.js.gz",
  "dist/inner.js.zst",
  "outer.html",
  "outer.html.br",
  "outer.html.gz",
  "outer.html.zst",
  "outer.png",
  "outer.png.br",
  "outer.png.gz",
  "outer.png.zst",
  "src/inner.css",
  "src/inner.js",
]));
test("outdir,extensionless", makeTest(testDir => `-o ${testDir}/dist -t gz -E`, [
  "already.gz",
  "dist/outer.html",
  "dist/outer.png",
  "dist/src/inner.css",
  "dist/src/inner.js",
  "outer.html",
  "outer.png",
  "src/inner.css",
  "src/inner.js",
]));

test("no matching files 1", async () => {
  const testDir = setupTestDir();
  try {
    await expect(run(testDir, "-e **.png,**.html -e **.js,**.css")).rejects.toThrow();
  } finally {
    rmSync(testDir, {recursive: true, force: true});
  }
});

test("no matching files 2", async () => {
  const testDir = setupTestDir();
  try {
    await expect(run(testDir, "-i HTML -S")).rejects.toThrow();
    await expect(execa(script, ["-S", "-i", "**.HTML", "outer.html"], {cwd: testDir})).rejects.toThrow();
    await expect(execa(script, ["-e", "**.HTML", "outer.html"], {cwd: testDir})).rejects.toThrow();
  } finally {
    rmSync(testDir, {recursive: true, force: true});
  }
});
