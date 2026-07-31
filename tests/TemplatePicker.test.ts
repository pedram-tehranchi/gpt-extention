// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TemplatePicker } from '@/components/TemplatePicker';
import type { Template } from '@/types/template';

function makeTemplates(count: number): Template[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `t-${index}`,
    name: `Template ${index}`,
    content: `content ${index}`,
    createdAt: index,
  }));
}

describe('TemplatePicker keyboard scroll', () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;
  let picker: TemplatePicker | null = null;

  beforeEach(() => {
    vi.stubGlobal('chrome', {
      runtime: {
        getURL: (path: string) => `chrome-extension://test/${path}`,
        openOptionsPage: vi.fn(),
      },
    });

    scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    picker?.hide();
    picker = null;
    document.documentElement.replaceChildren();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('scrolls the active item into view on ArrowDown and ArrowUp', () => {
    const anchor = document.createElement('div');
    document.body.append(anchor);

    picker = new TemplatePicker({
      anchor,
      templates: makeTemplates(12),
      onSelect: vi.fn(),
      onDismiss: vi.fn(),
    });
    picker.show();
    scrollIntoView.mockClear();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });

    scrollIntoView.mockClear();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });
});
