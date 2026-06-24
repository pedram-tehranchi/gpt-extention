import { getStorageItem, setStorageItem } from '@/services/storage';
import type { Template, TemplateInput } from '@/types/template';

const TEMPLATES_KEY = 'templates';

export async function getTemplates(): Promise<Template[]> {
  return (await getStorageItem<Template[]>(TEMPLATES_KEY)) ?? [];
}

export async function saveTemplate(input: TemplateInput): Promise<Template> {
  const templates = await getTemplates();
  const template: Template = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    content: input.content,
    createdAt: Date.now(),
  };

  templates.push(template);
  await setStorageItem(TEMPLATES_KEY, templates);
  return template;
}

export async function updateTemplate(
  id: string,
  input: TemplateInput,
): Promise<Template | undefined> {
  const templates = await getTemplates();
  const index = templates.findIndex((template) => template.id === id);
  if (index === -1) {
    return undefined;
  }

  const updated: Template = {
    ...templates[index],
    name: input.name.trim(),
    content: input.content,
  };

  templates[index] = updated;
  await setStorageItem(TEMPLATES_KEY, templates);
  return updated;
}

export async function deleteTemplate(id: string): Promise<void> {
  const templates = await getTemplates();
  await setStorageItem(
    TEMPLATES_KEY,
    templates.filter((template) => template.id !== id),
  );
}
