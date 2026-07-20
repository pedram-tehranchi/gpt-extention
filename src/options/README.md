# src/options

## Purpose

Full settings page: title banner, Auto Allow, conversation prune, and template CRUD/reorder.

## Contains

- `index.html`: Options page markup
- `main.ts`: Settings form, template list (add/edit/delete/reorder)
- `options.css`: Options styles (design-system tokens)

## Rules

- Vanilla TypeScript only — no framework.
- Use `src/services/*` for persistence; do not call raw `chrome.*` APIs here.
- Opened in a tab (`options_ui.open_in_tab`).

## Connections

- Uses `src/services/settings.ts` and `src/services/templates.ts`.
- Declared as `options_ui.page` in `public/manifest.json`.
- Linked from the popup via “Open options”.

## Update rule

Update this file when options UI, settings fields, or template management change.
