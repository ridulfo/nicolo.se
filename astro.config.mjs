import { defineConfig } from "astro/config";

export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: {
        light: "gruvbox-light-soft",
        dark: "gruvbox-dark-soft",
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
