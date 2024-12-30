import { defineConfig } from "astro/config";

export default defineConfig({
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "solarized-light",
    },
  },
  redirects: {
    "/blog": "/writing",
    "/blog/": "/writing/",
    "/blog/:slug": "/writing/:slug"
  },
  build: {
    format: "file",
  },
});
