import { getStorageItem, setStorageItem } from '@/services/storage';
import type { Pin, PinInput } from '@/types/pin';
import { normalizePinUrl } from '@/utils/pinUrl';
import { moveItem } from '@/utils/reorder';

const PINS_KEY = 'pins';

export async function getPins(): Promise<Pin[]> {
  return (await getStorageItem<Pin[]>(PINS_KEY)) ?? [];
}

export async function savePin(input: PinInput): Promise<Pin> {
  const url = normalizePinUrl(input.url);
  if (!url) {
    throw new Error('Enter a valid http(s) URL.');
  }

  const name = input.name.trim();
  if (!name) {
    throw new Error('Enter a pin name.');
  }

  const pins = await getPins();
  const pin: Pin = {
    id: crypto.randomUUID(),
    name,
    url,
    createdAt: Date.now(),
  };

  pins.push(pin);
  await setStorageItem(PINS_KEY, pins);
  return pin;
}

export async function updatePin(id: string, input: PinInput): Promise<Pin | undefined> {
  const url = normalizePinUrl(input.url);
  if (!url) {
    throw new Error('Enter a valid http(s) URL.');
  }

  const name = input.name.trim();
  if (!name) {
    throw new Error('Enter a pin name.');
  }

  const pins = await getPins();
  const index = pins.findIndex((pin) => pin.id === id);
  if (index === -1) {
    return undefined;
  }

  const updated: Pin = {
    ...pins[index],
    name,
    url,
  };

  pins[index] = updated;
  await setStorageItem(PINS_KEY, pins);
  return updated;
}

export async function deletePin(id: string): Promise<void> {
  const pins = await getPins();
  await setStorageItem(
    PINS_KEY,
    pins.filter((pin) => pin.id !== id),
  );
}

export async function movePin(id: string, direction: 'up' | 'down'): Promise<Pin[]> {
  const pins = await getPins();
  const fromIndex = pins.findIndex((pin) => pin.id === id);
  if (fromIndex === -1) {
    return pins;
  }

  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
  const reordered = moveItem(pins, fromIndex, toIndex);
  if (reordered.every((pin, index) => pin.id === pins[index]?.id)) {
    return pins;
  }

  await setStorageItem(PINS_KEY, reordered);
  return reordered;
}

/** Persist a new order; `orderedIds` must contain every current pin id exactly once. */
export async function reorderPins(orderedIds: string[]): Promise<Pin[]> {
  const pins = await getPins();
  if (orderedIds.length !== pins.length) {
    return pins;
  }

  const byId = new Map(pins.map((pin) => [pin.id, pin]));
  const reordered: Pin[] = [];

  for (const id of orderedIds) {
    const pin = byId.get(id);
    if (!pin) {
      return pins;
    }
    reordered.push(pin);
    byId.delete(id);
  }

  if (byId.size > 0) {
    return pins;
  }

  await setStorageItem(PINS_KEY, reordered);
  return reordered;
}
