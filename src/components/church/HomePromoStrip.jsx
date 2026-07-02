import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Download,
  Smartphone,
  X,
} from "lucide-react";
import { usePushAlertState } from "@/hooks/usePushAlertState";
import { useHomeInstallPromo } from "@/hooks/useHomeInstallPromo";
import { usePwaInstallState } from "@/hooks/usePwaInstallState";
import {
  getAndroidPushSetupTips,
  getNotificationPermissionHelp,
  openNotificationPrompt,
  setNotificationPromptDismissed,
} from "@/lib/pushNotifications";
import {
  handleGetAppClick,
  isAndroidDevice,
  isIosDevice,
  openInstallModal,
} from "@/lib/pwaInstall";

function DismissButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-white/40 hover:text-white p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0 rounded-lg hover:bg-white/5"
      aria-label={label}
    >
      <X size={16} />
    </button>
  );
}

function PromoRow({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-gold/30 bg-navy/70 backdrop-blur-md shadow-lg shadow-black/10 ${className}`}
    >
      {children}
    </div>
  );
}

export default function HomePromoStrip() {
  const { canNativeInstall } = usePwaInstallState();
  const { showHomeInstallPromo, dismissInstallPromo } = useHomeInstallPromo();
  const {
    ready,
    showHomeNotifyPromo,
    permission,
    needsInstall,
    status,
  } = usePushAlertState();

  const [notifyExpanded, setNotifyExpanded] = useState(false);

  if (!ready) return null;
  if (!showHomeInstallPromo && !showHomeNotifyPromo) return null;

  const android = isAndroidDevice();
  const ios = isIosDevice();
  const blocked = permission === "denied" || status === "blocked";
  const androidTips = android ? getAndroidPushSetupTips() : [];

  const handleInstall = () => {
    const result = handleGetAppClick({ onShowInstructions: () => openInstallModal() });
    if (result.ios) openInstallModal();
  };

  const handleNotifyAction = () => {
    if (needsInstall) {
      openInstallModal();
      return;
    }
    openNotificationPrompt();
  };

  const notifySummary = needsInstall
    ? "Add to Home Screen first (iPhone)"
    : blocked
      ? "Notifications blocked — tap to fix"
      : "Prayer, Daily Walk & live alerts";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="mb-4 space-y-2 max-w-xl"
    >
      {showHomeInstallPromo && (
        <PromoRow>
          <div className="flex items-center gap-2 px-3 py-2.5">
            <Download size={17} className="text-gold shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-tight">Get the App</p>
              <p className="text-white/55 text-xs truncate">
                {ios
                  ? "Home Screen access — no app store"
                  : "Quick access from your home screen"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleInstall}
              className="shrink-0 px-3 py-1.5 min-h-[36px] bg-gold text-navy text-xs font-bold rounded-lg hover:bg-gold-light transition-colors"
            >
              {ios ? "How to" : canNativeInstall ? "Install" : "Get App"}
            </button>
            <DismissButton onClick={dismissInstallPromo} label="Dismiss app install for now" />
          </div>
        </PromoRow>
      )}

      {showHomeNotifyPromo && (
        <PromoRow>
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Bell size={17} className="text-gold shrink-0" />
              <button
                type="button"
                onClick={() => setNotifyExpanded((open) => !open)}
                className="flex-1 min-w-0 text-left group"
                aria-expanded={notifyExpanded}
              >
                <p className="text-white text-sm font-semibold leading-tight flex items-center gap-1.5">
                  Enable notifications
                  <ChevronDown
                    size={15}
                    className={`text-gold/80 shrink-0 transition-transform ${notifyExpanded ? "rotate-180" : ""}`}
                  />
                </p>
                <p className="text-white/55 text-xs truncate">{notifySummary}</p>
              </button>
              <button
                type="button"
                onClick={handleNotifyAction}
                className="shrink-0 px-3 py-1.5 min-h-[36px] bg-gold/90 text-navy text-xs font-bold rounded-lg hover:bg-gold transition-colors"
              >
                {needsInstall ? (
                  <span className="inline-flex items-center gap-1">
                    <Smartphone size={14} />
                    Install
                  </span>
                ) : blocked ? (
                  "Try again"
                ) : (
                  "Enable"
                )}
              </button>
              <DismissButton
                onClick={() => setNotificationPromptDismissed()}
                label="Dismiss notifications for now"
              />
            </div>

            <AnimatePresence initial={false}>
              {notifyExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-white/10 text-sm text-white/70 leading-relaxed space-y-3">
                    <p>
                      {needsInstall
                        ? "On iPhone, alerts only work from the Home Screen app — not regular Safari. Install the app above, then enable notifications."
                        : blocked
                          ? getNotificationPermissionHelp("denied")
                          : "Allowing notifications in phone settings is not enough. Tap Enable once so this device receives prayer requests, Daily Walk, and live stream alerts."}
                    </p>

                    {!needsInstall && !blocked && (
                      <ul className="space-y-1 text-white/60 text-xs sm:text-sm">
                        {[
                          "Prayer request updates",
                          "Daily Walk each morning",
                          "Live Sunday service alerts",
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-gold mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {android && !needsInstall && (
                      <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                        <p className="text-gold text-[11px] font-semibold uppercase tracking-wide mb-1">
                          Android tip
                        </p>
                        <ol className="text-white/55 text-[11px] sm:text-xs space-y-0.5 list-decimal list-inside">
                          {androidTips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PromoRow>
      )}
    </motion.div>
  );
}