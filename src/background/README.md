# src/background

## Purpose

Manifest V3 service worker — long-lived extension logic, message routing, and background tasks.

## Contains

* `index.ts`: Entry point; handles `PING` messages from the popup.

## Rules

* No DOM APIs — service workers have no `window` or `document`.
* Delegate Chrome storage/API calls to `src/services/`.
* Keep UI out of this folder.

## Connections

* Receives messages from popup, content scripts, and options via `src/services/messaging.ts`.
* Uses `src/services/storage.ts` for `chrome.storage.local`.

## Update rule

Update this README if message types or background responsibilities change.
