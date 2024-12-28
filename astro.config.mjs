import { defineConfig } from "astro/config";

export default defineConfig({
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "solarized-light",
    },
  },
  build: {
    format: "file",
  },
});
