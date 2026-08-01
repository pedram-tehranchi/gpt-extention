// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

import {
  AUTO_ALLOW_ATTR,
  clickAllowButtonIfNeeded,
} from '@/utils/allowButton';

describe('clickAllowButtonIfNeeded', () => {
  it('clicks a connected Allow button once and marks it', () => {
    const button = document.createElement('button');
    button.textContent = 'Allow';
    document.body.append(button);
    const click = vi.spyOn(button, 'click');
    const seen = new WeakSet<HTMLButtonElement>();

    expect(clickAllowButtonIfNeeded(button, seen)).toBe(true);
    expect(button.getAttribute(AUTO_ALLOW_ATTR)).toBe('true');
    expect(seen.has(button)).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);

    expect(clickAllowButtonIfNeeded(button, seen)).toBe(false);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('skips disconnected buttons', () => {
    const button = document.createElement('button');
    button.textContent = 'Allow';
    const click = vi.spyOn(button, 'click');
    const seen = new WeakSet<HTMLButtonElement>();

    expect(clickAllowButtonIfNeeded(button, seen)).toBe(false);
    expect(button.hasAttribute(AUTO_ALLOW_ATTR)).toBe(false);
    expect(click).not.toHaveBeenCalled();
  });
});
