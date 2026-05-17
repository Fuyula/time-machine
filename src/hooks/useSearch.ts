import type { Snapshot } from '@/types';

const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function useSearch(snapshots: Snapshot[], search: string | undefined) {
  let filteredResult: Snapshot[] = [];
  if (search) {
    const normalizedSearch = normalize(search);
    filteredResult = snapshots.filter((snapshot) =>
      normalize(snapshot.label).includes(normalizedSearch),
    );
  }

  return {
    filteredResult: search ? filteredResult : snapshots,
  };
}
