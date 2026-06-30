import { useEffect, useState } from 'react';
import { getInstallUIState, onInstallUIStateChange } from '@/lib/pwaInstall';

export function usePwaInstallState() {
  const [state, setState] = useState(getInstallUIState);

  useEffect(() => onInstallUIStateChange(setState), []);

  return state;
}