# RusCreat | ruscreat.dev

Vite + Three.js. Static build for GitHub Pages.

## Archive

v1 (operator desk) saved in `_archive/v1-operator-desk/` and git branch/commit history.

## Dev

```bash
npm install
npm run dev
```

## Build / Pages

```bash
npm run build
```

`dist/` deploys to GitHub Pages. `base: "./"` works for project pages and custom domains.

1. Actions: push `main`, workflow publishes `dist`.
2. CLI: `npm run deploy`.
