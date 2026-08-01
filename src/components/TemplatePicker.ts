import contentStyles from '@/styles/content.css?inline';
import {
  isExtensionContextValid,
  warnContextInvalidatedOnce,
} from '@/content/chromeApi';
import type { Template } from '@/types/template';
import { withExtensionFonts } from '@/styles/extensionFonts';

export interface TemplatePickerOptions {
  anchor: HTMLElement;
  templates: Template[];
  onSelect: (template: Template) => void;
  onDismiss: () => void;
}

export class TemplatePicker {
  private readonly host: HTMLElement;
  private readonly list: HTMLElement;
  private readonly options: TemplatePickerOptions;
  private activeIndex = 0;
  private templates: Template[] = [];
  private boundKeyHandler: (event: KeyboardEvent) => void;

  constructor(options: TemplatePickerOptions) {
    this.options = options;
    this.templates = options.templates;

    this.host = document.createElement('div');
    this.host.id = 'gpt-extension-template-picker';
    this.host.dataset.gptExtensionUi = 'template-picker';
    this.host.style.cssText = 'position:fixed;z-index:2147483646;';

    const shadow = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = withExtensionFonts(contentStyles);
    shadow.append(style);

    this.list = document.createElement('div');
    this.list.className = 'template-picker';
    this.list.setAttribute('role', 'listbox');
    shadow.append(this.list);

    this.boundKeyHandler = (event) => this.handleKeyDown(event);
  }

  show(): void {
    this.render();
    this.position();
    document.documentElement.append(this.host);
    document.addEventListener('keydown', this.boundKeyHandler, true);
    window.addEventListener('resize', this.positionBound);
  }

  hide(): void {
    document.removeEventListener('keydown', this.boundKeyHandler, true);
    window.removeEventListener('resize', this.positionBound);
    this.host.remove();
  }

  updateTemplates(templates: Template[]): void {
    const listUnchanged =
      this.templates.length === templates.length &&
      this.templates.every((template, index) => template.id === templates[index]?.id);

    this.templates = templates;

    if (!listUnchanged) {
      this.activeIndex = 0;
    } else {
      this.activeIndex = Math.min(this.activeIndex, Math.max(templates.length - 1, 0));
    }

    this.render();
    this.position();
  }

  private positionBound = (): void => {
    this.position();
  };

  private position(): void {
    const rect = this.options.anchor.getBoundingClientRect();
    this.host.style.left = `${rect.left}px`;
    this.host.style.top = `${rect.top - 8}px`;
    this.host.style.transform = 'translateY(-100%)';
    this.host.style.width = `${Math.max(rect.width, 220)}px`;
  }

  private render(): void {
    this.list.replaceChildren();

    if (this.templates.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'template-picker__empty';

      const message = document.createElement('div');
      message.textContent = 'No templates yet.';

      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'template-picker__empty-action';
      action.textContent = 'Add templates in settings';
      action.addEventListener('mousedown', (event) => {
        event.preventDefault();
        if (!isExtensionContextValid()) {
          warnContextInvalidatedOnce();
          this.options.onDismiss();
          return;
        }
        try {
          chrome.runtime.openOptionsPage();
        } catch {
          warnContextInvalidatedOnce();
        }
        this.options.onDismiss();
      });

      empty.append(message, action);
      this.list.append(empty);
      return;
    }

    this.templates.forEach((template, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'template-picker__item';
      button.textContent = template.name;
      button.setAttribute('role', 'option');
      button.dataset.index = String(index);

      if (index === this.activeIndex) {
        button.classList.add('template-picker__item--active');
        button.setAttribute('aria-selected', 'true');
      }

      button.addEventListener('mousedown', (event) => {
        event.preventDefault();
        this.selectTemplate(template);
      });

      this.list.append(button);
    });

    this.scrollActiveIntoView();
  }

  private scrollActiveIntoView(): void {
    const active = this.list.querySelector<HTMLElement>(
      '.template-picker__item--active',
    );
    active?.scrollIntoView({ block: 'nearest' });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.templates.length === 0) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.options.onDismiss();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = (this.activeIndex + 1) % this.templates.length;
        this.render();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex =
          (this.activeIndex - 1 + this.templates.length) % this.templates.length;
        this.render();
        break;
      case 'Enter':
        event.preventDefault();
        this.selectTemplate(this.templates[this.activeIndex]);
        break;
      case 'Escape':
        event.preventDefault();
        this.options.onDismiss();
        break;
    }
  }

  private selectTemplate(template: Template): void {
    this.options.onSelect(template);
  }
}
