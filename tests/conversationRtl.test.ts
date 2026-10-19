// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import {
  CONVERSATION_RTL_CLASS,
  CONVERSATION_RTL_STYLE_ID,
  FORCED_RTL_ATTR,
  applyConversationRtl,
  ensureConversationRtlStyles,
  syncForcedRtlDirs,
} from '@/content/sites/chatgpt/conversationRtl';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { CONTENT_DEFAULT_SETTINGS } from '@/content/chromeApi';

describe('conversationRtl settings defaults', () => {
  it('defaults conversationRtlEnabled to false in both settings sources', () => {
    expect(DEFAULT_SETTINGS.conversationRtlEnabled).toBe(false);
    expect(CONTENT_DEFAULT_SETTINGS.conversationRtlEnabled).toBe(false);
  });
});

describe('conversationRtl DOM helpers', () => {
  afterEach(() => {
    document.documentElement.classList.remove(CONVERSATION_RTL_CLASS);
    document.getElementById(CONVERSATION_RTL_STYLE_ID)?.remove();
    document.body.replaceChildren();
  });

  it('injects stylesheet once and toggles the html class', () => {
    const first = ensureConversationRtlStyles();
    const second = ensureConversationRtlStyles();
    expect(first).toBe(second);
    expect(document.getElementById(CONVERSATION_RTL_STYLE_ID)).toBe(first);
    expect(first.textContent).toContain('direction: rtl');

    applyConversationRtl(true);
    expect(document.documentElement.classList.contains(CONVERSATION_RTL_CLASS)).toBe(true);

    applyConversationRtl(false);
    expect(document.documentElement.classList.contains(CONVERSATION_RTL_CLASS)).toBe(false);
  });

  it('overrides dir=auto on current ChatGPT message nodes without conversation-turn', () => {
    // Current ChatGPT DOM: no data-testid=conversation-turn; messages use
    // data-markdown-text-style / data-user-message-bubble instead.
    ensureConversationRtlStyles();
    document.body.innerHTML = `
      <div data-thread-find-target="conversation">
        <div data-user-message-bubble="true">
          <div class="text-size-chat whitespace-pre-wrap" dir="auto">من فارسی می‌نویسم</div>
        </div>
        <div data-markdown-text-style="assistant-message" dir="auto">
          <ul dir="auto">
            <li><strong>GLiNER</strong>: فارسی
              <span dir="ltr">Bank of Japan</span>
            </li>
          </ul>
        </div>
      </div>
    `;

    applyConversationRtl(true);
    syncForcedRtlDirs();

    const markdown = document.querySelector('[data-markdown-text-style]')!;
    const list = document.querySelector('ul')!;
    const userText = document.querySelector('[data-user-message-bubble] [dir]')!;
    const code = document.querySelector('[dir="ltr"]')!;

    expect(markdown.getAttribute('dir')).toBe('rtl');
    expect(markdown.getAttribute(FORCED_RTL_ATTR)).toBe('1');
    expect(list.getAttribute('dir')).toBe('rtl');
    expect(userText.getAttribute('dir')).toBe('rtl');
    expect(code.getAttribute('dir')).toBe('ltr');
    expect(code.hasAttribute(FORCED_RTL_ATTR)).toBe(false);

    const css = document.getElementById(CONVERSATION_RTL_STYLE_ID)?.textContent ?? '';
    expect(css).toContain('[data-markdown-text-style]');
    expect(css).toContain('[data-user-message-bubble]');
    expect(css).toContain('!important');

    applyConversationRtl(false);
    expect(markdown.getAttribute('dir')).toBe('auto');
    expect(markdown.hasAttribute(FORCED_RTL_ATTR)).toBe(false);
    expect(list.getAttribute('dir')).toBe('auto');
    expect(userText.getAttribute('dir')).toBe('auto');
  });

  it('still works when legacy conversation-turn wrappers are present', () => {
    ensureConversationRtlStyles();
    const turn = document.createElement('section');
    turn.setAttribute('data-testid', 'conversation-turn-1');
    turn.innerHTML = `
      <div data-markdown-text-style="assistant-message" dir="auto">
        <p dir="auto">Entity: متن</p>
      </div>
    `;
    document.body.append(turn);

    applyConversationRtl(true);
    syncForcedRtlDirs();

    expect(turn.querySelector('[data-markdown-text-style]')!.getAttribute('dir')).toBe('rtl');
    expect(turn.querySelector('p')!.getAttribute('dir')).toBe('rtl');
  });
});
