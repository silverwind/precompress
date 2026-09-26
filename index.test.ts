import {execa} from "execa";
import {fileURLToPath} from "node:url";
import {writeFileSync, readFileSync, mkdirSync, mkdtempSync, rmSync, chmodSync} from "node:fs";
import {platform} from "node:process";
import {join} from "node:path";
import fastGlob from "fast-glob";
import {tmpdir} from "node:os";
import pkg from "./package.json" with {type: "json"};

const script = fileURLToPath(new URL("dist/index.js", import.meta.url));
const sources = ["outer.html", "outer.png", "src/inner.css", "src/inner.js"];

function outputs(files: Array<string>, prefix = "", exts = [".br", ".gz", ".zst"]) {
  return files.flatMap(file => exts.map(ext => `${prefix}${file}${ext}`));
}

function run(cwd: string, args: string) {
  return execa(script, args.split(" "), {cwd});
}

async function withTestDir(fn: (testDir: string) => Promise<unknown>) {
  const testDir = mkdtempSync(join(tmpdir(), "precompress-"));
  try {
    mkdirSync(join(testDir, "src"));
    for (const file of ["already.gz", ...sources]) {
      writeFileSync(join(testDir, file), (file.endsWith(".png") ? "image" : "index").repeat(9999));
    }
    await fn(testDir);
  } finally {
    rmSync(testDir, {recursive: true, force: true});
  }
}

test("help and version", async () => {
  for (const flag of ["-v", "--version"]) {
    expect((await execa("node", [script, flag])).stdout).toEqual(pkg.version);
  }
  for (const flag of ["-h", "--help"]) {
    const {stdout} = await execa("node", [script, flag]);
    expect(stdout).toContain("usage: precompress");
    expect(readFileSync(new URL("README.md", import.meta.url), "utf8")).toContain(stdout);
  }
});

test.each([
  ["concurrency", [". -c 2"], [...sources, ...outputs(sources)]],
  ["delete", [". -d"], outputs(sources)],
  ["include 1", [". -i **.html,**.foo -i **.css"], [...sources, ...outputs(["outer.html", "src/inner.css"])]],
  ["include 2", [". -i **.HTML"], [...sources, ...outputs(["outer.html"])]],
  ["exclude 1", [". -e **.png"], [...sources, ...outputs(["outer.html", "src/inner.css", "src/inner.js"])]],
  ["exclude 2", [". -e **.png -e **.html"], [...sources, ...outputs(["src/inner.css", "src/inner.js"])]],
  ["exclude 3", [". -e **.html"], [...sources, ...outputs(["outer.png", "src/inner.css", "src/inner.js"])]],
  ["exclude 4", [". -e ''"], [...sources, ...outputs(sources)]],
  ["mtime", [". -m", ". -m -o $DIR/dist"], [...sources, ...outputs(sources), ...outputs(sources, "dist/")]],
  ["outdir", [". -o $DIR/dist --types gz,br --types zst"], [...sources, ...outputs(sources, "dist/")]],
  ["outdir,basedir", [". --outdir $DIR/dist --basedir src"], [
    ...sources,
    ...outputs(["outer.html", "outer.png"]),
    ...outputs(["inner.css", "inner.js"], "dist/"),
  ]],
  ["outdir,extensionless", [". -o $DIR/dist -t gz -E"], [...sources, ...outputs(sources, "dist/", [""])]],
] as Array<[string, Array<string>, Array<string>]>)("%s", (_name, runs, expected) => withTestDir(async testDir => {
  for (const args of runs) await run(testDir, args.replace("$DIR", testDir));
  expect(fastGlob.sync("**", {cwd: testDir}).sort()).toEqual(["already.gz", ...expected].sort());
}));

test.skipIf(platform === "win32")("mtime does not read sources whose selected outputs are newer", () => withTestDir(async testDir => {
  await run(testDir, ". -t gz");
  chmodSync(join(testDir, "outer.html"), 0);
  expect((await run(testDir, ". -m -t gz")).stdout).not.toContain("EACCES");
}));

test("no matching files", () => withTestDir(testDir => Promise.all([
  ["", ". -e **.png,**.html -e **.js,**.css"],
  ["", ". -i HTML -S"],
  ["", "-S -i **.HTML outer.html"],
  ["", "-e **.HTML outer.html"],
  ["", "-e **.html ./outer.html"],
  ["src", "../already.gz"],
].map(([cwd, args]) => expect(run(join(testDir, cwd), args)).rejects.toThrow("No matching files found")))));
