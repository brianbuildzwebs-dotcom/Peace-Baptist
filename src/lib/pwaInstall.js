let deferredInstallPrompt = null;
const installListeners = new Set();
let installInProgress = false;

function notifyInstallListeners() {
  installListeners.forEach((listener) => {
    try {
      listener(deferredInstallPrompt);
    } catch {
      /* ignore listener errors */
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    notifyInstallListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    notifyInstallListeners();
  });
}

export function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

export function canUseNativeInstallPrompt() {
  return typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window;
}

export function getDeferredInstallPrompt() {
  return deferredInstallPrompt;
}

export function onInstallPromptChange(listener) {
  installListeners.add(listener);
  listener(deferredInstallPrompt);
  return () => installListeners.delete(listener);
}

export function isInstallInProgress() {
  return installInProgress;
}

export async function promptInstall() {
  if (installInProgress) return { outcome: 'dismissed', reason: 'busy' };
  if (!deferredInstallPrompt) return { outcome: 'unavailable' };

  installInProgress = true;
  try {
    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      deferredInstallPrompt = null;
      notifyInstallListeners();
    }
    return choice;
  } finally {
    installInProgress = false;
  }
}