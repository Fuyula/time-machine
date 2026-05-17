import browser from 'webextension-polyfill';
import {
  deleteSnapshot,
  listSnapshots,
  lock,
  restoreSnapshots,
  setupPin,
  takeSnapshot,
  unlock,
} from './utils';

// TODO: Vaults logic implementation
browser.runtime.onMessage.addListener((message: unknown) => {
  const msg = message as { type: string; payload?: unknown };

  switch (msg.type) {
    case 'TAKE_SNAPSHOT':
      return (async () => takeSnapshot(msg))();
    case 'SETUP_PIN':
      return (async () => setupPin(msg))();
    case 'UNLOCK':
      return (async () => unlock(msg))();
    case 'LOCK':
      return (async () => lock())();
    case 'LIST_SNAPSHOTS':
      return (async () => listSnapshots())();
    case 'RESTORE_SNAPSHOT':
      return (async () => restoreSnapshots(msg))();
    case 'DELETE_SNAPSHOT':
      return (async () => deleteSnapshot(msg))();
    default:
      break;
  }
});
