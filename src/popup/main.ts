import { sendMessage } from '@/services/messaging';
import { getSettings, saveSettings } from '@/services/settings';
import { getTemplates } from '@/services/templates';
import { clampKeepLatestTurns } from '@/types/settings';

const statusEl = document.getElementById('status') as HTMLParagraphElement;
const autoAllowInput = document.getElementById('auto-allow') as HTMLInputElement;
const pruneEnabledInput = document.getElementById('prune-enabled') as HTMLInputElement;
const keepLatestInput = document.getElementById('keep-latest') as HTMLInputElement;
const applyKeepBtn = document.getElementById('apply-keep') as HTMLButtonElement;
const templateCountEl = document.getElementById('template-count') as HTMLParagraphElement;
const openOptionsBtn = document.getElementById('open-options') as HTMLButtonElement;

async function checkConnection(): Promise<void> {
  try {
    const response = await sendMessage({ type: 'PING' });
    statusEl.textContent = response.ok ? 'Connected' : 'Connection failed';
    statusEl.classList.toggle('status--ok', Boolean(response.ok));
    statusEl.classList.toggle('status--error', !response.ok);
  } catch {
    statusEl.textContent = 'Could not reach background worker';
    statusEl.classList.add('status--error');
  }
}

async function loadPopupState(): Promise<void> {
  const [settings, templates] = await Promise.all([getSettings(), getTemplates()]);
  autoAllowInput.checked = settings.autoAllowEnabled;
  pruneEnabledInput.checked = settings.pruneOldTurnsEnabled;
  keepLatestInput.value = String(settings.keepLatestTurns);
  templateCountEl.textContent =
    templates.length === 1 ? '1 template' : `${templates.length} templates`;
}

async function persistPartial(
  patch: Partial<{
    autoAllowEnabled: boolean;
    pruneOldTurnsEnabled: boolean;
    keepLatestTurns: number;
  }>,
): Promise<void> {
  const current = await getSettings();
  await saveSettings({ ...current, ...patch });
}

autoAllowInput.addEventListener('change', () => {
  void persistPartial({ autoAllowEnabled: autoAllowInput.checked });
});

pruneEnabledInput.addEventListener('change', () => {
  void persistPartial({ pruneOldTurnsEnabled: pruneEnabledInput.checked });
});

applyKeepBtn.addEventListener('click', () => {
  void (async () => {
    const keepLatestTurns = clampKeepLatestTurns(Number(keepLatestInput.value));
    keepLatestInput.value = String(keepLatestTurns);
    await persistPartial({ keepLatestTurns });
  })();
});

openOptionsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

void checkConnection();
void loadPopupState();
