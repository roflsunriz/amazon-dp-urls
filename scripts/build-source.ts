import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");
const artifactsDirectory = resolve(projectRoot, "web-ext-artifacts");
const archivePath = resolve(
  artifactsDirectory,
  "amazon-clean-dp-url-source.tar.gz",
);
const rootFiles = [
  "AMO-SOURCE-README.md",
  "CHANGELOG.md",
  "README.md",
  "amo-metadata.json",
  "bun.lock",
  "how-to-update.md",
  "package.json",
  "tsconfig.json",
];
const sourcePatterns = [
  "assets/**/*",
  "scripts/**/*",
  "src/**/*",
  "tests/**/*",
];
const sourceFiles = new Set(rootFiles);

for (const pattern of sourcePatterns) {
  const glob = new Bun.Glob(pattern);
  for (const path of glob.scanSync({ cwd: projectRoot, onlyFiles: true })) {
    sourceFiles.add(path.replaceAll("\\", "/"));
  }
}

const archiveEntries: Record<string, Uint8Array> = {};
for (const path of [...sourceFiles].sort()) {
  archiveEntries[path] = await Bun.file(resolve(projectRoot, path)).bytes();
}

await mkdir(artifactsDirectory, { recursive: true });
await Bun.Archive.write(archivePath, archiveEntries, {
  compress: "gzip",
  level: 9,
});

console.log(`Built AMO source archive: ${archivePath}`);
