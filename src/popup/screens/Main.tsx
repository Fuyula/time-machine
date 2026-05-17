import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, LogOut } from 'lucide-react';
import { useMemo, useState } from 'react';
import browser from 'webextension-polyfill';
import { useSnapshots } from '@/hooks/useSnapshots';
import { useSearch } from '@/hooks/useSearch';
import { Searchbar } from '@/components/screens/Searchbar';
import SnapshotItem from '@/components/screens/SnapshotItem';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  let timeout: number;
  return (...args: unknown[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export default function Main({ onLock }: { onLock: () => void }) {
  const [label, setLabel] = useState('');
  const [status, setStatus] = useState('');
  const { snapshots, take, restore, remove, reload } = useSnapshots();
  const [search, setSearch] = useState<string>();

  const { filteredResult } = useSearch(snapshots, search);

  const handleSearch = useMemo(
    () => debounce((search: string) => setSearch(search)),
    [],
  );

  const handleSnapshot = async () => {
    const result = await take(label);
    if (result.success) {
      setLabel('');
      setStatus('Snapshot saved!');
      reload();
    } else {
      setStatus(result.error ?? 'Something went wrong');
    }
  };

  const handleLock = async () => {
    await browser.runtime.sendMessage({ type: 'LOCK' });
    onLock();
  };

  return (
    <div className='flex flex-col gap-4 items-center justify-center'>
      <div className='flex flex-row justify-between w-full'>
        <div className='flex flex-row'>
          {/*
            // TODO: Vaults logic implementation
            <Button size='sm' variant='outline'>
              <Lock /> Manage Vaults
            </Button>
          */}
        </div>
        <Button onClick={handleLock} size='sm' variant='destructive'>
          <LogOut /> Log
        </Button>
      </div>
      <h1 className=' text-lg font-black'>Tab Time Machine</h1>
      <div className='flex flex-row'>
        <Input
          type='text'
          className='rounded-r-none'
          placeholder='Snapshot label (optional)'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Button className='rounded-l-none' onClick={handleSnapshot}>
          <Camera /> Take snapshot
        </Button>
      </div>
      <Searchbar
        handleSearch={handleSearch}
        search={search}
        setSearch={setSearch}
      />
      {status && <p>{status}</p>}
      <ul className='w-full max-h-6/12 gap-2'>
        {filteredResult.map((snapshot) => (
          <li key={snapshot.id} className='w-full mb-2'>
            <SnapshotItem
              snapshot={snapshot}
              restore={() => restore(snapshot.id)}
              remove={() => remove(snapshot.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
