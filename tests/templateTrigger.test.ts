import { describe, expect, it } from 'vitest';

import {
  filterTemplatesByQuery,
  parseTemplateTrigger,
} from '@/utils/templateTrigger';

describe('parseTemplateTrigger', () => {
  it('detects // at start of input', () => {
    expect(parseTemplateTrigger('//')).toEqual({ query: '', triggerLength: 2 });
  });

  it('detects // with filter text', () => {
    expect(parseTemplateTrigger('hello //prom')).toEqual({
      query: 'prom',
      triggerLength: 6,
    });
  });

  it('ignores https:// URLs', () => {
    expect(parseTemplateTrigger('visit https://')).toBeNull();
  });

  it('requires whitespace or start before //', () => {
    expect(parseTemplateTrigger('foo//bar')).toBeNull();
  });
});

describe('filterTemplatesByQuery', () => {
  const templates = [
    { name: 'Prompt', content: 'a' },
    { name: 'Review', content: 'b' },
    { name: 'Summary', content: 'c' },
  ];

  it('returns all templates for empty query', () => {
    expect(filterTemplatesByQuery(templates, '')).toHaveLength(3);
  });

  it('filters by prefix', () => {
    expect(filterTemplatesByQuery(templates, 'pro')).toEqual([templates[0]]);
  });
});
