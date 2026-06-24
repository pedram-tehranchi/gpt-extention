import { sendMessage } from '@/services/messaging';

const statusEl = document.getElementById('status');
const openOptionsBtn = document.getElementById('open-options');

async function init(): Promise<void> {
  try {
    const response = await sendMessage({ type: 'PING' });

    if (statusEl) {
      statusEl.textContent = response.ok ? 'Background worker connected' : 'Connection failed';
      statusEl.classList.add(response.ok ? 'status--ok' : 'status--error');
    }
  } catch {
    if (statusEl) {
      statusEl.textContent = 'Could not reach background worker';
      statusEl.classList.add('status--error');
    }
  }
}

openOptionsBtn?.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

void init();
