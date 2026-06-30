import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { isIosDevice, isStandaloneApp } from "@/lib/pwaInstall";

const DISMISS_KEY = "pbc_pwa_install_dismissed_session";

export default function PwaInstallBanner({ onOpenInstall }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandaloneApp() || sessionStorage.getItem(DISMISS_KEY)) return;

    setVisible(true);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      dismiss();
      return;
    }
    onOpenInstall?.();
  };

  if (!visible || isStandaloneApp()) return null;

  const ios = isIosDevice();

  return (
    <div className="bg-gold/10 border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-start sm:items-center gap-3 justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Download size={18} className="text-gold shrink-0 mt-0.5" />
          <div className="text-sm text-white/80">
            <span className="font-semibold text-white">Install our church app</span>
            {" — "}
            {ios
              ? "Add to Home Screen for app-like access and notifications."
              : "Quick access from your home screen, no app store needed."}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={install}
            className="px-3 py-1.5 bg-gold text-navy text-xs font-semibold rounded-lg hover:bg-gold-light"
          >
            {ios ? "How to install" : "Install"}
          </button>
          <button type="button" onClick={dismiss} className="text-white/40 hover:text-white" aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}