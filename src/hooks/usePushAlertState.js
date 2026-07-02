import { useCallback, useEffect, useState } from 'react';
import {
  canPromptForPush,
  getPushAlertStatusLabel,
  getPushPermission,
  hasActivePushSubscription,
  isNotificationPromptDismissed,
  needsPwaForPush,
  onPushAlertStateChange,
} from '@/lib/pushNotifications';

export function usePushAlertState() {
  const [subscribed, setSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(isNotificationPromptDismissed);
  const [permission, setPermission] = useState('default');
  const [needsInstall, setNeedsInstall] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const [active, perm] = await Promise.all([
      hasActivePushSubscription().catch(() => false),
      getPushPermission().catch(() => 'default'),
    ]);
    const installFirst = needsPwaForPush();
    const promptable = canPromptForPush();

    setSubscribed(active);
    setPermission(perm);
    setNeedsInstall(installFirst);
    setCanPrompt(promptable);
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

  const showEnablePromo = ready && canPrompt && !subscribed;
  const status = getPushAlertStatusLabel({ subscribed, permission, needsInstall });

  return {
    ready,
    subscribed,
    dismissed,
    permission,
    needsInstall,
    canPrompt,
    showEnablePromo,
    showFooterEnableLink: showEnablePromo,
    status,
  };
}