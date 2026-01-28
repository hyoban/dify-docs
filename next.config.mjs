import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en/use-dify/getting-started/introduction",
        permanent: false,
      },
      {
        source: "/en",
        destination: "/en/use-dify/getting-started/introduction",
        permanent: false,
      },
      {
        source: "/zh",
        destination: "/zh/use-dify/getting-started/introduction",
        permanent: false,
      },
      {
        source: "/ja",
        destination: "/ja/use-dify/getting-started/introduction",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withMDX(config);
