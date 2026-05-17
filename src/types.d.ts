export interface ScrollPosition {
  x: number;
  y: number;
}

export interface Tab {
  url: string;
  title: string;
  favIconUrl: string;
  index: number;
  pinned: boolean;
  scroll: ScrollPosition;
}

export interface Snapshot {
  id: string;
  label: string;
  timestamp: number;
  tabs: Tab[];
  vaultId: string | null;
}

export interface Vault {
  id: string;
  name: string;
  salt: string;
  snapshotIds: string[];
}

export interface Storage {
  snapshots: Record<string, { blob: string; iv: string }>;
  vaults: Record<string, Vault>;
  salt: string;
  setupDone: boolean;
}
