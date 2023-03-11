import fs from "node:fs/promises";
import { globby } from "globby"; // npm i -D globby
import { minify } from "html-minifier"; // npm i -D html-minifier

console.log("Convert Astro CSS files (./dist) into HTML inline styles");

const distPath = "./dist";
const files = await globby(`${distPath}/**/*.html`);

await Promise.all(
  files.map(async (file) => {
    let html = await fs.readFile(file, "utf-8"); // load HTML
    const stylesheets = html.match(/<link rel="stylesheet" href="(.+?)" \/>/g); // extract stylesheet links
    await Promise.all(
      // read CSS files and replace link by inline CSS
      stylesheets.map(async (stylesheet) => {
        const stylePath = stylesheet.match(
          /^<link rel="stylesheet" href="(.+?)" \/>$/
        )[1];
        const style = await fs.readFile(distPath + stylePath, "utf-8");
        html = html.replace(stylesheet, `<style>${style.trim()}</style>`);
      })
    );
    html = minify(html, { collapseWhitespace: true });
    await fs.writeFile(file, html);
  })
);
