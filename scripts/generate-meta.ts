import * as fs from "fs";
import * as path from "path";

interface PageGroup {
  group: string;
  icon?: string;
  expanded?: boolean;
  pages: (string | PageGroup)[];
}

interface DocsJson {
  navigation: {
    versions: {
      version: string;
      languages: {
        language: string;
        dropdowns: {
          dropdown: string;
          icon?: string;
          pages?: (PageGroup | { group: string; pages: (string | PageGroup)[] })[];
          groups?: { group: string; openapi?: string; pages?: (string | PageGroup)[] }[];
        }[];
      }[];
    }[];
  };
}

// Read docs.json
const docsJsonPath = path.resolve(__dirname, "../../docs.json");
const docsJson: DocsJson = JSON.parse(fs.readFileSync(docsJsonPath, "utf-8"));

// Track created directories to avoid duplicates
const createdDirs = new Set<string>();

function getPageName(pagePath: string): string {
  const parts = pagePath.split("/");
  return parts[parts.length - 1];
}

function getPageDir(pagePath: string): string {
  const parts = pagePath.split("/");
  parts.pop();
  return parts.join("/");
}

function extractPages(items: (string | PageGroup)[], basePath: string): string[] {
  const pages: string[] = [];

  for (const item of items) {
    if (typeof item === "string") {
      pages.push(getPageName(item));
    } else if (item.group && item.pages) {
      // This is a nested group - we need to create a subdirectory
      // The group name needs to be converted to a directory path
      const firstPage = findFirstPage(item.pages);
      if (firstPage) {
        const pageDir = getPageDir(firstPage);
        const dirParts = pageDir.split("/");
        const groupDir = dirParts[dirParts.length - 1];
        pages.push(groupDir);

        // Create meta.json for the nested group
        createMetaForGroup(item, pageDir);
      }
    }
  }

  return pages;
}

function findFirstPage(items: (string | PageGroup)[]): string | null {
  for (const item of items) {
    if (typeof item === "string") {
      return item;
    } else if (item.pages) {
      const found = findFirstPage(item.pages);
      if (found) return found;
    }
  }
  return null;
}

function createMetaForGroup(group: PageGroup, dirPath: string): void {
  if (createdDirs.has(dirPath)) return;
  createdDirs.add(dirPath);

  const fullPath = path.resolve(__dirname, "../../", dirPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`Directory does not exist: ${fullPath}`);
    return;
  }

  const pages: string[] = [];

  for (const item of group.pages) {
    if (typeof item === "string") {
      pages.push(getPageName(item));
    } else if (item.group && item.pages) {
      const firstPage = findFirstPage(item.pages);
      if (firstPage) {
        const pageDir = getPageDir(firstPage);
        const dirParts = pageDir.split("/");
        const groupDir = dirParts[dirParts.length - 1];
        pages.push(groupDir);

        createMetaForGroup(item, pageDir);
      }
    }
  }

  const meta = {
    title: group.group,
    pages,
  };

  const metaPath = path.join(fullPath, "meta.json");
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
  console.log(`Created: ${metaPath}`);
}

function processDropdown(dropdown: any, lang: string): void {
  const pages = dropdown.pages || dropdown.groups;
  if (!pages) return;

  for (const section of pages) {
    if (section.openapi) continue; // Skip OpenAPI sections

    const sectionPages = section.pages;
    if (!sectionPages) continue;

    for (const item of sectionPages) {
      if (typeof item === "string") continue;
      if (item.group && item.pages) {
        const firstPage = findFirstPage(item.pages);
        if (firstPage) {
          const pageDir = getPageDir(firstPage);
          createMetaForGroup(item, pageDir);
        }
      }
    }
  }
}

// Process each language
for (const version of docsJson.navigation.versions) {
  for (const langConfig of version.languages) {
    const lang = langConfig.language;
    console.log(`\nProcessing language: ${lang}`);

    // Create root meta.json for the language
    const rootPages: string[] = [];

    for (const dropdown of langConfig.dropdowns) {
      // Map dropdown to directory
      let dirName: string;
      switch (dropdown.dropdown.toLowerCase()) {
        case "use dify":
        case "使用 dify":
        case "dify を使う":
          dirName = "use-dify";
          break;
        case "self host":
        case "自托管":
        case "セルフホスト":
          dirName = "self-host";
          break;
        case "develop plugin":
        case "开发插件":
        case "プラグイン開発":
          dirName = "develop-plugin";
          break;
        case "api reference":
        case "api 参考":
        case "api リファレンス":
          dirName = "api-reference";
          break;
        default:
          dirName = dropdown.dropdown.toLowerCase().replace(/\s+/g, "-");
      }

      rootPages.push(dirName);

      // Process dropdown contents
      processDropdown(dropdown, lang);
    }

    // Create root meta.json
    const langPath = path.resolve(__dirname, "../../", lang);
    if (fs.existsSync(langPath)) {
      const meta = {
        title: lang === "en" ? "Documentation" : lang === "zh" ? "文档" : "ドキュメント",
        pages: rootPages,
      };
      const metaPath = path.join(langPath, "meta.json");
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
      console.log(`Created: ${metaPath}`);
    }
  }
}

console.log("\nDone!");
