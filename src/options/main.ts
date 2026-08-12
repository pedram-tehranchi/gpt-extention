import { reloadChatGptTabs } from '@/services/chatgptTabs';
import {
  deletePin,
  getPins,
  movePin,
  savePin,
  updatePin,
} from '@/services/pins';
import { getSettings, saveSettings } from '@/services/settings';
import {
  deleteTemplate,
  getTemplates,
  moveTemplate,
  saveTemplate,
  updateTemplate,
} from '@/services/templates';
import { clampKeepLatestTurns } from '@/types/settings';
import type { Pin } from '@/types/pin';
import type { Template } from '@/types/template';
import { pinUrlHostname } from '@/utils/pinUrl';

const titlePrefixInput = document.getElementById('title-prefix') as HTMLInputElement;
const titleBannerInput = document.getElementById('title-banner-enabled') as HTMLInputElement;
const pruneOldTurnsInput = document.getElementById('prune-old-turns') as HTMLInputElement;
const keepLatestField = document.getElementById('keep-latest-field') as HTMLDivElement;
const keepLatestTurnsInput = document.getElementById('keep-latest-turns') as HTMLInputElement;
const autoAllowInput = document.getElementById('auto-allow-enabled') as HTMLInputElement;
const settingsStatus = document.getElementById('settings-status') as HTMLParagraphElement;

function syncKeepLatestControls(): void {
  const enabled = pruneOldTurnsInput.checked;
  keepLatestTurnsInput.disabled = !enabled;
  keepLatestField.classList.toggle('field--disabled', !enabled);
  keepLatestField.setAttribute('aria-disabled', enabled ? 'false' : 'true');
}

const templateForm = document.getElementById('template-form') as HTMLFormElement;
const templateIdInput = document.getElementById('template-id') as HTMLInputElement;
const templateNameInput = document.getElementById('template-name') as HTMLInputElement;
const templateContentInput = document.getElementById('template-content') as HTMLTextAreaElement;
const templateSubmitBtn = document.getElementById('template-submit') as HTMLButtonElement;
const templateCancelBtn = document.getElementById('template-cancel') as HTMLButtonElement;
const templateList = document.getElementById('template-list') as HTMLUListElement;

const pinForm = document.getElementById('pin-form') as HTMLFormElement;
const pinIdInput = document.getElementById('pin-id') as HTMLInputElement;
const pinNameInput = document.getElementById('pin-name') as HTMLInputElement;
const pinUrlInput = document.getElementById('pin-url') as HTMLInputElement;
const pinSubmitBtn = document.getElementById('pin-submit') as HTMLButtonElement;
const pinCancelBtn = document.getElementById('pin-cancel') as HTMLButtonElement;
const pinList = document.getElementById('pin-list') as HTMLUListElement;
const pinError = document.getElementById('pin-error') as HTMLParagraphElement;

let editingId: string | null = null;
let editingPinId: string | null = null;
let settingsStatusTimer: number | undefined;
let titlePrefixTimer: number | undefined;
let keepLatestTimer: number | undefined;
let loadedKeepLatestTurns: number | null = null;

function showSettingsStatus(message: string): void {
  settingsStatus.textContent = message;
  settingsStatus.hidden = false;
  if (settingsStatusTimer !== undefined) {
    window.clearTimeout(settingsStatusTimer);
  }
  settingsStatusTimer = window.setTimeout(() => {
    settingsStatus.hidden = true;
    settingsStatusTimer = undefined;
  }, 2000);
}

function showPinError(message: string | null): void {
  if (!message) {
    pinError.hidden = true;
    pinError.textContent = '';
    return;
  }
  pinError.textContent = message;
  pinError.hidden = false;
}

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  titlePrefixInput.value = settings.titlePrefixToRemove;
  titleBannerInput.checked = settings.titleBannerEnabled;
  pruneOldTurnsInput.checked = settings.pruneOldTurnsEnabled;
  keepLatestTurnsInput.value = String(settings.keepLatestTurns);
  loadedKeepLatestTurns = settings.keepLatestTurns;
  autoAllowInput.checked = settings.autoAllowEnabled;
  syncKeepLatestControls();
}

