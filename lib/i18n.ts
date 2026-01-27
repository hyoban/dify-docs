import type { I18nConfig } from 'fumadocs-core/i18n';

export const i18n: I18nConfig = {
  defaultLanguage: 'en',
  languages: ['en', 'zh', 'ja'],
  parser: 'dir',
};

export const locales = [
  { locale: 'en', name: 'English' },
  { locale: 'zh', name: '简体中文' },
  { locale: 'ja', name: '日本語' },
]

export type Locale = (typeof i18n.languages)[number];
