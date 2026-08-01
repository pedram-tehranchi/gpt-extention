// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoAllowToggle } from '@/components/AutoAllowToggle';

describe('AutoAllowToggle.syncEnabled', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', {
      runtime: {
        id: 'test-extension-id',
        getURL: (path: string) => `chrome-extension://test/${path}`,
      },
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('updates UI without persisting or firing onChange', () => {
    const toggle = new AutoAllowToggle();
    const onChange = vi.fn();
    toggle.onChange(onChange);
    toggle.mount(document.body);

    const host = document.querySelector('.gpt-extension-auto-allow-host');
    const shadow = host?.shadowRoot;
    const input = shadow?.querySelector<HTMLInputElement>('.auto-allow-toggle__input');
    const label = shadow?.querySelector<HTMLLabelElement>('.auto-allow-toggle');

    expect(input).toBeTruthy();
    expect(label).toBeTruthy();

    toggle.syncEnabled(true);
    expect(toggle.isEnabled()).toBe(true);
    expect(input!.checked).toBe(true);
    expect(label!.classList.contains('auto-allow-toggle--on')).toBe(true);

    toggle.syncEnabled(false);
    expect(toggle.isEnabled()).toBe(false);
    expect(input!.checked).toBe(false);
    expect(label!.classList.contains('auto-allow-toggle--on')).toBe(false);

    expect(onChange).not.toHaveBeenCalled();
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });
});
