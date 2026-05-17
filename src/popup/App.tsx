import { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import Unlock from './screens/Unlock';
import Main from './screens/Main';
import Start from './screens/Start';

type Screen = 'start' | 'unlock' | 'main';

export default function App() {
  const [screen, setScreen] = useState<Screen | null>(null);

  useEffect(() => {
    const checkState = async () => {
      const storage = await browser.storage.local.get(['setupDone']);
      const session = await browser.storage.session.get('masterKey');

      if (!storage.setupDone) {
        setScreen('start');
      } else if (!session.masterKey) {
        setScreen('unlock');
      } else {
        setScreen('main');
      }
    };

    checkState();
  }, []);

  if (!screen) return <p>Loading...</p>;

  return (
    <div className='w-sm rounded-sm px-4 py-9 text-md'>
      {screen === 'start' && <Start onDone={() => setScreen('main')} />}
      {screen === 'unlock' && <Unlock onDone={() => setScreen('main')} />}
      {screen === 'main' && <Main onLock={() => setScreen('unlock')} />}
    </div>
  );
}
