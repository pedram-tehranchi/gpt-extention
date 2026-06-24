# src/content

## Purpose

Scripts injected into web pages.

## Contains

* `index.ts`: Content script entry (logs on load).

## Rules

* Not registered in `manifest.json` yet — add `content_scripts` when you need page injection.
* Never import popup/options code; share logic via `src/services/` and `src/types/`.
* Request host permissions only for URLs you actually need.

## Connections

* Can send messages to the background worker via `src/services/messaging.ts`.

## Update rule

Update this README when content script scope or manifest registration changes.
