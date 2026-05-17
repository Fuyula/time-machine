import type { ScrollPosition } from '@/types';
import browser from 'webextension-polyfill';

interface Message {
  type: string;
  payload?: ScrollPosition;
}

browser.runtime.onMessage.addListener((message: unknown) => {
  const msg = message as Message;

  if (msg.type === 'GET_SCROLL') {
    return Promise.resolve({
      x: window.scrollX,
      y: window.scrollY,
    });
  }

  if (msg.type === 'SET_SCROLL' && msg.payload) {
    window.scrollTo(msg.payload.x, msg.payload.y);
    return Promise.resolve({ success: true });
  }
});
