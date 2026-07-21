---
name: gpt-extension-ui-ux
description: >-
  Enforces GPT Extension UI/UX direction (cyan-on-slate AI-Native utility,
  Plus Jakarta Sans, popup/options/ChatGPT chrome consistency). Use when the
  task changes UI or UX: popup, options, content.css, Shadow DOM components,
  styles, design tokens, icons, visual polish, accessibility, layout, colors,
  typography, toasts, toggles, template picker, title banner, or when the user
  mentions design system, ui-ux-pro-max, look and feel, or brand consistency.
---

# GPT Extension UI/UX

Follow the repo design system for every UI/UX change. Do not invent a parallel palette, type scale, or interaction pattern.

## Source of truth

1. Read and follow [`design-system/MASTER.md`](../../../design-system/MASTER.md) before designing or coding UI.
2. Implement tokens in existing styles — do not hardcode one-off colors:
   - Popup / options: [`src/styles/global.css`](../../../src/styles/global.css)
   - ChatGPT injections: [`src/styles/content.css`](../../../src/styles/content.css)
3. Shadow DOM components must use `content.css` (+ extension font faces via `src/styles/extensionFonts.ts`).

If `MASTER.md` and CSS disagree, **update both in the same change** so they stay aligned.

## When this skill applies

Apply for any task that touches:

- `src/popup/`, `src/options/`, `src/styles/`, `src/components/`
- ChatGPT-injected chrome (title banner, template picker, Auto Allow, prune toast)
- Icons / brand assets under `public/icons/`
- Copy, spacing, motion, focus states, or accessibility of those surfaces

Do **not** skip this skill for “small” CSS tweaks.

Optional: if exploring style options before locking tokens, you may consult project skill `ui-ux-pro-max`, then map recommendations into **this** cyan-on-slate system (never ship default purple/indigo from that skill).

## Locked direction (summary)

| Aspect | Rule |
|--------|------|
| Style | AI-Native utility — compact, quiet, tool-like |
| Palette | Cyan-on-slate: `--bg` `#0B0F14`, `--surface` `#151B24`, `--border` `#2A3341`, `--text` `#E8EEF5`, `--text-muted` `#8B97A8`, `--accent` `#22D3EE`, `--accent-hover` `#06B6D4`, `--success` `#34D399`, `--error` `#F87171` |
| Type | Plus Jakarta Sans local only (400/500/600); no remote Google Fonts |
| Radius | `10px` controls; `12px` picker; `999px` only for pills/toggle thumb |
| Motion | 150–300ms ease-out; honor `prefers-reduced-motion` |
| Accent | **One** brand accent on popup, options, and ChatGPT UI |

### Forbidden

- Purple / indigo glow themes
- Burgundy or blue leftover accents that diverge from `--accent`
- Emoji as UI icons (use Lucide/Heroicons SVG)
- System-only Inter/Roboto/Arial as the primary brand face when fonts are available
- Silent high-impact UX (e.g. prune with no feedback)
- Hover-only critical actions; missing `:focus-visible`

## Workflow

1. **Classify the surface** — popup, options, and/or ChatGPT injection.
2. **Read** `design-system/MASTER.md` (full UX rules for that surface).
3. **Reuse tokens** — prefer CSS variables; mirror tokens in `content.css` for Shadow DOM.
4. **Match hierarchy**
   - Popup → status + toggles + shortcuts
   - Options → Title | Memory | Auto Allow | Templates
   - ChatGPT → cyan pill / toggle / dark picker aligned with options
5. **UX requirements**
   - Destructive actions: confirm
   - Async save: toast or clear status
   - Prune: visible toast when turns removed
   - Template empty state: actionable open-settings CTA
6. **Update docs** — if tokens or UX rules change, update `design-system/MASTER.md` in the same PR/change.
7. **Verify** — run through the checklist below; `npm test` / `npm run build` when code changed.

## Pre-delivery checklist

- [ ] Uses `--*` tokens (or mirrored content tokens); no rogue purple/burgundy
- [ ] Plus Jakarta (or documented fallback); no remote font CSS
- [ ] Focus-visible rings on interactive controls
- [ ] Transitions 150–300ms; reduced-motion respected
- [ ] No emoji-as-icons
- [ ] Popup / options / ChatGPT chrome feel like one product
- [ ] MASTER.md updated if direction changed

## Examples

**In scope:** “Restyle the popup”, “Add a settings section”, “Fix Auto Allow toggle contrast”, “Polish template picker”, “New toast”, “Update extension icons”.

**Out of scope alone:** pure background service-worker logic with no UI — unless the task also changes user-facing chrome.
