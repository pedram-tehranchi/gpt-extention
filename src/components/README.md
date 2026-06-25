# src/components

## Purpose

Reusable UI injected into web pages via Shadow DOM.

## Contains

* `ConversationTitle.ts`: Fixed title banner for conversation pages
* `TemplatePicker.ts`: Dropdown for `//` template selection
* `AutoAllowToggle.ts`: Composer toggle for auto-clicking Allow prompts

## Rules

* Use Shadow DOM + `src/styles/content.css` to avoid host page CSS conflicts.
* No direct Chrome API calls — receive data via constructor options/callbacks.

## Connections

* Used by `src/content/sites/chatgpt/`

## Update rule

Update this README when new shared UI components are added.
