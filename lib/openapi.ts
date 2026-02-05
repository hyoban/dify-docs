import { createOpenAPI } from "fumadocs-openapi/server";

const languages = ["en", "zh", "ja"];
const api = ["chat", "chatflow", "completion", "knowledge", "workflow"];

export const openapi = createOpenAPI({
  input: languages.flatMap((lang) =>
    api.map((apiName) => `./api-reference/${lang}/openapi_${apiName}.json`),
  ),
});
