// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import {
  isRenderedTurn,
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

  it('treats conversation-turn sections as rendered', () => {
    const section = document.createElement('section');
    section.setAttribute('data-testid', 'conversation-turn-3');
    expect(isRenderedTurn(section)).toBe(true);
  });

  it('treats wrappers that contain a conversation-turn as rendered', () => {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-turn-id-container', 'abc');
    const section = document.createElement('section');
    section.setAttribute('data-testid', 'conversation-turn-1');
    wrapper.append(section);
    expect(isRenderedTurn(wrapper)).toBe(true);
  });

  it('treats empty virtualizer placeholders as not rendered', () => {
    const placeholder = document.createElement('div');
    placeholder.setAttribute('data-turn-id-container', 'empty-slot');
    expect(isRenderedTurn(placeholder)).toBe(false);
  });
});
