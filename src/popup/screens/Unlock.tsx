import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import browser from 'webextension-polyfill';

export default function Unlock({ onDone }: { onDone: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    if (!pin) {
      setError('Please enter your PIN');
      return;
    }

    const response = (await browser.runtime.sendMessage({
      type: 'UNLOCK',
      payload: { pin },
    })) as { success?: boolean; error?: string };

    if (response.success) {
      onDone();
    } else {
      setError(response.error ?? 'Something went wrong');
    }
  };

  return (
    <div className='flex flex-col gap-4 items-center justify-center'>
      <h1 className=' text-lg font-black'>Tab Time Machine</h1>
      <label>Enter your PIN to unlock</label>
      <div className='flex flex-row'>
        <div className='flex flex-col'>
          <Input
            type='password'
            className='rounded-r-none'
            placeholder='Enter PIN'
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          {error && <p>{error}</p>}
        </div>
        <Button className='rounded-l-none' onClick={handleUnlock}>
          Unlock
        </Button>
      </div>
    </div>
  );
}
