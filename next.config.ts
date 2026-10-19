import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the site is plain HTML/CSS/JS and can be hosted for free
  // on Vercel, Netlify, Cloudflare Pages or GitHub Pages.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
