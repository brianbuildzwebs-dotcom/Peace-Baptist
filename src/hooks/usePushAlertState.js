import { useCallback, useEffect, useState } from 'react';
import {
  hasActivePushSubscription,
  isNotificationPromptDismissed,
  onPushAlertStateChange,
} from '@/lib/pushNotifications';

export function usePushAlertState() {
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(isNotificationPromptDismissed);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const active = await hasActivePushSubscription().catch(() => false);
    setSubscribed(active);
    setDismissed(isNotificationPromptDismissed());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    const unsubscribe = onPushAlertStateChange(refresh);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      unsubscribe();
    };
  }, [refresh]);

  return {
    ready,
    subscribed,
    dismissed,
    showFooterEnableLink: ready && !subscribed,
  };
}