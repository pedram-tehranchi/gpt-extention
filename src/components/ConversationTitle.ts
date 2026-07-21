import contentStyles from '@/styles/content.css?inline';
import { withExtensionFonts } from '@/styles/extensionFonts';

export class ConversationTitle {
  private readonly host: HTMLElement;
  private readonly label: HTMLElement;
  private visible = true;

  constructor() {
    this.host = document.createElement('div');
    this.host.id = 'gpt-extension-conversation-title';
    this.host.dataset.gptExtensionUi = 'conversation-title';
    this.host.style.cssText =
      'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483646;pointer-events:none;';

    const shadow = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = withExtensionFonts(contentStyles);
    shadow.append(style);

    this.label = document.createElement('div');
    this.label.className = 'conversation-title';
    shadow.append(this.label);
  }

  /**
   * Prefer documentElement so ChatGPT's React body root remounts don't wipe the banner.
   */
  mount(): void {
    const parent = document.documentElement;
    if (!parent.contains(this.host)) {
      parent.append(this.host);
    }
    this.host.style.display = this.visible ? '' : 'none';
  }

  unmount(): void {
    this.host.remove();
  }

  isMounted(): boolean {
    return this.host.isConnected;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.host.style.display = visible ? '' : 'none';
  }

  setTitle(title: string): void {
    this.label.textContent = title;
    this.host.title = title;
  }
}
