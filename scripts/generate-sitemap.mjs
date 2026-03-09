import fs from "node:fs/promises";
import path from "node:path";
import { buildSeoRoutes, getSiteUrl } from "./seo.routes.mjs";

const xmlEscape = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const getPriority = (route) => {
  if (route === "/") return "1.0";
  if (["/heritage-sites", "/artifacts", "/history", "/exhibitions"].includes(route)) {
    return "0.9";
  }

  if (route.startsWith("/heritage-sites/") || route.startsWith("/artifacts/") || route.startsWith("/history/") || route.startsWith("/exhibitions/")) {
    return "0.8";
  }

  return "0.6";
};

const getChangeFreq = (route) => {
  if (route === "/") return "daily";
  if (route.startsWith("/heritage-sites/") || route.startsWith("/artifacts/") || route.startsWith("/history/") || route.startsWith("/exhibitions/")) {
    return "weekly";
  }

  return "weekly";
};

const routes = await buildSeoRoutes();
const siteUrl = getSiteUrl();
const lastModified = new Date().toISOString();

const entries = routes
  .map((route) => {
    const absoluteUrl = route === "/" ? `${siteUrl}/` : `${siteUrl}${route}`;
    return [
      "  <url>",
      `    <loc>${xmlEscape(absoluteUrl)}</loc>`,
      `    <lastmod>${lastModified}</lastmod>`,
      `    <changefreq>${getChangeFreq(route)}</changefreq>`,
      `    <priority>${getPriority(route)}</priority>`,
      "  </url>",
    ].join("\n");
  })
  .join("\n");

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  entries,
  "</urlset>",
  "",
].join("\n");

const outputFile = path.resolve(process.cwd(), "public", "sitemap.xml");
await fs.writeFile(outputFile, sitemap, "utf8");
process.stdout.write(`[seo] Generated sitemap with ${routes.length} URLs -> ${outputFile}\n`);
