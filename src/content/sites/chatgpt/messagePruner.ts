import { showPruneToast } from '@/components/PruneToast';
import {
  contentLog,
  getSettings,
  offStorageChanged,
  onStorageChanged,
} from '@/content/chromeApi';
import { queryConversationTurns } from '@/content/sites/chatgpt/selectors';
import { selectTurnsToPrune } from '@/utils/pruneTurns';

const PRUNE_THROTTLE_MS = 300;

export function initMessagePruner(): () => void {
  let enabled = true;
  let keepLatestTurns = 10;
  let throttleTimer: number | undefined;

  const prune = (): void => {
    if (!enabled) {
      return;
    }

    const turns = queryConversationTurns();
    const toRemove = selectTurnsToPrune(turns, keepLatestTurns);

    for (const turn of toRemove) {
      turn.remove();
    }

    if (toRemove.length > 0) {
      contentLog.info(`Pruned ${toRemove.length} old conversation turn(s)`);
      showPruneToast(`Keeping last ${keepLatestTurns} turns`);
    }
  };

  const schedulePrune = (): void => {
    if (throttleTimer !== undefined) {
      return;
    }

    throttleTimer = window.setTimeout(() => {
      throttleTimer = undefined;
      prune();
    }, PRUNE_THROTTLE_MS);
  };

  const loadSettings = async (): Promise<void> => {
    const settings = await getSettings();
    enabled = settings.pruneOldTurnsEnabled;
    keepLatestTurns = settings.keepLatestTurns;
    schedulePrune();
  };

  const observer = new MutationObserver(schedulePrune);
  observer.observe(document.body, { childList: true, subtree: true });

  const onStorageChange = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string,
  ): void => {
    if (area === 'local' && changes.settings) {
      void loadSettings();
    }
  };

  onStorageChanged(onStorageChange);
  void loadSettings();
  contentLog.info('Message pruner initialized');

  return () => {
    observer.disconnect();
    offStorageChanged(onStorageChange);
    if (throttleTimer !== undefined) {
      window.clearTimeout(throttleTimer);
      throttleTimer = undefined;
    }
  };
}
