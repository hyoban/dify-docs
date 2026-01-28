import { type InferPageType, loader } from "fumadocs-core/source";
import { docs } from "fumadocs-mdx:collections/server";
import { createElement } from "react";

import { i18n } from "@/lib/i18n";

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  i18n,
  icon(icon) {
    if (!icon) return null;
    return createElement("span", { className: icon });
  },
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `/og/${segments.join("/")}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title}

${processed}`;
}
