import { useCallback, useEffect, useState } from 'react';
import {
  dismissInstallPromoThisVisit,
  isInstallPromoDismissedThisVisit,
  onInstallUIStateChange,
} from '@/lib/pwaInstall';
import { usePwaInstallState } from '@/hooks/usePwaInstallState';

export function useHomeInstallPromo() {
  const { hideInstallPromo } = usePwaInstallState();
  const [dismissed, setDismissed] = useState(isInstallPromoDismissedThisVisit);

  const refresh = useCallback(() => {
    setDismissed(isInstallPromoDismissedThisVisit());
  }, []);

  useEffect(() => onInstallUIStateChange(refresh), [refresh]);

  const dismiss = useCallback(() => {
    dismissInstallPromoThisVisit();
    setDismissed(true);
  }, []);

  return {
    showHomeInstallPromo: !hideInstallPromo && !dismissed,
    dismissInstallPromo: dismiss,
  };
}