async function persistSettings(options?: { reloadTabsIfKeepChanged?: boolean }): Promise<void> {
  const current = await getSettings();
  const keepLatestTurns = clampKeepLatestTurns(Number(keepLatestTurnsInput.value));
  const keepChanged =
    loadedKeepLatestTurns !== null && keepLatestTurns !== loadedKeepLatestTurns;

  await saveSettings({
    ...current,
    titlePrefixToRemove: titlePrefixInput.value,
    titleBannerEnabled: titleBannerInput.checked,
    pruneOldTurnsEnabled: pruneOldTurnsInput.checked,
    keepLatestTurns,
    autoAllowEnabled: autoAllowInput.checked,
  });

  keepLatestTurnsInput.value = String(keepLatestTurns);
  loadedKeepLatestTurns = keepLatestTurns;
  showSettingsStatus('Saved');

  if (options?.reloadTabsIfKeepChanged && keepChanged) {
    await reloadChatGptTabs();
  }
}

function scheduleTitlePrefixSave(): void {
  if (titlePrefixTimer !== undefined) {
    window.clearTimeout(titlePrefixTimer);
  }
  titlePrefixTimer = window.setTimeout(() => {
    titlePrefixTimer = undefined;
    void persistSettings();
  }, 300);
}

function scheduleKeepLatestSave(): void {
  if (keepLatestTurnsInput.disabled) {
    return;
  }
  if (keepLatestTimer !== undefined) {
    window.clearTimeout(keepLatestTimer);
  }
  keepLatestTimer = window.setTimeout(() => {
    keepLatestTimer = undefined;
    void persistSettings({ reloadTabsIfKeepChanged: true });
  }, 400);
}

function resetTemplateForm(): void {
  editingId = null;
  templateIdInput.value = '';
  templateForm.reset();
  templateSubmitBtn.textContent = 'Add template';
  templateCancelBtn.hidden = true;
}

function startEditTemplate(template: Template): void {
  editingId = template.id;
  templateIdInput.value = template.id;
  templateNameInput.value = template.name;
  templateContentInput.value = template.content;
  templateSubmitBtn.textContent = 'Update template';
  templateCancelBtn.hidden = false;
  templateNameInput.focus();
}

function renderTemplateList(templates: Template[]): void {
  templateList.replaceChildren();

  if (templates.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'subtitle';
    empty.textContent = 'No templates yet.';
    templateList.append(empty);
    return;
  }

  templates.forEach((template, index) => {
    const item = document.createElement('li');
    item.className = 'template-item';

    const header = document.createElement('div');
    header.className = 'template-item__header';

    const name = document.createElement('h3');
    name.className = 'template-item__name';
    name.textContent = template.name;

    const actions = document.createElement('div');
    actions.className = 'template-item__actions';

    const moveUpBtn = document.createElement('button');
    moveUpBtn.type = 'button';
    moveUpBtn.className = 'button-secondary button-icon';
    moveUpBtn.textContent = '↑';
    moveUpBtn.title = 'Move up';
    moveUpBtn.setAttribute('aria-label', `Move ${template.name} up`);
    moveUpBtn.disabled = index === 0;
    moveUpBtn.addEventListener('click', () => {
      void (async () => {
        await moveTemplate(template.id, 'up');
        await refreshTemplates();
      })();
    });

    const moveDownBtn = document.createElement('button');
    moveDownBtn.type = 'button';
    moveDownBtn.className = 'button-secondary button-icon';
    moveDownBtn.textContent = '↓';
    moveDownBtn.title = 'Move down';
    moveDownBtn.setAttribute('aria-label', `Move ${template.name} down`);
    moveDownBtn.disabled = index === templates.length - 1;
    moveDownBtn.addEventListener('click', () => {
      void (async () => {
        await moveTemplate(template.id, 'down');
        await refreshTemplates();
      })();
    });

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'button-secondary';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEditTemplate(template));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'button-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      void (async () => {
        if (!window.confirm(`Delete template “${template.name}”?`)) {
          return;
        }
        await deleteTemplate(template.id);
        if (editingId === template.id) {
          resetTemplateForm();
        }
        await refreshTemplates();
      })();
    });

    actions.append(moveUpBtn, moveDownBtn, editBtn, deleteBtn);
    header.append(name, actions);

    const preview = document.createElement('p');
    preview.className = 'template-item__preview';
    preview.textContent = template.content;

    item.append(header, preview);
    templateList.append(item);
  });
}

async function refreshTemplates(): Promise<void> {
  const templates = await getTemplates();
  renderTemplateList(templates);
}

async function handleTemplateSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const input = {
    name: templateNameInput.value,
    content: templateContentInput.value,
  };

  if (editingId) {
    await updateTemplate(editingId, input);
  } else {
    await saveTemplate(input);
  }

  resetTemplateForm();
  await refreshTemplates();
  showSettingsStatus('Template saved');
}

function resetPinForm(): void {
  editingPinId = null;
  pinIdInput.value = '';
  pinForm.reset();
  pinSubmitBtn.textContent = 'Add pin';
  pinCancelBtn.hidden = true;
  showPinError(null);
}

