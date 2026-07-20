# src/content

## Purpose

Content scripts injected into supported websites.

## Contains

* `index.ts`: Bootstraps the matching site adapter from the registry
* `chromeApi.ts`: Content-local settings/templates/log via `chrome.storage.local` (no shared SW chunks)
* `sites/registry.ts`: Site matcher registry
* `sites/chatgpt/`: ChatGPT adapter — title banner, template trigger, auto allow, message pruner, selectors, composer observer

## Rules

* Keep site-specific DOM logic inside `sites/<site>/`.
* Do not import `src/services/*` or `@/utils/logger` from content — those modules are shared with the service worker and break MV3 when listed in `web_accessible_resources`.
* Use `chromeApi.ts` for storage/logging; use type-only imports from `src/types/`.
* Register new sites in `sites/registry.ts` and manifest `content_scripts`.

## Connections

* Activated by manifest on `https://chatgpt.com/*`
* Reads settings/templates via `chromeApi.ts` → `chrome.storage.local`
* Renders UI via `src/components/` (Shadow DOM + `content.css`)

## Update rule

Update this README when site adapters or content script entry behavior changes.
