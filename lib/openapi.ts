import { createOpenAPI } from "fumadocs-openapi/server";
import type { OpenAPIServer } from "fumadocs-openapi/server";

const languages = ["en", "zh", "ja"];
const api = ["chat", "chatflow", "completion", "knowledge", "workflow"];

const baseOpenAPI = createOpenAPI({
  input: languages.flatMap((lang) =>
    api.map((apiName) => `./api-reference/${lang}/openapi_${apiName}.json`),
  ),
});

function expandSchemaAliases<T>(value: T, bundled: unknown): T {
  const visited = new WeakSet<object>();

  const resolveLocalRef = (ref: string): unknown => {
    if (!ref.startsWith("#/")) return { $ref: ref };

    return ref
      .slice(2)
      .split("/")
      .reduce<unknown>((current, segment) => {
        if (!current || typeof current !== "object") return undefined;

        const key = segment.replace(/~1/g, "/").replace(/~0/g, "~");
        return (current as Record<string, unknown>)[key];
      }, bundled);
  };

  const resolveNode = (node: unknown): unknown => {
    if (!node || typeof node !== "object") return node;

    if (Array.isArray(node)) {
      return node.map(resolveNode);
    }

    if ("$ref" in node && Object.keys(node).length === 1) {
      return resolveNode(structuredClone(resolveLocalRef(node.$ref as string)));
    }

    if (visited.has(node)) return node;
    visited.add(node);

    for (const [key, child] of Object.entries(node)) {
      (node as Record<string, unknown>)[key] = resolveNode(child);
    }

    return node;
  };

  return resolveNode(structuredClone(value)) as T;
}

function normalizeDocument(
  document: Awaited<ReturnType<OpenAPIServer["getSchema"]>>,
): Awaited<ReturnType<OpenAPIServer["getSchema"]>> {
  return {
    ...document,
    dereferenced: expandSchemaAliases(document.dereferenced, document.bundled),
  };
}

export const openapi: OpenAPIServer = {
  ...baseOpenAPI,
  async getSchema(document) {
    return normalizeDocument(await baseOpenAPI.getSchema(document));
  },
  async getSchemas() {
    const schemas = await baseOpenAPI.getSchemas();

    return Object.fromEntries(
      Object.entries(schemas).map(([key, document]) => [
        key,
        normalizeDocument(document),
      ]),
    );
  },
};
