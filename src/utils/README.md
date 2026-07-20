# src/utils

## Purpose

Pure or DOM-light helpers shared by content features, services, and tests.

## Contains

- `allowButton.ts`: Detect ChatGPT “Allow” buttons
- `contentEditable.ts`: Composer text/caret helpers for template insertion
- `conversationTitle.ts`: Clean and resolve conversation titles from sidebar/DOM
- `logger.ts`: Prefixed console logger (background/services — not content)
- `pruneTurns.ts`: Decide which conversation turns to keep/remove
- `reorder.ts`: Array move helper (template reorder)
- `tabTitle.ts`: Format conversation titles for display
- `templateTrigger.ts`: Detect `//` trigger text in the composer

## Rules

- Prefer pure functions; keep site-specific selectors in `src/content/sites/`.
- Do not import `logger` from content scripts (use `src/content/chromeApi.ts` instead).

## Connections

- Used by ChatGPT content modules, `src/services/templates.ts`, and Vitest tests under `tests/`.

## Update rule

Update this file when helpers are added, removed, or ownership moves.
