export interface TemplateTriggerMatch {
  query: string;
  triggerLength: number;
  triggerText: string;
}

/**
 * Detects a `//` slash-command at the end of text before the cursor.
 * Trigger must be at start of input or preceded by whitespace.
 */
export function parseTemplateTrigger(textBeforeCursor: string): TemplateTriggerMatch | null {
  const match = textBeforeCursor.match(/(?:^|\s)(\/\/([\w-]*))$/);
  if (!match?.[1]) {
    return null;
  }

  return {
    query: match[2] ?? '',
    triggerLength: match[1].length,
    triggerText: match[1],
  };
}

export function filterTemplatesByQuery<T extends { name: string }>(
  templates: T[],
  query: string,
): T[] {
  const normalized = query.toLowerCase();
  if (!normalized) {
    return templates;
  }

  return templates.filter((template) =>
    template.name.toLowerCase().startsWith(normalized),
  );
}
