import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";

import { i18n, locales, type Locale } from "@/lib/i18n";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  const lang = langParam as Locale;
  return (
    <RootProvider i18n={{ ...i18n, locale: lang, locales }}>
      <DocsLayout i18n tree={source.getPageTree(lang)} {...baseOptions()}>
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
