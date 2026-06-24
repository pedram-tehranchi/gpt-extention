import contentStyles from '@/styles/content.css?inline';

export class ConversationTitle {
  private readonly host: HTMLElement;
  private readonly label: HTMLElement;

  constructor() {
    this.host = document.createElement('div');
    this.host.id = 'gpt-extension-conversation-title';
    this.host.style.cssText =
      'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:10000;';

    const shadow = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = contentStyles;
    shadow.append(style);

    this.label = document.createElement('div');
    this.label.className = 'conversation-title';
    shadow.append(this.label);
  }

  mount(): void {
    if (!document.body.contains(this.host)) {
      document.body.append(this.host);
    }
  }

  unmount(): void {
    this.host.remove();
  }

  setTitle(title: string): void {
    this.label.textContent = title;
    this.host.title = title;
  }
}
