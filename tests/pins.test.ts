// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deletePin, getPins, movePin, reorderPins, savePin, updatePin } from '@/services/pins';

describe('pins service', () => {
  let store: Record<string, unknown>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({ [key]: store[key] })),
          set: vi.fn(async (items: Record<string, unknown>) => {
            Object.assign(store, items);
          }),
          remove: vi.fn(async (key: string) => {
            delete store[key];
          }),
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('starts empty, saves, updates, and deletes pins', async () => {
    await expect(getPins()).resolves.toEqual([]);

    const created = await savePin({ name: ' Docs ', url: 'example.com/a' });
    expect(created.name).toBe('Docs');
    expect(created.url).toBe('https://example.com/a');

    let pins = await getPins();
    expect(pins).toHaveLength(1);
    expect(pins[0]?.id).toBe(created.id);

    const updated = await updatePin(created.id, {
      name: 'Docs v2',
      url: 'https://example.com/b',
    });
    expect(updated?.name).toBe('Docs v2');
    expect(updated?.url).toBe('https://example.com/b');

    pins = await getPins();
    expect(pins[0]?.name).toBe('Docs v2');

    await deletePin(created.id);
    await expect(getPins()).resolves.toEqual([]);
  });

  it('rejects invalid URLs and empty names', async () => {
    await expect(savePin({ name: 'Bad', url: 'javascript:alert(1)' })).rejects.toThrow(
      /http\(s\)/i,
    );
    await expect(savePin({ name: '   ', url: 'https://ok.example' })).rejects.toThrow(/name/i);
  });

  it('reorders pins with movePin', async () => {
    const first = await savePin({ name: 'One', url: 'https://one.example' });
    const second = await savePin({ name: 'Two', url: 'https://two.example' });
    const third = await savePin({ name: 'Three', url: 'https://three.example' });

    let pins = await movePin(second.id, 'up');
    expect(pins.map((pin) => pin.id)).toEqual([second.id, first.id, third.id]);

    pins = await movePin(second.id, 'down');
    expect(pins.map((pin) => pin.id)).toEqual([first.id, second.id, third.id]);

    pins = await movePin(first.id, 'up');
    expect(pins.map((pin) => pin.id)).toEqual([first.id, second.id, third.id]);
  });

  it('reorders pins with reorderPins', async () => {
    const first = await savePin({ name: 'One', url: 'https://one.example' });
    const second = await savePin({ name: 'Two', url: 'https://two.example' });
    const third = await savePin({ name: 'Three', url: 'https://three.example' });

    const pins = await reorderPins([third.id, first.id, second.id]);
    expect(pins.map((pin) => pin.id)).toEqual([third.id, first.id, second.id]);
  });
});
