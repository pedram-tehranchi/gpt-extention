import { getStorageItem, setStorageItem } from '@/services/storage';
import type { Template, TemplateInput } from '@/types/template';
import { moveItem } from '@/utils/reorder';

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

/** Persist a new order; `orderedIds` must contain every current template id exactly once. */
export async function reorderTemplates(orderedIds: string[]): Promise<Template[]> {
  const templates = await getTemplates();
  if (orderedIds.length !== templates.length) {
    return templates;
  }

  const byId = new Map(templates.map((template) => [template.id, template]));
  const reordered: Template[] = [];

  for (const id of orderedIds) {
    const template = byId.get(id);
    if (!template) {
      return templates;
    }
    reordered.push(template);
    byId.delete(id);
  }

  if (byId.size > 0) {
    return templates;
  }

  await setStorageItem(TEMPLATES_KEY, reordered);
  return reordered;
}

export async function moveTemplate(id: string, direction: 'up' | 'down'): Promise<Template[]> {
  const templates = await getTemplates();
  const fromIndex = templates.findIndex((template) => template.id === id);
  if (fromIndex === -1) {
    return templates;
  }

  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
  const reordered = moveItem(templates, fromIndex, toIndex);
  if (reordered.every((template, index) => template.id === templates[index]?.id)) {
    return templates;
  }

  await setStorageItem(TEMPLATES_KEY, reordered);
  return reordered;
}
