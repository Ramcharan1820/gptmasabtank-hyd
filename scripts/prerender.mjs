import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { renderSeoHead, PRERENDER_ROUTES } from "../src/seoMetadata.js";

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
} finally {
  await vite.close();
}

console.log(`Pre-rendered ${PRERENDER_ROUTES.length} route HTML files.`);
