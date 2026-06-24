import { describe, expect, it } from 'vitest';

import { formatConversationTitle } from '@/utils/tabTitle';

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
