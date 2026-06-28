# src/services

## Purpose

Chrome API wrappers — storage, messaging, and future HTTP/API clients.

## Contains

* `messaging.ts`: Typed `sendMessage` / `onMessage` helpers
* `storage.ts`: `chrome.storage.local` read/write helpers
* `settings.ts`: Extension settings (title prefix)
* `templates.ts`: Template CRUD for `//` slash commands
* `extensionClient.ts`: Content-script proxy for settings/templates via messaging

## Rules

* All direct `chrome.*` calls for shared concerns live here.
* UI components must not call Chrome APIs directly — go through these services.

## Connections

* Used by background, popup, content scripts, and options.

## Update rule

Update this README when new services or message types are added.
