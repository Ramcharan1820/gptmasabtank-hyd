import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import {
  renderSeoHead,
  PRERENDER_ROUTES,
  PUBLIC_PAGES,
  SITE_URL,
} from "../src/seoMetadata.js";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const outputDirectory = path.join(projectRoot, "dist");
const templatePath = path.join(outputDirectory, "index.html");
const template = await readFile(templatePath, "utf8");
const vite = await createServer({
  mode: "production",
  appType: "custom",
  server: { middlewareMode: true },
});

try {
  const { render } = await vite.ssrLoadModule("/src/entry-server.jsx");

  for (const route of PRERENDER_ROUTES) {
    const head = renderSeoHead(route);
    const html = template
      .replace(/<title>[\s\S]*?<\/title>/, head.html)
      .replace(
        '<div id="root"><!--app-html--></div>',
        `<div id="root">${render(route)}</div>`
      );
    const relativeOutput = route === "/"
      ? "index.html"
      : path.join(route.slice(1), "index.html");
    const outputPath = path.join(outputDirectory, relativeOutput);

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html);

    if (route !== "/") {
      const cleanUrlOutput = path.join(
        outputDirectory,
        `${route.slice(1)}.html`
      );

      await mkdir(path.dirname(cleanUrlOutput), { recursive: true });
      await writeFile(cleanUrlOutput, html);
    }
  }

  // Generate valid, search-engine ready sitemap.xml
  const today = new Date().toISOString().split("T")[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(PUBLIC_PAGES)
  .map((route) => {
    const loc = route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`;
    const priority =
      route === "/" ? "1.0" : route.startsWith("/departments/") ? "0.8" : "0.9";
    const changefreq =
      route === "/" || route.startsWith("/student-portal")
        ? "daily"
        : "weekly";
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;
  await writeFile(path.join(outputDirectory, "sitemap.xml"), sitemapXml, "utf8");
  await writeFile(path.join(projectRoot, "public", "sitemap.xml"), sitemapXml, "utf8");

  // Ensure robots.txt is in dist/
  const robotsTxtPath = path.join(projectRoot, "public", "robots.txt");
  const robotsTxt = await readFile(robotsTxtPath, "utf8");
  await writeFile(path.join(outputDirectory, "robots.txt"), robotsTxt, "utf8");
} finally {
  await vite.close();
}

console.log(`Pre-rendered ${PRERENDER_ROUTES.length} route HTML files.`);
console.log(`Generated sitemap.xml with base domain ${SITE_URL}`);
