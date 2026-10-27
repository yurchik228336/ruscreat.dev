import { defineConfig, type Plugin } from "vite";

/** Preload the Three/laptop chunk so it races with the greeting loader */
function preloadLaptopChunk(): Plugin {
  return {
    name: "preload-laptop-chunk",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle || !ctx.filename?.endsWith("index.html")) return html;
        const tags: string[] = [];
        for (const file of Object.keys(ctx.bundle)) {
          if (!file.endsWith(".js")) continue;
          if (!/laptop|three/i.test(file)) continue;
          tags.push(
            `<link rel="modulepreload" crossorigin media="(min-width: 861px)" href="./${file}">`,
          );
        }
        if (!tags.length) return html;
        return html.replace("</head>", `    ${tags.join("\n    ")}\n  </head>`);
      },
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [preloadLaptopChunk()],
  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: "index.html",
        lessons: "work/lessons.html",
        kingdoms: "work/kingdoms.html",
        schemgen: "work/schemgen.html",
        security: "work/security.html",
        hunt: "work/hunt.html",
        java: "work/java.html",
        ops: "work/ops.html",
        reports: "work/reports.html",
      },
    },
  },
});
