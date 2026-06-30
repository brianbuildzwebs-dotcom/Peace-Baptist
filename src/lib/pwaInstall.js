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

/**
 * Must call prompt() synchronously inside the click handler — any await/setState
 * before prompt() causes Chrome to ignore the install gesture.
 */
export function triggerInstallPrompt() {
  if (installInProgress || !deferredInstallPrompt) {
    return { started: false, reason: installInProgress ? 'busy' : 'unavailable' };
  }

  const promptEvent = deferredInstallPrompt;
  installInProgress = true;

  try {
    promptEvent.prompt();
  } catch {
    installInProgress = false;
    return { started: false, reason: 'error' };
  }

  const choice = promptEvent.userChoice
    .then((result) => {
      if (result.outcome === 'accepted') {
        deferredInstallPrompt = null;
        notifyInstallListeners();
      }
      return result;
    })
    .finally(() => {
      installInProgress = false;
    });

  return { started: true, choice };
}

/** @deprecated Use triggerInstallPrompt inside click handlers */
export async function promptInstall() {
  const result = triggerInstallPrompt();
  if (!result.started) return { outcome: 'unavailable', reason: result.reason };
  return result.choice;
}

export function handleGetAppClick({ onShowInstructions } = {}) {
  if (isStandaloneApp()) return { handled: true, installed: true };

  if (isIosDevice()) {
    onShowInstructions?.();
    return { handled: true, ios: true };
  }

  const attempt = triggerInstallPrompt();
  if (attempt.started) {
    attempt.choice.then((result) => {
      if (result.outcome === 'dismissed') onShowInstructions?.();
    });
    return { handled: true, prompted: true, choice: attempt.choice };
  }

  onShowInstructions?.();
  return { handled: true, prompted: false };
}