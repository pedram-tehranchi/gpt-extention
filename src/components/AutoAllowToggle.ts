import contentStyles from '@/styles/content.css?inline';
import { getSettings, saveSettings } from '@/content/chromeApi';
import { withExtensionFonts } from '@/styles/extensionFonts';

export class AutoAllowToggle {
  private readonly host: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly label: HTMLLabelElement;
  private enabled = false;
  private changeCallback: ((enabled: boolean) => void) | null = null;

  constructor() {
    this.host = document.createElement('div');
    this.host.className = 'gpt-extension-auto-allow-host';

    const shadow = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = withExtensionFonts(contentStyles);
    shadow.append(style);

    this.label = document.createElement('label');
    this.label.className = 'auto-allow-toggle';

    this.input = document.createElement('input');
    this.input.type = 'checkbox';
    this.input.className = 'auto-allow-toggle__input';
    this.input.setAttribute('role', 'switch');
    this.input.setAttribute('aria-label', 'Auto Allow');

    const track = document.createElement('span');
    track.className = 'auto-allow-toggle__track';

    const thumb = document.createElement('span');
    thumb.className = 'auto-allow-toggle__thumb';
    track.append(thumb);

    const text = document.createElement('span');
    text.className = 'auto-allow-toggle__label';
    text.textContent = 'Auto Allow';

    this.label.append(this.input, track, text);
    shadow.append(this.label);

    this.input.addEventListener('change', () => {
      void this.handleToggle(this.input.checked);
    });
  }

  mount(container: HTMLElement): void {
    if (!container.contains(this.host)) {
      container.append(this.host);
    }
    void this.loadState();
  }

  unmount(): void {
    this.host.remove();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  onChange(callback: (enabled: boolean) => void): void {
    this.changeCallback = callback;
  }

  private async loadState(): Promise<void> {
    const settings = await getSettings();
    await this.setEnabled(settings.autoAllowEnabled, false, false);
  }

  private async handleToggle(checked: boolean): Promise<void> {
    await this.setEnabled(checked, true);
  }

  private async setEnabled(
    enabled: boolean,
    persist: boolean,
    notify = true,
  ): Promise<void> {
    this.enabled = enabled;
    this.input.checked = enabled;
    this.label.classList.toggle('auto-allow-toggle--on', enabled);

    if (notify) {
      this.changeCallback?.(enabled);
    }

    if (persist) {
      const settings = await getSettings();
      await saveSettings({ ...settings, autoAllowEnabled: enabled });
    }
  }
}
