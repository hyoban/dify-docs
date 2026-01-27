import { generateFiles } from 'fumadocs-openapi';
import { createOpenAPI } from 'fumadocs-openapi/server';

const languages = ['en', 'zh', 'ja'];
const apiName = ['chat', 'chatflow', 'completion', 'knowledge', 'workflow']

const openapiWithPath = languages.flatMap((lang) =>
  apiName.map(
    (apiName) => ({
      input: `./api-reference/${lang}/openapi_${apiName}.json`,
      lang,
      apiName,
    })
  )
).map(({ input, lang, apiName }) => ({
  input,
  lang,
  apiName,
  openapi: createOpenAPI({ input: [input] }),
}));

openapiWithPath.forEach(({ openapi, lang, apiName }) => {
  void generateFiles({
    input: openapi,
    output: `./content/docs/${lang}/api-reference/${apiName}`,
    // we recommend to enable it
    // make sure your endpoint description doesn't break MDX syntax.
    includeDescription: true,
  });
});