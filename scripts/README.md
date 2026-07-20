# scripts

## Purpose

Node tooling for icons and post-build checks (not shipped in the extension).

## Contains

- `create-icons.mjs`: Generates `public/icons/icon-{16,48,128}.png` from `icon-master.png` (`npm run icons`)
- `verify-extension-build.mjs`: After `vite build`, asserts `dist/` manifest/layout and that service-worker JS is not listed as web-accessible (`npm run build`)

## Rules

- Keep scripts deterministic and free of secrets.
- Do not put runtime extension logic here.

## Connections

- Invoked from root `package.json` scripts.
- Reads/writes under `public/icons/` and validates `dist/`.

## Update rule

Update this file when build/icon scripts are added or their responsibilities change.
