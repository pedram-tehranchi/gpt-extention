import { TemplatePicker } from '@/components/TemplatePicker';
import { observeComposer } from '@/content/sites/chatgpt/observeComposer';
import { queryPromptHeader } from '@/content/sites/chatgpt/selectors';
import { getTemplates } from '@/services/extensionClient';
import type { Template } from '@/types/template';
import { getTextBeforeCursor, replaceTextBeforeCursor } from '@/utils/contentEditable';
import { filterTemplatesByQuery, parseTemplateTrigger } from '@/utils/templateTrigger';
import { logger } from '@/utils/logger';

export function initTemplateTrigger(): () => void {
  let picker: TemplatePicker | null = null;
  let activeTextarea: HTMLElement | null = null;
  let activeTriggerText = '';
  let savedCaretRange: Range | null = null;

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

    activeTextarea.focus();
    replaceTextBeforeCursor(
      activeTextarea,
      activeTriggerText,
      template.content,
      savedCaretRange,
    );
    dismissPicker();
  };

  const syncPicker = async (textarea: HTMLElement): Promise<void> => {
    activeTextarea = textarea;
    const textBeforeCursor = getTextBeforeCursor(textarea);
    const trigger = parseTemplateTrigger(textBeforeCursor);

    if (!trigger) {
      dismissPicker();
      return;
    }

    activeTriggerText = trigger.triggerText;

    const selection = window.getSelection();
    if (selection?.rangeCount && textarea.contains(selection.anchorNode)) {
      savedCaretRange = selection.getRangeAt(0).cloneRange();
    }

    const templates = await getTemplates();
    const filtered = filterTemplatesByQuery(templates, trigger.query);
    const anchor = queryPromptHeader(textarea.closest('form') ?? document) ?? textarea;

    if (!picker) {
      picker = new TemplatePicker({
        anchor,
        templates: filtered,
        onSelect: handleSelect,
        onDismiss: dismissPicker,
      });
      picker.show();
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
        if (!picker) {
          return;
        }
        dismissPicker();
      }, 150);
    };

    textarea.addEventListener('input', onInput);
    textarea.addEventListener('keyup', onKeyUp);
    textarea.addEventListener('blur', onBlur);

    logger.info('Template trigger bound to composer');

    return () => {
      textarea.removeEventListener('input', onInput);
      textarea.removeEventListener('keyup', onKeyUp);
      textarea.removeEventListener('blur', onBlur);
      dismissPicker();
    };
  };

  return observeComposer(bindTextarea);
}
