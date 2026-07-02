import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, X } from "lucide-react";
import { usePwaInstallState } from "@/hooks/usePwaInstallState";
import {
  dismissInstallPromoThisVisit,
  handleGetAppClick,
  isInstallPromoDismissedThisVisit,
  isIosDevice,
  onInstallPromptChange,
  onInstallUIStateChange,
} from "@/lib/pwaInstall";

export default function PwaInstallBanner({ onOpenInstall }) {
  const location = useLocation();
  const onHomePage = location.pathname === "/";
  const { hideInstallPromo, canNativeInstall } = usePwaInstallState();
  const [dismissed, setDismissed] = useState(isInstallPromoDismissedThisVisit);
  const [canInstall, setCanInstall] = useState(canNativeInstall);

  useEffect(() => onInstallPromptChange((prompt) => setCanInstall(Boolean(prompt))), []);
  useEffect(() => onInstallUIStateChange(() => setDismissed(isInstallPromoDismissedThisVisit())), []);

  const dismiss = () => {
    dismissInstallPromoThisVisit();
    setDismissed(true);
  };

  const install = () => {
    const result = handleGetAppClick({
      onShowInstructions: () => onOpenInstall?.(),
    });
    if (result.installed || result.prompted) {
      result.choice?.then((choice) => {
        if (choice?.outcome === "accepted") setDismissed(true);
      });
    }
  };

  if (onHomePage || hideInstallPromo || dismissed) return null;

  const ios = isIosDevice();

  return (
    <div className="bg-gold/10 border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Download size={17} className="text-gold shrink-0" />
          <div className="text-sm text-white/80 truncate">
            <span className="font-semibold text-white">Get the App</span>
            <span className="hidden sm:inline">
              {" — "}
              {ios
                ? "Add to Home Screen for quick access."
                : "Quick access from your home screen."}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={install}
            className="px-3 py-1.5 min-h-[36px] bg-gold text-navy text-xs font-semibold rounded-lg hover:bg-gold-light active:scale-[0.98]"
          >
            {ios ? "How to" : canInstall ? "Install" : "Get App"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="text-white/40 hover:text-white p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Dismiss for now"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}