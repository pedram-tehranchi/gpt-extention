import { getSettings, saveSettings } from '@/services/settings';
import {
  deleteTemplate,
  getTemplates,
  saveTemplate,
  updateTemplate,
} from '@/services/templates';
import type { Template } from '@/types/template';

const titlePrefixInput = document.getElementById('title-prefix') as HTMLInputElement;
const saveSettingsBtn = document.getElementById('save-settings') as HTMLButtonElement;
const settingsStatus = document.getElementById('settings-status') as HTMLParagraphElement;

const templateForm = document.getElementById('template-form') as HTMLFormElement;
const templateIdInput = document.getElementById('template-id') as HTMLInputElement;
const templateNameInput = document.getElementById('template-name') as HTMLInputElement;
const templateContentInput = document.getElementById('template-content') as HTMLTextAreaElement;
const templateSubmitBtn = document.getElementById('template-submit') as HTMLButtonElement;
const templateCancelBtn = document.getElementById('template-cancel') as HTMLButtonElement;
const templateList = document.getElementById('template-list') as HTMLUListElement;

let editingId: string | null = null;

function showSettingsStatus(message: string): void {
  settingsStatus.textContent = message;
  settingsStatus.hidden = false;
  window.setTimeout(() => {
    settingsStatus.hidden = true;
  }, 2000);
}

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  titlePrefixInput.value = settings.titlePrefixToRemove;
}

async function handleSaveSettings(): Promise<void> {
  const current = await getSettings();
  await saveSettings({
    ...current,
    titlePrefixToRemove: titlePrefixInput.value,
  });
  showSettingsStatus('Settings saved');
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

  for (const template of templates) {
    const item = document.createElement('li');
    item.className = 'template-item';

    const header = document.createElement('div');
    header.className = 'template-item__header';

    const name = document.createElement('h3');
    name.className = 'template-item__name';
    name.textContent = template.name;

    const actions = document.createElement('div');
    actions.className = 'template-item__actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'button-secondary';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEditTemplate(template));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'button-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      await deleteTemplate(template.id);
      if (editingId === template.id) {
        resetTemplateForm();
      }
      await refreshTemplates();
    });

    actions.append(editBtn, deleteBtn);
    header.append(name, actions);

    const preview = document.createElement('p');
    preview.className = 'template-item__preview';
    preview.textContent = template.content;

    item.append(header, preview);
    templateList.append(item);
  }
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
}

saveSettingsBtn.addEventListener('click', () => {
  void handleSaveSettings();
});

templateForm.addEventListener('submit', (event) => {
  void handleTemplateSubmit(event);
});

templateCancelBtn.addEventListener('click', resetTemplateForm);

void loadSettings();
void refreshTemplates();
