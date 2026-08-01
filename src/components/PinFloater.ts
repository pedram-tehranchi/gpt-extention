import contentStyles from '@/styles/content.css?inline';
import {
  getPinFloaterPosition,
  getPins,
  reorderPins,
  savePin,
  savePinFloaterPosition,
  onStorageChanged,
  offStorageChanged,
} from '@/content/chromeApi';
import type { Pin, PinFloaterPosition } from '@/types/pin';
import { withExtensionFonts } from '@/styles/extensionFonts';
import { exceededDragThreshold } from '@/utils/dragThreshold';
import {
  absoluteToEdgePosition,
  clampAbsolutePosition,
  edgeToAbsolutePosition,
  isLegacyPinFloaterPosition,
  normalizeStoredPinFloaterPosition,
} from '@/utils/pinFloaterPosition';

const FLOATER_SIZE = 36;
const DEFAULT_RIGHT = 20;
const DEFAULT_BOTTOM = 88;
const PANEL_GAP = 10;
const POSITION_STORAGE_KEY = 'pinFloaterPosition';

function defaultEdgePosition(): PinFloaterPosition {
  return { right: DEFAULT_RIGHT, bottom: DEFAULT_BOTTOM };
}

export class PinFloater {
  private readonly host: HTMLElement;
  private readonly root: HTMLElement;
  private readonly trigger: HTMLButtonElement;
  private readonly panel: HTMLElement;
  private pins: Pin[] = [];
  private open = false;
  private dragging = false;
  private didDrag = false;
  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private originLeft = 0;
  private originTop = 0;
  /** Persisted shared placement (viewport edge insets). */
  private edgePosition: PinFloaterPosition = defaultEdgePosition();
  /** Current on-screen absolute coords used while dragging/rendering. */
  private absoluteLeft = 0;
  private absoluteTop = 0;
  private nameInput: HTMLInputElement | null = null;
  private urlInput: HTMLInputElement | null = null;
  private formError: HTMLElement | null = null;
  private saving = false;
  private adding = false;
  /** Skip applying our own storage writes back onto this instance. */
  private ignoreNextPositionStorageEvent = false;
  private dragFromId: string | null = null;
  private suppressPinClick = false;

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging || event.pointerId !== this.pointerId) {
      return;
    }

    if (!this.didDrag && exceededDragThreshold(this.startX, this.startY, event.clientX, event.clientY)) {
      this.didDrag = true;
      this.closePanel();
      this.trigger.classList.add('pin-floater__trigger--dragging');
    }

    if (!this.didDrag) {
      return;
    }

    const next = clampAbsolutePosition(
      this.originLeft + (event.clientX - this.startX),
      this.originTop + (event.clientY - this.startY),
      FLOATER_SIZE,
      window.innerWidth,
      window.innerHeight,
    );
    this.applyAbsolute(next.left, next.top, false);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) {
      return;
    }

    this.dragging = false;
    this.pointerId = null;
    this.trigger.classList.remove('pin-floater__trigger--dragging');
    this.trigger.releasePointerCapture?.(event.pointerId);

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);

    if (this.didDrag) {
      this.edgePosition = absoluteToEdgePosition(
        this.absoluteLeft,
        this.absoluteTop,
        FLOATER_SIZE,
        window.innerWidth,
        window.innerHeight,
      );
      this.ignoreNextPositionStorageEvent = true;
      void savePinFloaterPosition(this.edgePosition);
      return;
    }

    this.togglePanel();
  };

  private readonly onDocPointerDown = (event: PointerEvent): void => {
    if (!this.open) {
      return;
    }
    const path = event.composedPath();
    if (path.includes(this.host)) {
      return;
    }
    this.closePanel();
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open) {
      this.closePanel();
    }
  };

  private readonly onResize = (): void => {
    this.applyEdge(this.edgePosition);
    if (this.open) {
      this.positionPanel();
    }
  };

  private readonly onStorageChanged = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ): void => {
    if (areaName !== 'local') {
      return;
    }

    if (changes.pins) {
      const next = changes.pins.newValue as Pin[] | undefined;
      this.pins = Array.isArray(next) ? next : [];
      if (this.open) {
        this.renderPanel();
      }
    }

    if (changes[POSITION_STORAGE_KEY]) {
      if (this.ignoreNextPositionStorageEvent) {
        this.ignoreNextPositionStorageEvent = false;
        return;
      }
      if (this.dragging) {
        return;
      }
      const normalized = normalizeStoredPinFloaterPosition(
        changes[POSITION_STORAGE_KEY].newValue,
        FLOATER_SIZE,
        window.innerWidth,
        window.innerHeight,
      );
      if (normalized) {
        this.applyEdge(normalized);
      }
    }
  };

  constructor() {
    this.host = document.createElement('div');
    this.host.id = 'gpt-extension-pin-floater';
    this.host.dataset.gptExtensionUi = 'pin-floater';
    // Inline display/position so :host { all: initial } cannot collapse the control.
    this.host.style.cssText = `display:block;position:fixed;z-index:2147483645;width:${FLOATER_SIZE}px;height:${FLOATER_SIZE}px;`;

    const shadow = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = withExtensionFonts(contentStyles);
    shadow.append(style);

    this.root = document.createElement('div');
    this.root.className = 'pin-floater';

    this.trigger = document.createElement('button');
    this.trigger.type = 'button';
    this.trigger.className = 'pin-floater__trigger';
    this.trigger.setAttribute('aria-label', 'Pinned URLs');
    this.trigger.setAttribute('aria-haspopup', 'true');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.innerHTML =
      '<svg class="pin-floater__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a5 5 0 0 1 5 5c0 1.8-.95 3.37-2.37 4.25L14 21l-2-1-2 1-.63-9.75A5 5 0 0 1 12 2Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>';

    this.panel = document.createElement('div');
    this.panel.className = 'pin-floater__panel';
    this.panel.hidden = true;
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'Pinned URLs');

    this.root.append(this.trigger, this.panel);
    shadow.append(this.root);

    this.trigger.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      this.dragging = true;
      this.didDrag = false;
      this.pointerId = event.pointerId;
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.originLeft = this.absoluteLeft;
      this.originTop = this.absoluteTop;
      this.trigger.setPointerCapture?.(event.pointerId);
      window.addEventListener('pointermove', this.onPointerMove);
      window.addEventListener('pointerup', this.onPointerUp);
      window.addEventListener('pointercancel', this.onPointerUp);
    });
  }

  /**
   * Prefer documentElement so ChatGPT's React body remounts don't wipe the floater.
   * Call again after removal — ChatGPT sometimes strips unknown html children.
   */
  ensureMounted(): void {
    if (!this.host.isConnected) {
      document.documentElement.append(this.host);
    }
  }

  isMounted(): boolean {
    return this.host.isConnected;
  }

  async mount(): Promise<() => void> {
    this.applyEdge(defaultEdgePosition());
    this.ensureMounted();

    const saved = await getPinFloaterPosition();
    const normalized = normalizeStoredPinFloaterPosition(
      saved,
      FLOATER_SIZE,
      window.innerWidth,
      window.innerHeight,
    );
    this.applyEdge(normalized ?? defaultEdgePosition());
    this.ensureMounted();

    // Migrate legacy left/top storage to shared edge insets once.
    if (normalized && isLegacyPinFloaterPosition(saved)) {
      this.ignoreNextPositionStorageEvent = true;
      void savePinFloaterPosition(normalized);
    }

    this.pins = await getPins();
    this.ensureMounted();
    onStorageChanged(this.onStorageChanged);
    document.addEventListener('pointerdown', this.onDocPointerDown, true);
    document.addEventListener('keydown', this.onKeyDown, true);
    window.addEventListener('resize', this.onResize);

    return () => this.destroy();
  }

  private destroy(): void {
    this.closePanel();
    offStorageChanged(this.onStorageChanged);
    document.removeEventListener('pointerdown', this.onDocPointerDown, true);
    document.removeEventListener('keydown', this.onKeyDown, true);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.host.remove();
  }

  private applyEdge(edge: PinFloaterPosition): void {
    this.edgePosition = edge;
    const absolute = edgeToAbsolutePosition(
      edge,
      FLOATER_SIZE,
      window.innerWidth,
      window.innerHeight,
    );
    const clamped = clampAbsolutePosition(
      absolute.left,
      absolute.top,
      FLOATER_SIZE,
      window.innerWidth,
      window.innerHeight,
    );
    this.applyAbsolute(clamped.left, clamped.top, true);
  }

  private applyAbsolute(left: number, top: number, syncEdge: boolean): void {
    this.absoluteLeft = left;
    this.absoluteTop = top;
    if (syncEdge) {
      this.edgePosition = absoluteToEdgePosition(
        left,
        top,
        FLOATER_SIZE,
        window.innerWidth,
        window.innerHeight,
      );
    }
    this.host.style.left = `${left}px`;
    this.host.style.top = `${top}px`;
    this.host.style.right = 'auto';
    this.host.style.bottom = 'auto';
    if (this.open) {
      this.positionPanel();
    }
  }

  private togglePanel(): void {
    if (this.open) {
      this.closePanel();
      return;
    }
    this.openPanel();
  }

  private openPanel(): void {
    this.open = true;
    this.adding = false;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.panel.hidden = false;
    this.renderPanel();
    this.positionPanel();
  }

  private closePanel(): void {
    this.open = false;
    this.adding = false;
    this.trigger.setAttribute('aria-expanded', 'false');
    this.panel.hidden = true;
    this.nameInput = null;
    this.urlInput = null;
    this.formError = null;
  }

  private positionPanel(): void {
    const spaceAbove = this.absoluteTop;
    const spaceBelow = window.innerHeight - (this.absoluteTop + FLOATER_SIZE);
    const placeAbove = spaceAbove >= spaceBelow || spaceBelow < 160;

    this.panel.classList.toggle('pin-floater__panel--above', placeAbove);
    this.panel.classList.toggle('pin-floater__panel--below', !placeAbove);

    const panelWidth = 168;
    let left = 0;
    if (this.absoluteLeft + panelWidth > window.innerWidth - 8) {
      left = Math.min(0, window.innerWidth - 8 - panelWidth - this.absoluteLeft);
    }
    this.panel.style.setProperty('--pin-panel-offset-x', `${left}px`);
    this.panel.style.setProperty('--pin-panel-gap', `${PANEL_GAP}px`);
  }

  private renderPanel(): void {
    const previousName = this.nameInput?.value ?? '';
    const previousUrl = this.urlInput?.value ?? '';
    const previousError = this.formError?.textContent ?? '';

    this.panel.replaceChildren();

    const list = document.createElement('div');
    list.className = 'pin-floater__list';
    list.setAttribute('role', 'menu');

    if (this.pins.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'pin-floater__empty';
      empty.textContent = 'No pinned URLs yet.';
      list.append(empty);
    } else {
      for (const pin of this.pins) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'pin-floater__item';
        button.setAttribute('role', 'menuitem');
        button.draggable = true;
        button.dataset.pinId = pin.id;
        button.title = 'Drag to reorder, click to open';

        const name = document.createElement('span');
        name.className = 'pin-floater__item-name';
        name.textContent = pin.name;

        button.append(name);
        this.bindPinItemInteractions(button, pin);
        list.append(button);
      }
    }

    const footer = document.createElement('div');
    footer.className = 'pin-floater__footer';

    if (this.adding) {
      footer.append(this.buildAddForm(previousName, previousUrl, previousError));
    } else {
      const addButton = document.createElement('button');
      addButton.type = 'button';
      addButton.className = 'pin-floater__add';
      addButton.textContent = 'Add pin';
      addButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.adding = true;
        this.renderPanel();
        this.positionPanel();
        window.requestAnimationFrame(() => {
          this.nameInput?.focus();
        });
      });
      footer.append(addButton);
    }

    this.panel.append(list, footer);
  }

  private bindPinItemInteractions(button: HTMLButtonElement, pin: Pin): void {
    button.addEventListener('dragstart', (event) => {
      this.dragFromId = pin.id;
      this.suppressPinClick = false;
      button.classList.add('pin-floater__item--dragging');
      event.dataTransfer?.setData('text/plain', pin.id);
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
      }
    });

    button.addEventListener('dragend', () => {
      this.dragFromId = null;
      button.classList.remove('pin-floater__item--dragging');
      this.clearDropTargets();
    });

    button.addEventListener('dragover', (event) => {
      if (!this.dragFromId || this.dragFromId === pin.id) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      this.clearDropTargets();
      button.classList.add('pin-floater__item--drop-target');
    });

    button.addEventListener('dragleave', () => {
      button.classList.remove('pin-floater__item--drop-target');
    });

    button.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      button.classList.remove('pin-floater__item--drop-target');

      const fromId = this.dragFromId ?? event.dataTransfer?.getData('text/plain');
      if (!fromId || fromId === pin.id) {
        return;
      }

      this.suppressPinClick = true;
      void this.reorderPinTo(fromId, pin.id);
    });

    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (this.suppressPinClick) {
        this.suppressPinClick = false;
        return;
      }
      window.open(pin.url, '_blank', 'noopener,noreferrer');
      this.closePanel();
    });
  }

  private clearDropTargets(): void {
    this.panel
      .querySelectorAll('.pin-floater__item--drop-target')
      .forEach((node) => node.classList.remove('pin-floater__item--drop-target'));
  }

  private async reorderPinTo(fromId: string, toId: string): Promise<void> {
    const fromIndex = this.pins.findIndex((pin) => pin.id === fromId);
    const toIndex = this.pins.findIndex((pin) => pin.id === toId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    const next = [...this.pins];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    this.pins = next;
    this.renderPanel();

    const saved = await reorderPins(next.map((pin) => pin.id));
    if (saved) {
      this.pins = saved;
      if (this.open) {
        this.renderPanel();
      }
    }
  }

  private buildAddForm(nameValue: string, urlValue: string, errorText: string): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'pin-floater__form';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.handleAddSubmit();
    });

    const nameField = document.createElement('label');
    nameField.className = 'pin-floater__field';
    const nameLabel = document.createElement('span');
    nameLabel.className = 'pin-floater__field-label';
    nameLabel.textContent = 'Name';
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.className = 'pin-floater__input';
    this.nameInput.required = true;
    this.nameInput.autocomplete = 'off';
    this.nameInput.placeholder = 'Docs';
    this.nameInput.value = nameValue;
    nameField.append(nameLabel, this.nameInput);

    const urlField = document.createElement('label');
    urlField.className = 'pin-floater__field';
    const urlLabel = document.createElement('span');
    urlLabel.className = 'pin-floater__field-label';
    urlLabel.textContent = 'URL';
    this.urlInput = document.createElement('input');
    this.urlInput.type = 'text';
    this.urlInput.className = 'pin-floater__input';
    this.urlInput.required = true;
    this.urlInput.autocomplete = 'off';
    this.urlInput.placeholder = 'https://example.com';
    this.urlInput.value = urlValue;
    urlField.append(urlLabel, this.urlInput);

    this.formError = document.createElement('p');
    this.formError.className = 'pin-floater__form-error';
    this.formError.hidden = !errorText;
    this.formError.textContent = errorText;

    const actions = document.createElement('div');
    actions.className = 'pin-floater__form-actions';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'pin-floater__cancel';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', (event) => {
      event.preventDefault();
      this.adding = false;
      this.nameInput = null;
      this.urlInput = null;
      this.formError = null;
      this.renderPanel();
      this.positionPanel();
    });

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'pin-floater__submit';
    submit.textContent = 'Save pin';
    submit.disabled = this.saving;

    actions.append(cancel, submit);
    form.append(nameField, urlField, this.formError, actions);
    return form;
  }

  private setFormError(message: string | null): void {
    if (!this.formError) {
      return;
    }
    if (!message) {
      this.formError.hidden = true;
      this.formError.textContent = '';
      return;
    }
    this.formError.textContent = message;
    this.formError.hidden = false;
  }

  private async handleAddSubmit(): Promise<void> {
    if (this.saving || !this.nameInput || !this.urlInput) {
      return;
    }

    const name = this.nameInput.value;
    const url = this.urlInput.value;
    this.setFormError(null);
    this.saving = true;

    const submit = this.panel.querySelector<HTMLButtonElement>('.pin-floater__submit');
    if (submit) {
      submit.disabled = true;
    }

    try {
      const pin = await savePin({ name, url });
      if (!pin) {
        this.setFormError('Could not save pin. Refresh this tab if the extension was reloaded.');
        return;
      }
      this.pins = await getPins();
      this.adding = false;
      this.nameInput = null;
      this.urlInput = null;
      this.formError = null;
      this.renderPanel();
      this.positionPanel();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save pin.';
      this.setFormError(message);
    } finally {
      this.saving = false;
      const nextSubmit = this.panel.querySelector<HTMLButtonElement>('.pin-floater__submit');
      if (nextSubmit) {
        nextSubmit.disabled = false;
      }
    }
  }
}