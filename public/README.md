# public

## Purpose

Static assets shipped with the extension: manifest and icons.

## Contains

* `manifest.json`: Manifest V3 configuration
* `icons/`: Extension icons (16, 48, 128 px)

## Rules

* Do not put executable TypeScript here — source lives in `src/`.
* Keep permissions minimal; add new ones only when a feature requires them.
* `host_permissions` currently scoped to `https://chatgpt.com/*`.

## Connections

* Read by Vite + `@crxjs/vite-plugin` at build time.
* Output copied to `dist/` on build.

## Update rule

Update this README if manifest structure or asset layout changes.
