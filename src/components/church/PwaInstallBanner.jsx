import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "pbc_pwa_install_dismissed";

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return;

    if (isIos()) {
      setIosHint(true);
      setVisible(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="bg-gold/10 border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-start sm:items-center gap-3 justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Download size={18} className="text-gold shrink-0 mt-0.5" />
          <div className="text-sm text-white/80">
            {iosHint ? (
              <>
                <span className="font-semibold text-white">Add to Home Screen:</span>{" "}
                tap Share, then &quot;Add to Home Screen&quot; for app-like access and notifications.
              </>
            ) : (
              <>
                <span className="font-semibold text-white">Install our church app</span> — quick access from your home screen, no app store needed.
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!iosHint && deferredPrompt && (
            <button
              type="button"
              onClick={install}
              className="px-3 py-1.5 bg-gold text-navy text-xs font-semibold rounded-lg hover:bg-gold-light"
            >
              Install
            </button>
          )}
          <button type="button" onClick={dismiss} className="text-white/40 hover:text-white" aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}