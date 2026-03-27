import { stopwords as japaneseStopwords } from "@orama/stopwords/japanese";
import { stopwords as mandarinStopwords } from "@orama/stopwords/mandarin";
import { createTokenizer as createJapaneseTokenizer } from "@orama/tokenizers/japanese";
import { createTokenizer as createMandarinTokenizer } from "@orama/tokenizers/mandarin";
import { createFromSource } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

export const { GET } = createFromSource(source, {
  localeMap: {
    en: {},
    zh: {
      components: {
        tokenizer: createMandarinTokenizer({
          language: "mandarin",
          stopWords: mandarinStopwords,
        }),
      },
      search: {
        threshold: 0,
        tolerance: 0,
      },
    },
    ja: {
      components: {
        tokenizer: createJapaneseTokenizer({
          language: "japanese",
          stopWords: japaneseStopwords,
        }),
      },
      search: {
        threshold: 0,
        tolerance: 0,
      },
    },
  },
});
