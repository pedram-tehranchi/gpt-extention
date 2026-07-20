# tests

## Purpose

Vitest unit tests for utils and related pure logic.

## Contains

- `allowButton.test.ts`: Allow-button detection
- `contentEditable.test.ts`: Composer text helpers
- `conversationTitle.test.ts`: Title cleaning/resolution
- `conversationTurns.test.ts`: ChatGPT turn selectors (`preferTurnElements`)
- `pruneTurns.test.ts`: Keep-latest turn pruning
- `reorder.test.ts`: Array reorder helper
- `tabTitle.test.ts`: Title formatting
- `templateTrigger.test.ts`: `//` trigger detection
- `scaffold.test.ts`: Smoke/scaffold check

## Rules

- Prefer testing pure helpers under `src/utils/` over full browser automation.
- Run with `npm run test` or `npm run test:watch`.
- Config lives in root `vitest.config.ts` (happy-dom).

## Connections

- Exercises code in `src/utils/`, `src/types/`, and `src/content/sites/chatgpt/selectors.ts`.
- Does not replace manual Chrome load of `dist/` for content-script UI.

## Update rule

Update this file when test files are added, removed, or coverage ownership changes.
