import { defineConfig } from "astro/config";

export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
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
  image: {
    formats: ['webp', 'png'],
    quality: {
      webp: 80
    }
  }
});
