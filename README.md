# RusCreat — ruscreat.dev

Personal site: Java + external security. Vite + Three.js. Static build for GitHub Pages.

## Dev

```bash
npm install
npm run dev
```

## Build / Pages

```bash
npm run build
```

`dist/` is ready for GitHub Pages. `base: "./"` so it works for project pages and custom domains.

### Deploy options

1. **Actions** — push `main`, workflow publishes `dist`.
2. **CLI** — `npm run deploy` (uses `gh-pages` → branch `gh-pages`).

Custom domain: add `CNAME` in `public/` with your domain, then set DNS.
