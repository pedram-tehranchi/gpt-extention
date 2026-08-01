# src/types

## Purpose

Shared TypeScript types and small pure helpers used across background, UI, and content.

## Contains

- `messages.ts`: Extension message/response shapes (`PING`, settings, templates)
- `settings.ts`: `ExtensionSettings`, defaults, and `clampKeepLatestTurns`
- `template.ts`: Template and template input types
- `pin.ts`: Pinned URL and floater position types
- `site.ts`: `SiteAdapter` contract for content site adapters

## Rules

- Keep this folder free of Chrome APIs and DOM logic.
- Content scripts may import types only (type-only imports); avoid pulling runtime modules that are shared with the service worker.

## Connections

- Consumed by `src/services/`, `src/background/`, `src/popup/`, `src/options/`, and `src/content/`.

## Update rule

Update this file when message types, settings fields, or adapter contracts change.
