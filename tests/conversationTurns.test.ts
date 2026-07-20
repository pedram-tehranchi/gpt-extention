import { describe, expect, it } from 'vitest';

import {
  preferTurnElements,
  SELECTORS,
} from '@/content/sites/chatgpt/selectors';

describe('ChatGPT turn selectors', () => {
  it('targets numbered conversation-turn testids and outer containers', () => {
    expect(SELECTORS.conversationTurn).toBe('[data-testid^="conversation-turn"]');
    expect(SELECTORS.turnContainer).toContain('data-turn-id-container');
    expect(SELECTORS.turnContainer).toContain('client-created-root');
  });

  it('prefers outer containers over nested sections', () => {
    const containers = [{ id: 'c1' }, { id: 'c2' }] as unknown as HTMLElement[];
    const sections = [{ id: 's1' }] as unknown as HTMLElement[];
    expect(preferTurnElements(containers, sections)).toBe(containers);
  });

  it('falls back to sections when containers are absent', () => {
    const sections = [{ id: 's1' }, { id: 's2' }] as unknown as HTMLElement[];
    expect(preferTurnElements([], sections)).toBe(sections);
  });
});
