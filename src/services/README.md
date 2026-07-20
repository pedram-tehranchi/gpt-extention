# src/services

## Purpose

Chrome API wrappers — storage, messaging, and future HTTP/API clients.

## Contains

* `messaging.ts`: Typed `sendMessage` / `onMessage` helpers
* `storage.ts`: `chrome.storage.local` read/write helpers
* `settings.ts`: Extension settings persistence
* `templates.ts`: Template CRUD and reorder for `//` slash commands

## Rules

* All direct `chrome.*` calls for shared background/popup/options concerns live here.
* Content scripts must not import these modules (they become web-accessible and break the SW). Use `src/content/chromeApi.ts` instead.
* UI in popup/options goes through these services, not raw Chrome APIs.

## Connections

* Used by background, popup, and options.
* Not used by content scripts at runtime.

## Update rule

Update this README when new services or message types are added.
