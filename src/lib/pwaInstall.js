const INSTALLED_KEY = 'pbc_pwa_installed';
let deferredInstallPrompt = null;
const installListeners = new Set();
const uiStateListeners = new Set();
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

function markInstalled() {
  notifyUIStateListeners();
}

function notifyUIStateListeners() {
  const state = getInstallUIState();
  uiStateListeners.forEach((listener) => {
    try {
      listener(state);
    } catch {
      /* ignore listener errors */
    }
  });
}

function clearStaleInstalledFlag() {
  if (typeof window === 'undefined' || isStandaloneApp()) return false;
  try {
    if (localStorage.getItem(INSTALLED_KEY) === '1') {
      localStorage.removeItem(INSTALLED_KEY);
      return true;
    }
  } catch {
    /* ignore storage errors */
  }
  return false;
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    notifyInstallListeners();
    notifyUIStateListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    markInstalled();
    notifyInstallListeners();
  });

  const displayModes = ['standalone', 'fullscreen', 'minimal-ui'];
  displayModes.forEach((mode) => {
    const mq = window.matchMedia(`(display-mode: ${mode})`);
    const onChange = () => notifyUIStateListeners();
    mq.addEventListener?.('change', onChange);
    mq.addListener?.(onChange);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      clearStaleInstalledFlag();
      notifyUIStateListeners();
    }
  });

  if (clearStaleInstalledFlag()) {
    queueMicrotask(() => notifyUIStateListeners());
  }
}

export function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandaloneApp() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || window.matchMedia('(display-mode: minimal-ui)').matches
    || window.navigator.standalone === true;
}

export function isAppInstalled() {
  return isStandaloneApp();
}

export function getInstallUIState() {
  const hadStaleFlag = clearStaleInstalledFlag();
  const installed = isAppInstalled();
  const state = {
    installed,
    standalone: installed,
    hideInstallPromo: installed,
    canNativeInstall: Boolean(deferredInstallPrompt) && !installed,
  };
  if (hadStaleFlag) {
    queueMicrotask(() => notifyUIStateListeners());
  }
  return state;
}

export function onInstallUIStateChange(listener) {
  uiStateListeners.add(listener);
  listener(getInstallUIState());
  return () => uiStateListeners.delete(listener);
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
        markInstalled();
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
  if (isAppInstalled()) return { handled: true, installed: true };

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