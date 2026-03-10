import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type MetaJson = {
  pages?: string[];
  [key: string]: unknown;
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(scriptDir, "../content/docs");

function isMdxFile(entry: fs.Dirent): boolean {
  return entry.isFile() && entry.name.toLowerCase().endsWith(".mdx");
}

function getPageId(filename: string): string {
  const stem = path.basename(filename, path.extname(filename));
  return stem.toLowerCase() === "readme" ? "readme" : stem;
}

function normalizePageId(page: string): string {
  return page.toLowerCase() === "readme" ? "readme" : page;
}

function readExistingMeta(dirPath: string): MetaJson {
  const metaPath = path.join(dirPath, "meta.json");

  if (!fs.existsSync(metaPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(metaPath, "utf8")) as MetaJson;
}

function orderPages(pages: string[], existingPages: unknown): string[] {
  const uniquePages = [...new Set(pages)];
  const existingOrder = Array.isArray(existingPages)
    ? existingPages
        .filter((value): value is string => typeof value === "string")
        .map(normalizePageId)
    : [];

  const rank = new Map(existingOrder.map((page, index) => [page, index]));

  return uniquePages.sort((left, right) => {
    const leftRank = rank.get(left);
    const rightRank = rank.get(right);

    if (leftRank !== undefined && rightRank !== undefined) {
      return leftRank - rightRank;
    }

    if (leftRank !== undefined) {
      return -1;
    }

    if (rightRank !== undefined) {
      return 1;
    }

    if (left === "readme") {
      return -1;
    }

    if (right === "readme") {
      return 1;
    }

    return left.localeCompare(right);
  });
}

function buildPages(dirPath: string): string[] {
  const entries = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."));

  const childDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const mdxPages = entries.filter(isMdxFile).map((entry) => getPageId(entry.name));

  return [...childDirs, ...mdxPages];
}

function writeMeta(dirPath: string): void {
  const pages = buildPages(dirPath);

  if (pages.length === 0) {
    return;
  }

  const existingMeta = readExistingMeta(dirPath);
  const nextMeta: MetaJson = {
    ...existingMeta,
    pages: orderPages(pages, existingMeta.pages),
  };
  const metaPath = path.join(dirPath, "meta.json");

  fs.writeFileSync(metaPath, `${JSON.stringify(nextMeta, null, 2)}\n`);
  console.log(`Updated ${path.relative(docsRoot, metaPath)}`);
}

function walk(dirPath: string): void {
  const entries = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."));

  for (const entry of entries) {
    if (entry.isDirectory()) {
      walk(path.join(dirPath, entry.name));
    }
  }

  writeMeta(dirPath);
}

function main(): void {
  if (!fs.existsSync(docsRoot)) {
    throw new Error(`Docs root not found: ${docsRoot}`);
  }

  const languageDirs = fs
    .readdirSync(docsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."));

  for (const entry of languageDirs) {
    walk(path.join(docsRoot, entry.name));
  }
}

main();
