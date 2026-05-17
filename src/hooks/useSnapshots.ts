import { useCallback, useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import type { Snapshot } from '@/types';

const send = async <T>(type: string, payload?: object): Promise<T> => {
  return browser.runtime.sendMessage({ type, payload }) as Promise<T>;
};

export function useSnapshots() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await send<{ snapshots?: Snapshot[]; error?: string }>(
      'LIST_SNAPSHOTS',
    );
    if (response.snapshots) {
      setSnapshots(response.snapshots);
      setError(null);
    } else {
      setError(response.error ?? 'Failed to load snapshots');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const take = useCallback(
    async (label: string) => {
      const response = await send<{ success?: boolean; error?: string }>(
        'TAKE_SNAPSHOT',
        { label: label || 'Snapshot' },
      );
      if (response.success) await load();
      return response;
    },
    [load],
  );

  const restore = useCallback((id: string) => {
    return send('RESTORE_SNAPSHOT', { id });
  }, []);

  const remove = useCallback(
    async (id: string) => {
      await send('DELETE_SNAPSHOT', { id });
      await load();
    },
    [load],
  );

  return { snapshots, error, take, restore, remove, reload: load };
}
