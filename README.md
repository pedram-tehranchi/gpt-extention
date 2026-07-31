# GPT Extension

A Chrome extension that makes ChatGPT a bit easier to use:

- Shows a cleaner conversation title at the top
- Lets you insert saved prompts by typing `//`
- Can auto-click ChatGPT’s **Allow** prompts
- Can lighten long chats by keeping only recent messages in the page

This is **not** in the Chrome Web Store yet. You install it from this project (one-time setup).

---

## Install (step by step)

You need **Google Chrome**, **Node.js** (includes `npm`), and **Git**. You do the install from the **Terminal** — no need to download a ZIP from the browser. You can still open the project page in Chrome if you want to read about it: [https://github.com/pedram-tehranchi/gpt-extention](https://github.com/pedram-tehranchi/gpt-extention)

### 1. Install Node.js (once)

1. Open [https://nodejs.org](https://nodejs.org) and download the **LTS** version
2. Run the installer and accept the defaults
3. Restart if the installer asks you to

Open **Terminal** (Mac) or **Command Prompt** / **PowerShell** (Windows) and check:

```bash
node -v   # check that Node.js is installed (prints a version like v22.x.x)
npm -v    # check that npm is installed (prints a version like 10.x.x)
```

You should see version numbers. If you get “command not found”, install Node.js again.

### 2. Install Git (once, if needed)

In the same Terminal window:

```bash
git --version   # check that Git is installed (prints a version number)
```

If that fails, install Git from [https://git-scm.com/downloads](https://git-scm.com/downloads), then try again.

### 3. Download and build (all in Terminal)

```bash
git clone https://github.com/pedram-tehranchi/gpt-extention.git   # download the project from GitHub onto your computer
cd gpt-extention                                                 # enter the project folder
npm install                                                      # download the tools this project needs
npm run build                                                    # build the extension into a folder named dist
```

When this finishes, a **`dist`** folder appears inside the project. That is what Chrome loads.

### 4. Add it to Chrome

1. Open Chrome and go to: `chrome://extensions`
2. Turn on **Developer mode** (top-right switch)
3. Click **Load unpacked**
4. Select the **`dist`** folder inside the project (not the whole project folder)
5. Confirm the extension appears and is enabled

### 5. Use it on ChatGPT

1. Open [https://chatgpt.com](https://chatgpt.com)
2. Refresh the page once if you just installed the extension
3. Click the extension icon in Chrome’s toolbar (puzzle piece → pin **GPT Extension** if you like)

| Feature | How to use it |
|--------|----------------|
| **Templates** | In the ChatGPT message box, type `//` then pick a saved prompt |
| **Auto Allow** | Turn it on in the extension popup, or use the in-page toggle |
| **Title banner** | Turn it on/off and set a title prefix in **Options** / settings |
| **Conversation memory** | In settings, choose how many recent turns to keep on long pages |

Settings: right-click the extension icon → **Options**, or use the options link from the popup.

---

## Updating later

In Terminal:

```bash
cd gpt-extention   # enter the project folder (skip if you are already inside it)
git pull           # download the latest changes from GitHub
npm install        # update tools if anything new was added
npm run build      # rebuild the extension into the dist folder
```

Then open `chrome://extensions` and click the **reload** button on GPT Extension.

---

## For developers

```bash
npm install       # install project dependencies
npm run icons     # regenerate 16/48/128 icons from public/icons/icon-master.png
npm run dev       # watch mode — rebuilds as you edit; load dist/ in Chrome
npm run build     # type-check, production build, then verify dist
npm run test      # run the automated test suite (Vitest)
```

| Path | Purpose |
|------|---------|
| `public/` | Manifest, icons, fonts |
| `design-system/` | UI/UX source of truth (`MASTER.md`) |
| `scripts/` | Icon generation and post-build verification |
| `src/background/` | Service worker |
| `src/content/` | ChatGPT content scripts |
| `src/popup/` | Toolbar popup |
| `src/options/` | Settings page |
| `src/services/` | Chrome APIs, storage, messaging |
| `src/components/` | Shadow DOM UI (banner, picker, toggle, toast) |
| `src/styles/` | Shared CSS and extension font helpers |
| `src/types/` | Shared TypeScript types |
| `src/utils/` | Helpers |
| `tests/` | Vitest tests |

- **Background** handles messages and storage.
- **Popup / options** are vanilla TypeScript pages (no framework).
- **Content scripts** run on ChatGPT (`chatgpt.com`) and use `src/content/chromeApi.ts` instead of `src/services/*` (avoids MV3 web-accessible SW chunk issues).
- Design system: [`design-system/MASTER.md`](design-system/MASTER.md). UI agent skill: [`.cursor/skills/gpt-extension-ui-ux/SKILL.md`](.cursor/skills/gpt-extension-ui-ux/SKILL.md).
