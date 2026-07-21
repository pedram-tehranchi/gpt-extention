# GPT Extension — Design System (Master)

Source of truth for UI/UX. Use this for all future popup, options, and ChatGPT-injected UI work.

Derived from **ui-ux-pro-max** (AI-Native utility) with a cyan-on-slate palette (no purple/indigo defaults).

**Implementation tokens live in:**

- [`src/styles/global.css`](../src/styles/global.css) — popup & options
- [`src/styles/content.css`](../src/styles/content.css) — ChatGPT Shadow DOM chrome
- Fonts: [`public/fonts/`](../public/fonts/) (Plus Jakarta Sans, local only)

---

## Product surfaces

| Surface | Job |
|---------|-----|
| **Popup** | Product home: connection status, Auto Allow / prune toggles, keep-N, template count, open settings |
| **Options** | Title banner + prefix, conversation memory, Auto Allow, template CRUD |
| **ChatGPT page** | Title pill, `//` template picker, Auto Allow toggle, prune toast |

---

## Style

| | |
|--|--|
| **Name** | AI-Native utility (compact chrome) |
| **Feel** | Quiet, dense, tool-like — not a marketing landing page |
| **Motion** | 150–300ms ease-out; short “saved” / “pruned” feedback; no looping decorative motion |
| **Reduced motion** | Honor `prefers-reduced-motion` |

### Avoid

- Purple / indigo glow stacks
- Heavy chrome, slow feedback
- Emoji used as UI icons (use SVG: Lucide / Heroicons)
- Hover-only critical actions
- Missing focus rings
- Split brand accents (no blue-on-options + burgundy-on-ChatGPT)

---

## Color tokens

| Role | Hex | CSS variable | Use |
|------|-----|--------------|-----|
| Background | `#0B0F14` | `--bg` | Popup / options page |
| Surface | `#151B24` | `--surface` | Cards, inputs, picker |
| Border | `#2A3341` | `--border` | Inputs, dividers |
| Text | `#E8EEF5` | `--text` | Primary text |
| Muted | `#8B97A8` | `--text-muted` | Labels, hints |
| Primary / accent | `#22D3EE` | `--accent` | Focus, links, active toggle, primary buttons |
| Primary hover | `#06B6D4` | `--accent-hover` | Button / accent hover |
| Success / CTA | `#34D399` | `--success` | Saved, connected, prune OK |
| Danger | `#F87171` | `--error` | Delete / errors |
| Banner on ChatGPT | accent @ ~90% opacity | — | Title pill (same brand as options) |
| On-accent text | `#0B0F14` | — | Text on cyan buttons / banner |

**Rule:** One brand accent everywhere. ChatGPT-injected UI must match extension pages.

---

## Typography

| | |
|--|--|
| **Family** | Plus Jakarta Sans (local `@font-face`; fallback `ui-sans-serif, system-ui, sans-serif`) |
| **Weights** | 400 body, 500 UI labels, 600 headings / buttons |
| **Popup body** | 13–14px |
| **Options h1** | 20px / 600 |
| **Options h2** | 15px / 600 |
| **ChatGPT chrome** | 12–13px (must not fight ChatGPT’s type) |

Do **not** load Google Fonts remotely. Bundle under `public/fonts/` and expose via `web_accessible_resources` for content scripts.

---

## Shape & density

| Token | Value |
|-------|--------|
| Control radius | `10px` (`--radius`) |
| Picker radius | `12px` |
| Pills / toggle thumb | `999px` only |
| Popup width | ~`340px` |
| Options max-width | `640–720px` |
| Transition | `200ms ease-out` (`--transition`) |

---

## Visual hierarchy by surface

```text
Popup     → brand + status + toggles + keep-N + settings
Options   → Title | Memory | Auto Allow | Templates (same tokens)
ChatGPT   → cyan title pill | cyan Auto Allow | dark picker matching options
```

---

## UX rules (required for new work)

### Popup (product home)

- Show Connected / not (background ping)
- Instant toggles: Auto Allow, Prune old messages (persist immediately)
- Keep-latest control (clamp 2–200)
- Template count + path to settings
- No scaffold / “tell me what to build” copy

### Settings model

- Preferences (title, memory, Auto Allow, banner) share one **Save settings** (or shared “Saved” toast if auto-save is added later)
- Auto Allow must be configurable from options, not only on ChatGPT
- Templates may save on submit; use the same toast language (“Template saved”)

### Pruning

- Visible feedback when turns are removed (toast: “Keeping last N turns”)
- Copy must say messages leave the **page DOM**, not OpenAI history
- Warn / confirm when keep ≤ 2 is appropriate for high-impact changes
- Silent prune without feedback is not allowed

### Title banner

- User can show/hide via settings (`titleBannerEnabled`)
- Accent cyan; check contrast on light and dark ChatGPT themes
- Must not cover ChatGPT header actions (offset carefully)

### Template picker

- Empty state: actionable “Add templates in settings” → `openOptionsPage()`
- Keyboard: ↑↓ Enter Esc
- Visible `:focus-visible` rings using accent
- `cursor-pointer`; hover = background only (no layout-shifting scale)

### Destructive & feedback

- Confirm before template delete
- Disable / loading state while saving when async work is noticeable
- Clamp keep-turns in UI with hint “2–200”
- No personal hardcoded title-prefix defaults

### Accessibility

- Visible `:focus-visible` using `--accent`
- `prefers-reduced-motion` for toggles / toasts
- Auto Allow labeled (`aria-label` / associated text / switch role)
- Do not rely on hover alone for edit/delete on touch

---

## Icons & brand assets

- Extension icons: cyan chat/AI mark on dark slate (`public/icons/`)
- Regenerate sizes from `icon-master.png` via `npm run icons`
- UI icons: Lucide or Heroicons SVG only

---

## Pre-delivery checklist

- [ ] Uses CSS tokens from `global.css` / `content.css` (no one-off purple/burgundy)
- [ ] Plus Jakarta Sans (or documented fallback), no remote font CSS
- [ ] Focus rings on interactive controls
- [ ] Hover/feedback 150–300ms; reduced-motion respected
- [ ] No emoji-as-icons
- [ ] Popup / options / ChatGPT chrome feel like one product
- [ ] Destructive actions confirmed; prune feedback visible when applicable

---

## Update rule

Update this file when tokens, typography, surface roles, or UX rules change. Keep it aligned with `src/styles/*.css` and shipped settings behavior.
