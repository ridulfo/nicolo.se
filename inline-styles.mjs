import fs from "node:fs/promises";
import { globby } from "globby"; // npm i -D globby
import { minify } from "html-minifier"; // npm i -D html-minifier

console.log("Convert Astro CSS files (./dist) into HTML inline styles");

const distPath = "./dist";
const files = await globby(`${distPath}/**/*.html`);

await Promise.all(
  files.map(async (file) => {
    let html = await fs.readFile(file, "utf-8"); // load HTML
    const stylesheets =
      html.match(/<link rel="stylesheet" href="(.+?)" \/>/g) || []; // extract stylesheet links
    await Promise.all(
      // read CSS files and replace link by inline CSS
      stylesheets.map(async (stylesheet) => {
        const stylePath = stylesheet.match(
          /^<link rel="stylesheet" href="(.+?)" \/>$/
        )[1];
        const style = await fs.readFile(distPath + stylePath, "utf-8");
        html = html.replace(stylesheet, `<style>${style.trim()}</style>`);
      }) || []
    );
    const svgs = html.match(/<img src="(.+?\.svg)" alt="(.+?)" ?\/?>/g) || []; // extract SVG links
    await Promise.all(
      // read SVG files and replace link by inline SVG
      svgs.map(async (image) => {
        const imagePath = image.match(
          /^<img src="(.+?\.svg)" alt="(.+?)" ?\/?>$/
        )[1];
        const imageAlt = image.match(
          /^<img src="(.+?\.svg)" alt="(.+?)" ?\/?>$/
        )[2];
        const svg = await fs.readFile(distPath + "/" + imagePath, "utf-8");
        html = html.replace(
          image,
          `<span aria-hidden="true" role="img" alt="${imageAlt}">${svg.trim()}</span>`
        );
      }) || []
    );
    html = minify(html, { collapseWhitespace: true });
    await fs.writeFile(file, html);
  })
);
