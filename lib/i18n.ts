import { defineI18n } from "fumadocs-core/i18n";

export const i18n = defineI18n({
  defaultLanguage: "en",
  languages: ["en", "zh", "ja"],
  parser: "dir",
});

export const locales = [
  { locale: "en", name: "English" },
  { locale: "zh", name: "简体中文" },
  { locale: "ja", name: "日本語" },
];

export type Locale = (typeof i18n.languages)[number];
