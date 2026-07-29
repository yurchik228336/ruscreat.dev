import { defineConfig } from "vite";

// Relative base works for GitHub Pages (project + user site) and custom domains.
export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
});
