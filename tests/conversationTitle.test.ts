// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import {
  cleanSidebarAriaLabel,
  isInvalidConversationTitle,
  resolveConversationTitle,
} from '@/utils/conversationTitle';
import { formatConversationTitle } from '@/utils/tabTitle';

describe('cleanSidebarAriaLabel', () => {
  it('strips pinned conversation suffix', () => {
    expect(cleanSidebarAriaLabel('Joulza-ai, pinned conversation')).toBe('Joulza-ai');
  });

  it('leaves plain aria-labels unchanged', () => {
    expect(cleanSidebarAriaLabel('Joulza-ai')).toBe('Joulza-ai');
  });
});

describe('isInvalidConversationTitle', () => {
  it('rejects dash-only placeholders', () => {
    expect(isInvalidConversationTitle('----')).toBe(true);
    expect(isInvalidConversationTitle('---')).toBe(true);
  });

  it('rejects empty titles', () => {
    expect(isInvalidConversationTitle('')).toBe(true);
    expect(isInvalidConversationTitle('   ')).toBe(true);
  });

  it('accepts real titles', () => {
    expect(isInvalidConversationTitle('Joulza-ai')).toBe(false);
  });
});

describe('resolveConversationTitle', () => {
  it('prefers active sidebar span text over document.title', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <a data-sidebar-item="true" data-active=""
         aria-label="Joulza-ai, pinned conversation"
         href="/g/g-x/c/6a5a9057-9d80-83ea-abe1-2973b85948d4">
        <span dir="auto">Joulza-ai</span>
      </a>
    `;

    expect(
      resolveConversationTitle('Daniel Brooks - ', {
        pathname: '/g/g-x/c/6a5a9057-9d80-83ea-abe1-2973b85948d4',
        documentTitle: 'Daniel Brooks - ----',
        root,
      }),
    ).toBe('Joulza-ai');
  });

  it('matches sidebar item by conversation id when data-active is missing', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <a data-sidebar-item="true"
         aria-label="Joulza-db, pinned conversation"
         href="/g/g-x/c/aaaa-bbbb">
        <span dir="auto">Joulza-db</span>
      </a>
    `;

    expect(
      resolveConversationTitle('', {
        pathname: '/g/g-x/c/aaaa-bbbb',
        documentTitle: 'ChatGPT',
        root,
      }),
    ).toBe('Joulza-db');
  });

  it('falls back to document.title when sidebar has no usable title', () => {
    const root = document.createElement('div');
    expect(
      resolveConversationTitle('Daniel Brooks - ', {
        pathname: '/c/unknown',
        documentTitle: 'Daniel Brooks - My chat - ChatGPT',
        root,
      }),
    ).toBe('My chat');
  });

  it('returns New chat when document title is dash-only', () => {
    const root = document.createElement('div');
    expect(
      resolveConversationTitle('', {
        pathname: '/',
        documentTitle: '----',
        root,
      }),
    ).toBe('New chat');
  });
});

describe('formatConversationTitle', () => {
  it('strips configured prefix', () => {
    expect(
      formatConversationTitle('Daniel Brooks - My chat', 'Daniel Brooks - '),
    ).toBe('My chat');
  });

  it('leaves title unchanged when prefix is absent', () => {
    expect(formatConversationTitle('My chat', 'Daniel Brooks - ')).toBe('My chat');
  });

  it('strips ChatGPT suffix', () => {
    expect(
      formatConversationTitle('Daniel Brooks - My chat - ChatGPT', 'Daniel Brooks - '),
    ).toBe('My chat');
  });

  it('returns fallback for empty result', () => {
    expect(formatConversationTitle('Daniel Brooks - ', 'Daniel Brooks - ')).toBe('New chat');
  });
});
