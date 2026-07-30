import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");
const sourceDir = resolve(projectRoot, "src");
const outputDir = resolve(projectRoot, "dist");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const result = await Bun.build({
  entrypoints: [resolve(sourceDir, "background.ts")],
  outdir: outputDir,
  target: "browser",
  format: "iife",
  minify: false,
  sourcemap: "none",
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }

  throw new Error("TypeScriptの拡張機能ビルドに失敗しました。");
}

await Promise.all([
  cp(resolve(sourceDir, "manifest.json"), resolve(outputDir, "manifest.json")),
  cp(resolve(sourceDir, "_locales"), resolve(outputDir, "_locales"), {
    recursive: true,
  }),
  cp(resolve(sourceDir, "icons"), resolve(outputDir, "icons"), {
    recursive: true,
  }),
]);

console.log(`Built extension: ${outputDir}`);
