# src/content

## Purpose

Content scripts injected into supported websites.

## Contains

* `index.ts`: Bootstraps the matching site adapter from the registry
* `sites/registry.ts`: Site matcher registry
* `sites/chatgpt/`: ChatGPT features (title banner, template trigger, auto allow, message pruner)

## Rules

* Keep site-specific DOM logic inside `sites/<site>/`.
* Share storage, types, and UI through `src/services/`, `src/types/`, and `src/components/`.
* Register new sites in `sites/registry.ts` and manifest `content_scripts`.

## Connections

* Activated by manifest on `https://chatgpt.com/*`
* Uses `src/services/templates.ts`, settings via messaging
* Renders UI via `src/components/` (Shadow DOM + `content.css`)

## Update rule

Update this README when site adapters or content script entry behavior changes.