function startEditPin(pin: Pin): void {
  editingPinId = pin.id;
  pinIdInput.value = pin.id;
  pinNameInput.value = pin.name;
  pinUrlInput.value = pin.url;
  pinSubmitBtn.textContent = 'Update pin';
  pinCancelBtn.hidden = false;
  showPinError(null);
  pinNameInput.focus();
}

function renderPinList(pins: Pin[]): void {
  pinList.replaceChildren();

  if (pins.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'subtitle';
    empty.textContent = 'No pinned URLs yet.';
    pinList.append(empty);
    return;
  }

  pins.forEach((pin, index) => {
    const item = document.createElement('li');
    item.className = 'template-item';

    const header = document.createElement('div');
    header.className = 'template-item__header';

    const name = document.createElement('h3');
    name.className = 'template-item__name';
    name.textContent = pin.name;

    const actions = document.createElement('div');
    actions.className = 'template-item__actions';

    const moveUpBtn = document.createElement('button');
    moveUpBtn.type = 'button';
    moveUpBtn.className = 'button-secondary button-icon';
    moveUpBtn.textContent = '↑';
    moveUpBtn.title = 'Move up';
    moveUpBtn.setAttribute('aria-label', `Move ${pin.name} up`);
    moveUpBtn.disabled = index === 0;
    moveUpBtn.addEventListener('click', () => {
      void (async () => {
        await movePin(pin.id, 'up');
        await refreshPins();
      })();
    });

    const moveDownBtn = document.createElement('button');
    moveDownBtn.type = 'button';
    moveDownBtn.className = 'button-secondary button-icon';
    moveDownBtn.textContent = '↓';
    moveDownBtn.title = 'Move down';
    moveDownBtn.setAttribute('aria-label', `Move ${pin.name} down`);
    moveDownBtn.disabled = index === pins.length - 1;
    moveDownBtn.addEventListener('click', () => {
      void (async () => {
        await movePin(pin.id, 'down');
        await refreshPins();
      })();
    });

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'button-secondary';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEditPin(pin));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'button-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      void (async () => {
        if (!window.confirm(`Delete pin “${pin.name}”?`)) {
          return;
        }
        await deletePin(pin.id);
        if (editingPinId === pin.id) {
          resetPinForm();
        }
        await refreshPins();
      })();
    });

    actions.append(moveUpBtn, moveDownBtn, editBtn, deleteBtn);
    header.append(name, actions);

    const preview = document.createElement('p');
    preview.className = 'template-item__preview';
    preview.textContent = `${pinUrlHostname(pin.url)} — ${pin.url}`;

    item.append(header, preview);
    pinList.append(item);
  });
}

async function refreshPins(): Promise<void> {
  const pins = await getPins();
  renderPinList(pins);
}

async function handlePinSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  showPinError(null);

  const input = {
    name: pinNameInput.value,
    url: pinUrlInput.value,
  };

  try {
    if (editingPinId) {
      await updatePin(editingPinId, input);
    } else {
      await savePin(input);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save pin.';
    showPinError(message);
    return;
  }

  resetPinForm();
  await refreshPins();
  showSettingsStatus('Pin saved');
}

titleBannerInput.addEventListener('change', () => {
  void persistSettings();
});

pruneOldTurnsInput.addEventListener('change', () => {
  syncKeepLatestControls();
  void (async () => {
    await persistSettings();
    await reloadChatGptTabs();
  })();
});

autoAllowInput.addEventListener('change', () => {
  void persistSettings();
});

titlePrefixInput.addEventListener('input', scheduleTitlePrefixSave);
titlePrefixInput.addEventListener('change', () => {
  if (titlePrefixTimer !== undefined) {
    window.clearTimeout(titlePrefixTimer);
    titlePrefixTimer = undefined;
  }
  void persistSettings();
});

keepLatestTurnsInput.addEventListener('input', scheduleKeepLatestSave);
keepLatestTurnsInput.addEventListener('change', () => {
  if (keepLatestTurnsInput.disabled) {
    return;
  }
  if (keepLatestTimer !== undefined) {
    window.clearTimeout(keepLatestTimer);
    keepLatestTimer = undefined;
  }
  void persistSettings({ reloadTabsIfKeepChanged: true });
});

templateForm.addEventListener('submit', (event) => {
  void handleTemplateSubmit(event);
});

templateCancelBtn.addEventListener('click', resetTemplateForm);

pinForm.addEventListener('submit', (event) => {
  void handlePinSubmit(event);
});

pinCancelBtn.addEventListener('click', resetPinForm);

void loadSettings();
void refreshTemplates();
void refreshPins();
