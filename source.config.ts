import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from "fumadocs-mdx/config";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      langs: [
        ...(rehypeCodeDefaultOptions.langs ?? []),
        "jinja",
        "yaml",
        "python",
        "json",
        "shellscript",
      ],
      langAlias: {
        // Handle uppercase language names used in docs
        YAML: "yaml",
        JSON: "json",
        Python: "python",
        Bash: "shellscript",
        Shell: "shellscript",
        JavaScript: "javascript",
        TypeScript: "typescript",
        SQL: "sql",
        HTML: "html",
        CSS: "css",
        XML: "xml",
        // Common aliases
        py: "python",
        sh: "bash",
        js: "javascript",
        ts: "typescript",
        yml: "yaml",
        // Languages used in docs that need aliasing
        jinja2: "jinja",
        curl: "shellscript",
        env: "shellscript",
        plaintext: "text",
        txt: "text",
      },
    },
    remarkImageOptions: {
      useImport: false,
      onError: (error) => {
        console.warn(
          "[remarkImage] Failed to process image, the image may have broken URL.",
          error.message,
        );
      },
    },
  },
});
