import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'mapa-conceitual-sistemas-de-informacao';

const nextConfig: NextConfig = {
  output: 'export',                    // SSG: generates /out directory
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  images: {
    unoptimized: true,                 // required for static export
  },
  trailingSlash: true,                 // needed for GitHub Pages routing
};

export default nextConfig;
