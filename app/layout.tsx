import { RootProvider } from "fumadocs-ui/provider/next";
import { Metadata } from "next";
import { Inter } from "next/font/google";

import "./global.css";

export const metadata: Metadata = {
  title: {
    template: "%s - Dify Docs",
    default: "Dify Docs",
  },
};

const inter = Inter({
  subsets: ["latin"],
});

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
