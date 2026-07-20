# src/components

## Purpose

Reusable UI injected into web pages via Shadow DOM.

## Contains

* `ConversationTitle.ts`: Fixed title banner for conversation pages
* `TemplatePicker.ts`: Dropdown for `//` template selection
* `AutoAllowToggle.ts`: Composer toggle for auto-clicking Allow prompts
* `PruneToast.ts`: Ephemeral toast when old turns are pruned

## Rules

* Use Shadow DOM + `src/styles/content.css` (with extension font faces) to avoid host page CSS conflicts.
* Prefer constructor options/callbacks for data; settings persistence may use `extensionClient` when the control owns its state.

## Connections

* Used by `src/content/sites/chatgpt/`

## Update rule

Update this README when new shared UI components are added.
