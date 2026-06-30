import React, { useEffect, useState } from "react";
import { X, Download, Share, PlusSquare } from "lucide-react";
import { usePwaInstallState } from "@/hooks/usePwaInstallState";
import {
  getDeferredInstallPrompt,
  handleGetAppClick,
  isIosDevice,
  onInstallPromptChange,
} from "@/lib/pwaInstall";
import { useSiteImages } from "@/hooks/useSiteImages";
import { churchInfo } from "@/lib/churchInfo";

export default function InstallAppModal({ open, onClose }) {
  const { getImage } = useSiteImages();
  const splash = getImage("splash") || churchInfo.images.splash;
  const { hideInstallPromo } = usePwaInstallState();
  const [canInstall, setCanInstall] = useState(Boolean(getDeferredInstallPrompt()));
  const ios = isIosDevice();

  useEffect(() => {
    if (!open) return undefined;
    return onInstallPromptChange((prompt) => setCanInstall(Boolean(prompt)));
  }, [open]);

  if (!open) return null;

  const handleInstall = () => {
    const result = handleGetAppClick({ onShowInstructions: () => {} });
    if (result.prompted) {
      result.choice?.then((choice) => {
        if (choice?.outcome === "accepted") onClose();
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-md bg-navy border border-gold/30 rounded-2xl shadow-2xl p-6 text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-2"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <img
            src={splash}
            alt=""
            className="w-14 h-14 rounded-2xl object-cover border border-gold/30 shrink-0"
          />
          <div>
            <h2 className="font-heading text-xl font-bold">Peace Baptist App</h2>
            <p className="text-white/50 text-sm">No app store — install from your browser</p>
          </div>
        </div>

        {hideInstallPromo ? (
          <p className="text-gold text-sm mb-4">You&apos;re already using the installed app. Enjoy Daily Walk, live stream, and prayer request alerts.</p>
        ) : ios ? (
          <ol className="space-y-4 text-sm text-white/80 mb-6">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <span>Tap <Share size={14} className="inline text-gold mx-0.5" /> <strong>Share</strong> at the bottom of Safari.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <span>Scroll and tap <PlusSquare size={14} className="inline text-gold mx-0.5" /> <strong>Add to Home Screen</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0">3</span>
              <span>Tap <strong>Add</strong>, then open Peace Baptist from your home screen.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0">4</span>
              <span>Enable notifications when prompted for Daily Walk and prayer request alerts.</span>
            </li>
          </ol>
        ) : (
          <>
            <p className="text-white/70 text-sm mb-4">
              Install Peace Baptist on your home screen for quick access to worship, Daily Walk, and prayer requests.
            </p>
            {canInstall ? (
              <button
                type="button"
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 py-3 min-h-[48px] bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light active:scale-[0.98]"
              >
                <Download size={18} /> Install now
              </button>
            ) : (
              <p className="text-white/50 text-sm">
                Open the browser menu (⋮) and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.
              </p>
            )}
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-2.5 min-h-[44px] text-white/50 text-sm hover:text-white"
        >
          {hideInstallPromo ? "Close" : "Maybe later"}
        </button>
      </div>
    </div>
  );
}