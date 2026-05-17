import { decrypt, deriveKey, encrypt, generateSalt } from '@/crypto';
import type { ScrollPosition, Snapshot } from '@/types';
import browser from 'webextension-polyfill';

export const getScrollForTab = async (
  tabId: number,
): Promise<ScrollPosition> => {
  const defaultPosition = { x: 0, y: 0 };
  try {
    const response: ScrollPosition = await browser.tabs.sendMessage(tabId, {
      type: 'GET_SCROLL',
    });
    return response ?? defaultPosition;
  } catch {
    return defaultPosition;
  }
};

export const getStorage = async (): Promise<Storage> => {
  const data = await browser.storage.local.get(null);
  return data as unknown as Storage;
};

export const getKey = async (): Promise<CryptoKey | null> => {
  const session = await browser.storage.session.get('masterKey');
  if (!session.masterKey) return null;

  const { pin, salt } = session.masterKey as { pin: string; salt: string };
  const saltBytes = Uint8Array.from(atob(salt), (c) =>
    c.charCodeAt(0),
  ) as Uint8Array<ArrayBuffer>;
  return deriveKey(pin, saltBytes);
};

const isOpenable = (url: string) => /^(https?|file|fpt):/.test(url);

export const takeSnapshot = async (msg: {
  type: string;
  payload?: unknown;
}) => {
  const tabs = await browser.tabs.query({ currentWindow: true });
  const storage = await getStorage();
  const key = await getKey();

  if (!key) return { error: 'PIN not set' };
  const isFirefox = navigator.userAgent.includes('Firefox');

  const filteredTabs = isFirefox
    ? tabs.filter((t) => t.url && isOpenable(t.url))
    : tabs;

  const snapshotTabs = await Promise.all(
    filteredTabs.map(async (tab) => ({
      url: tab.url ?? '',
      title: tab.title ?? '',
      favIconUrl: tab.favIconUrl ?? '',
      index: tab.index,
      pinned: tab.pinned ?? false,
      scroll: tab.id ? await getScrollForTab(tab.id) : { x: 0, y: 0 },
    })),
  );

  const snapshot: Snapshot = {
    id: crypto.randomUUID(),
    label: (msg.payload as { label?: string })?.label ?? 'Snapshot',
    timestamp: Date.now(),
    tabs: snapshotTabs,
    vaultId: null,
  };

  const encrypted = await encrypt(snapshot, key);

  await browser.storage.local.set({
    snapshots: {
      ...storage.snapshots,
      [snapshot.id]: encrypted,
    },
  });

  return { success: true, id: snapshot.id };
};

export const setupPin = async (msg: { type: string; payload?: unknown }) => {
  const { pin } = msg.payload as { pin: string };
  const storage = await getStorage();

  const salt = storage.salt
    ? (Uint8Array.from(atob(storage.salt), (c) =>
        c.charCodeAt(0),
      ) as Uint8Array<ArrayBuffer>)
    : generateSalt();

  const saltBase64 = btoa(String.fromCharCode(...salt));

  await browser.storage.local.set({
    salt: saltBase64,
    setupDone: true,
  });

  await browser.storage.session.set({
    masterKey: { pin, salt: saltBase64 },
  });

  return { success: true };
};

export const unlock = async (msg: { type: string; payload?: unknown }) => {
  const { pin } = msg.payload as { pin: string };
  const storage = await getStorage();

  if (!storage.salt) return { error: 'Extension not set up' };

  await browser.storage.session.set({
    masterKey: { pin, salt: storage.salt },
  });

  return { success: true };
};

export const lock = async () => {
  await browser.storage.session.remove('masterKey');
  return { success: true };
};

export const listSnapshots = async () => {
  const storage = await getStorage();
  const key = await getKey();

  if (!key) return { error: 'Not unlocked' };
  if (!storage.snapshots) return { snapshots: [] };

  const snapshots = await Promise.all(
    Object.entries(storage.snapshots).map(async ([, encrypted]) => {
      try {
        const decrypted = await decrypt(
          (encrypted as { blob: string }).blob,
          (encrypted as { iv: string }).iv,
          key,
        );
        return decrypted;
      } catch {
        return null;
      }
    }),
  );

  return {
    snapshots: snapshots
      .filter((s): s is Snapshot => s !== null)
      .sort((a, b) => b.timestamp - a.timestamp),
  };
};

export const restoreSnapshots = async (msg: {
  type: string;
  payload?: unknown;
}) => {
  const { id } = msg.payload as { id: string };
  const storage = await getStorage();
  const key = await getKey();

  if (!key) return { error: 'Not unlocked' };
  if (!storage.snapshots?.[id]) return { error: 'Snapshot not found' };

  const encrypted = storage.snapshots[id];
  const snapshot = (await decrypt(
    encrypted.blob,
    encrypted.iv,
    key,
  )) as Snapshot;

  const window = await browser.windows.create({
    url: snapshot.tabs[0]?.url,
  });

  const tabIds: number[] = [];
  if (window.tabs?.[0]?.id) tabIds.push(window.tabs[0].id);

  for (const tab of snapshot.tabs.slice(1)) {
    const created = await browser.tabs.create({
      windowId: window.id,
      url: tab.url,
      pinned: tab.pinned,
    });
    if (created.id) tabIds.push(created.id);
  }

  tabIds.forEach((tabId, i) => {
    const targetScroll = snapshot.tabs[i].scroll;

    const listener = (
      updatedTabId: number,
      changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
    ) => {
      if (updatedTabId !== tabId || changeInfo.status !== 'complete') return;

      browser.tabs
        .sendMessage(tabId, {
          type: 'SET_SCROLL',
          payload: targetScroll,
        })
        .catch(() => {});

      browser.tabs.onUpdated.removeListener(listener);
    };

    browser.tabs.onUpdated.addListener(listener);
  });

  return { success: true };
};
export const deleteSnapshot = async (msg: {
  type: string;
  payload?: unknown;
}) => {
  const { id } = msg.payload as { id: string };
  const storage = await getStorage();

  if (!storage.snapshots?.[id]) return { error: 'Snapshot not found' };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [id]: _, ...remaining } = storage.snapshots;

  await browser.storage.local.set({ snapshots: remaining });

  return { success: true };
};
