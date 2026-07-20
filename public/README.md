# public

## Purpose

Static assets shipped with the extension: manifest, icons, and fonts.

## Contains

- `manifest.json`: Manifest V3 configuration
- `icons/`: Extension icons (`icon-master.png` source; 16/48/128 px generated)
- `fonts/`: Plus Jakarta Sans woff2 files (web-accessible for ChatGPT content UI)

## Rules

- Do not put executable TypeScript here — source lives in `src/`.
- Keep permissions minimal; add new ones only when a feature requires them.
- `host_permissions` currently scoped to `https://chatgpt.com/*`.
- Fonts under `fonts/` must stay listed in `web_accessible_resources` for Shadow DOM UI on ChatGPT.

## Connections

- Read by Vite + `@crxjs/vite-plugin` at build time.
- Output copied to `dist/` on build.
- Font URLs are resolved at runtime via `src/styles/extensionFonts.ts`.

## Update rule

Update this README if manifest structure or asset layout changes.
