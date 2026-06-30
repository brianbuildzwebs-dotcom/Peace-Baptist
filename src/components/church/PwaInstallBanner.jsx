import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import {
  getDeferredInstallPrompt,
  isIosDevice,
  isInstallInProgress,
  isStandaloneApp,
  onInstallPromptChange,
  promptInstall,
} from "@/lib/pwaInstall";

const DISMISS_KEY = "pbc_pwa_install_dismissed_session";

export default function PwaInstallBanner({ onOpenInstall }) {
  const [canInstall, setCanInstall] = useState(Boolean(getDeferredInstallPrompt()));
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandaloneApp() || sessionStorage.getItem(DISMISS_KEY)) return;
    setVisible(true);
    return onInstallPromptChange((prompt) => setCanInstall(Boolean(prompt)));
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (installing || isInstallInProgress()) return;

    if (canInstall) {
      setInstalling(true);
      try {
        const result = await promptInstall();
        if (result?.outcome === "accepted") dismiss();
      } finally {
        setInstalling(false);
      }
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
            disabled={installing}
            className="px-3 py-1.5 bg-gold text-navy text-xs font-semibold rounded-lg hover:bg-gold-light disabled:opacity-60"
          >
            {installing ? "Installing…" : ios ? "How to install" : canInstall ? "Install" : "Get the app"}
          </button>
          <button type="button" onClick={dismiss} className="text-white/40 hover:text-white" aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}