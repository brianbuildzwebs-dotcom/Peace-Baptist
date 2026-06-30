import { useEffect } from 'react';

/** Allow landscape rotation on watch/player pages (PWA manifest also uses orientation: any). */
export function useUnlockOrientation() {
  useEffect(() => {
    const unlock = async () => {
      try {
        if (screen.orientation?.unlock) {
          await screen.orientation.unlock();
        }
      } catch {
        /* ignore — some browsers require fullscreen first */
      }
    };

    unlock();
  }, []);
}