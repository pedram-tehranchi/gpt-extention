import { TemplatePicker } from '@/components/TemplatePicker';
import { contentLog, getTemplates } from '@/content/chromeApi';
import { observeComposer } from '@/content/sites/chatgpt/observeComposer';
import { queryComposerSurface } from '@/content/sites/chatgpt/selectors';
import type { Template } from '@/types/template';
import { getTextBeforeCursor, replaceTextBeforeCursor } from '@/utils/contentEditable';
import { filterTemplatesByQuery, parseTemplateTrigger } from '@/utils/templateTrigger';

async function loadTemplates(): Promise<Template[]> {
  try {
    return await getTemplates();
  } catch (error) {
    contentLog.warn('Failed to load templates from storage', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

export function initTemplateTrigger(): () => void {
  let picker: TemplatePicker | null = null;
  let activeTextarea: HTMLElement | null = null;
  let activeTriggerText = '';
  let savedCaretRange: Range | null = null;
  let selecting = false;

  const dismissPicker = (): void => {
    picker?.hide();
    picker = null;
    activeTriggerText = '';
    savedCaretRange = null;
  };

  const handleSelect = (template: Template): void => {
    if (!activeTextarea || !activeTriggerText) {
      dismissPicker();
      return;
    }

    selecting = true;
    const textarea = activeTextarea;
    const triggerText = activeTriggerText;
    const caret = savedCaretRange;

    dismissPicker();

    window.requestAnimationFrame(() => {
      textarea.focus();
      replaceTextBeforeCursor(textarea, triggerText, template.content, caret);
      selecting = false;
    });
  };

  const syncPicker = async (textarea: HTMLElement): Promise<void> => {
    activeTextarea = textarea;
    const textBeforeCursor = getTextBeforeCursor(textarea);
    const trigger = parseTemplateTrigger(textBeforeCursor);

    if (!trigger) {
      if (!selecting) {
        dismissPicker();
      }
      return;
    }

    activeTriggerText = trigger.triggerText;

    const selection = window.getSelection();
    if (selection?.rangeCount && textarea.contains(selection.anchorNode)) {
      savedCaretRange = selection.getRangeAt(0).cloneRange();
    }

    const templates = await loadTemplates();
    const filtered = filterTemplatesByQuery(templates, trigger.query);
    const anchor =
      queryComposerSurface(textarea.closest('form') ?? document) ?? textarea;

    if (!picker) {
      picker = new TemplatePicker({
        anchor,
        templates: filtered,
        onSelect: handleSelect,
        onDismiss: dismissPicker,
      });
      picker.show();
      contentLog.info('Template picker opened', {
        trigger: trigger.triggerText,
        count: filtered.length,
      });
      return;
    }

    picker.updateTemplates(filtered);
  };

  const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Enter', 'Escape']);

  const bindTextarea = (textarea: HTMLElement): (() => void) => {
    const onInput = (): void => {
      void syncPicker(textarea);
    };

    const onKeyUp = (event: KeyboardEvent): void => {
      if (NAVIGATION_KEYS.has(event.key)) {
        return;
      }
      void syncPicker(textarea);
    };

    const onBlur = (): void => {
      window.setTimeout(() => {
        if (selecting || !picker) {
          return;
        }
        dismissPicker();
      }, 200);
    };

    textarea.addEventListener('input', onInput);
    textarea.addEventListener('keyup', onKeyUp);
    textarea.addEventListener('blur', onBlur);

    contentLog.info('Template trigger bound to composer');

    return () => {
      textarea.removeEventListener('input', onInput);
      textarea.removeEventListener('keyup', onKeyUp);
      textarea.removeEventListener('blur', onBlur);
      dismissPicker();
    };
  };

  return observeComposer(bindTextarea);
}
