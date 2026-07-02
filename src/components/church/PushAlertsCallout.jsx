import React from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle2, Smartphone } from "lucide-react";
import { usePushAlertState } from "@/hooks/usePushAlertState";
import {
  getAndroidPushSetupTips,
  getNotificationPermissionHelp,
  openNotificationPrompt,
} from "@/lib/pushNotifications";
import { isAndroidDevice, openInstallModal } from "@/lib/pwaInstall";

export default function PushAlertsCallout() {
  const {
    ready,
    subscribed,
    showEnablePromo,
    permission,
    needsInstall,
    status,
  } = usePushAlertState();

  if (!ready || subscribed || !showEnablePromo) return null;

  const android = isAndroidDevice();
  const blocked = permission === "denied" || status === "blocked";
  const androidTips = android ? getAndroidPushSetupTips() : [];

  const handlePrimary = () => {
    if (needsInstall) {
      openInstallModal();
      return;
    }
    openNotificationPrompt();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.05 }}
      className="mb-6"
    >
      <div className="rounded-2xl border border-gold/35 bg-navy/75 backdrop-blur-md p-4 sm:p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
              <Bell size={22} className="text-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-gold text-xs font-bold tracking-[0.18em] uppercase">
                Alerts on this phone
              </p>
              <h2 className="text-white font-heading font-bold text-lg sm:text-xl leading-snug mt-1">
                {needsInstall
                  ? "Add the church app to your Home Screen first"
                  : blocked
                    ? "Notifications are blocked — we can fix that"
                    : "Get prayer requests & Daily Walk on this phone"}
              </h2>
              <p className="text-white/70 text-sm sm:text-base mt-2 leading-relaxed">
                {needsInstall
                  ? "On iPhone, alerts only work from the Home Screen app — not regular Safari. Install first, then turn alerts on."
                  : blocked
                    ? getNotificationPermissionHelp("denied")
                    : "Allowing notifications in phone settings is not enough. Tap the button here once so this device is registered for prayer, Daily Walk, and live stream alerts."}
              </p>

              {!needsInstall && !blocked && (
                <ul className="mt-3 space-y-1.5 text-white/55 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-gold mt-0.5 shrink-0" />
                    <span>Prayer request updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-gold mt-0.5 shrink-0" />
                    <span>Daily Walk each morning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-gold mt-0.5 shrink-0" />
                    <span>Live Sunday service alerts</span>
                  </li>
                </ul>
              )}

              {android && !needsInstall && (
                <div className="mt-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                  <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-1.5">
                    Android tip
                  </p>
                  <ol className="text-white/60 text-xs sm:text-sm space-y-1 list-decimal list-inside leading-relaxed">
                    {androidTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrimary}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[48px] bg-gold text-navy font-bold rounded-xl text-sm sm:text-base hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
          >
            {needsInstall ? (
              <>
                <Smartphone size={18} />
                How to add to Home Screen
              </>
            ) : blocked ? (
              <>
                <Bell size={18} />
                I allowed them — try again
              </>
            ) : (
              <>
                <Bell size={18} />
                Turn on alerts
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}