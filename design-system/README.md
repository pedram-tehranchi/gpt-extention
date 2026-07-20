# design-system

## Purpose

UI/UX source of truth for this extension so future work stays visually and behaviorally consistent.

## Contains

- `MASTER.md`: style, color tokens, typography, shape, surface hierarchy, UX rules, checklist

## Rules

- Prefer `MASTER.md` over ad-hoc palette or copy choices.
- When CSS tokens or UX behavior change, update `MASTER.md` in the same change.

## Connections

- Implemented in `src/styles/global.css`, `src/styles/content.css`, popup/options/content UI.
- Agent skill: `.cursor/skills/gpt-extension-ui-ux/SKILL.md` (use on UI/UX tasks).

## Update rule

Update this README if the folder gains page-specific override docs (e.g. `pages/`).
