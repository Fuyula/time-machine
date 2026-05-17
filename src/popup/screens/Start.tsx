import { useState } from 'react';
import browser from 'webextension-polyfill';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Start({ onDone }: { onDone: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSetup = async () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 characters');
      return;
    }

    const response = (await browser.runtime.sendMessage({
      type: 'SETUP_PIN',
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
      <h1 className=' text-lg font-black'>Welcome to Tab Time Machine</h1>
      <label>Set a PIN to encrypt your snapshots</label>
      <div className='flex flex-row'>
        <Input
          type='password'
          className='rounded-r-none'
          placeholder='Enter PIN'
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        {error && <p>{error}</p>}
        <Button className='rounded-l-none' onClick={handleSetup}>
          Set PIN
        </Button>
      </div>
    </div>
  );
}
