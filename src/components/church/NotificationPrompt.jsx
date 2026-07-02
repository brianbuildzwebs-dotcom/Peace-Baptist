import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Check, Smartphone, X } from "lucide-react";
import { isAndroidDevice } from "@/lib/pwaInstall";
import {
  canPromptForPush,
  clearStalePushEnabledFlag,
  fetchPushStatus,
  getAndroidPushSetupTips,
  getNotificationPermissionHelp,
  getPushPermission,
  getSavedTopics,
  hasActivePushSubscription,
  needsPwaForPush,
  refreshPushSubscriptionIfNeeded,
  requestNotificationPermissionFromGesture,
  SHOW_NOTIFICATION_PROMPT_EVENT,
  isNotificationPromptDismissed,
  setNotificationPromptDismissed,
  clearNotificationPromptDismissed,
  subscribeToPush,
} from "@/lib/pushNotifications";

export default function NotificationPrompt({ onOpenInstall }) {
  const location = useLocation();
  const onHomePage = location.pathname === "/";
  const [autoVisible, setAutoVisible] = useState(false);
  const [forcedVisible, setForcedVisible] = useState(false);
  const [installFirst, setInstallFirst] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serverReady, setServerReady] = useState(null);
  const [topics, setTopics] = useState(getSavedTopics());
  const enablingRef = useRef(false);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const preparePromptState = useCallback(async ({ allowOnHome = false } = {}) => {
    if (!canPromptForPush()) {
      return { shouldShow: false, subscribed: false };
    }

    const iosNeedsInstall = needsPwaForPush();
    setInstallFirst(iosNeedsInstall);

    const [subscribed, status] = await Promise.all([
      hasActivePushSubscription(),
      fetchPushStatus().catch(() => ({ configured: false })),
    ]);

    setServerReady(status.configured);

    if (subscribed) {
      await refreshPushSubscriptionIfNeeded();
      setForcedVisible(false);
      return { shouldShow: false, subscribed: true };
    }

    clearStalePushEnabledFlag();

    if (!allowOnHome && onHomePage) {
      return { shouldShow: false, subscribed: false };
    }

    if (!allowOnHome && isNotificationPromptDismissed()) {
      return { shouldShow: false, subscribed: false };
    }

    if (iosNeedsInstall) {
      setPermissionBlocked(false);
      return { shouldShow: true, subscribed: false };
    }

    const perm = await getPushPermission();
    setPermissionBlocked(perm === "denied");
    return { shouldShow: true, subscribed: false };
  }, [onHomePage]);

  const evaluatePrompt = useCallback(async () => {
    const result = await preparePromptState();
    setAutoVisible(result.shouldShow);
    if (result.subscribed) setForcedVisible(false);
  }, [preparePromptState]);

  useEffect(() => {
    evaluatePrompt();

    const onVisible = () => {
      if (document.visibilityState === "visible") evaluatePrompt();
    };

    const onShowPrompt = async () => {
      clearNotificationPromptDismissed();
      const result = await preparePromptState({ allowOnHome: true });
      if (result.shouldShow) setForcedVisible(true);
      else setForcedVisible(false);
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(SHOW_NOTIFICATION_PROMPT_EVENT, onShowPrompt);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(SHOW_NOTIFICATION_PROMPT_EVENT, onShowPrompt);
    };
  }, [evaluatePrompt, preparePromptState]);

  const visible = forcedVisible || autoVisible;

  const toggleTopic = (topic) => {
    setTopics((prev) => (
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    ));
  };

  const handleEnable = () => {
    if (loading || enablingRef.current) return;

    if (needsPwaForPush()) {
      onOpenInstall?.();
      setError("Add Peace Baptist to your Home Screen, then open the app from that icon and tap Enable notifications again.");
      return;
    }

    if (Notification.permission === "denied") {
      setPermissionBlocked(true);
      setError(getNotificationPermissionHelp("denied"));
      return;
    }

    setPermissionBlocked(false);

    enablingRef.current = true;
    setLoading(true);
    setError("");

    const permissionPromise = requestNotificationPermissionFromGesture();

    permissionPromise.then(async (permission) => {
      try {
        if (permission !== "granted") {
          if (permission === "denied") setPermissionBlocked(true);
          throw new Error(getNotificationPermissionHelp(permission));
        }

        if (serverReady === false) {
          const status = await fetchPushStatus();
          if (!status.configured) {
            throw new Error(
              status.error
                || "Push is not configured on the server yet. An admin needs to set VAPID keys in Vercel."
            );
          }
          setServerReady(true);
        }

        await subscribeToPush(
          topics.length ? topics : ["daily_walk", "prayer", "live"],
          { permission }
        );
        setNotificationPromptDismissed();
        setForcedVisible(false);
        setAutoVisible(false);
        setToast(
          needsPwaForPush() || /iphone|ipad|ipod|android/i.test(navigator.userAgent)
            ? "Alerts enabled on this device"
            : "Notifications enabled"
        );
      } catch (err) {
        setError(err.message || "Could not enable notifications.");
      } finally {
        setLoading(false);
        enablingRef.current = false;
      }
    });
  };

  const dismiss = () => {
    setNotificationPromptDismissed();
    setForcedVisible(false);
    setAutoVisible(false);
  };

  if (!canPromptForPush()) return null;

  return (
    <>
      {toast && (
        <div
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-[55] flex items-center gap-2 px-4 py-2.5 bg-navy border border-gold/30 rounded-full shadow-xl text-white text-sm"
          role="status"
        >
          <Check size={16} className="text-gold shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {visible && (
        <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 right-4 md:left-auto md:right-4 z-[55] max-w-md mx-auto md:mx-0 pointer-events-auto">
          <div className="bg-navy border border-gold/30 rounded-2xl shadow-2xl p-5 text-white">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 text-gold font-semibold text-sm">
                  <Bell size={16} /> Stay connected
                </div>
                <p className="text-white/70 text-sm mt-1">
                  {installFirst
                    ? "On iPhone, add Peace Baptist to your Home Screen first — then you can turn on Daily Walk, prayer, and live stream alerts."
                    : permissionBlocked
                      ? "Notifications are blocked in your browser. Allow them for peacebaptist.net, then try again."
                      : "Get the Daily Walk each morning, prayer request updates, and live service alerts."}
                </p>
              </div>
              <button type="button" onClick={dismiss} className="text-white/40 hover:text-white shrink-0 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Dismiss">
                <X size={18} />
              </button>
            </div>

            {!installFirst && !permissionBlocked && (
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                {[
                  { id: "daily_walk", label: "Daily Walk" },
                  { id: "prayer", label: "Prayer Requests" },
                  { id: "live", label: "Live stream" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleTopic(item.id)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${
                      topics.includes(item.id)
                        ? "bg-gold/20 border-gold text-gold"
                        : "border-white/20 text-white/50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="text-red-300 text-xs mb-3 leading-relaxed">{error}</p>}

            {permissionBlocked && !installFirst && (
              <p className="text-white/50 text-xs mb-3 leading-relaxed">
                {getNotificationPermissionHelp("denied")}
              </p>
            )}

            {!installFirst && !permissionBlocked && isAndroidDevice() && (
              <div className="mb-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-left">
                <p className="text-gold text-[11px] font-semibold uppercase tracking-wide mb-1">
                  Android tip
                </p>
                <ol className="text-white/50 text-[11px] space-y-0.5 list-decimal list-inside leading-relaxed">
                  {getAndroidPushSetupTips().map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ol>
              </div>
            )}

            {installFirst ? (
              <button
                type="button"
                onClick={() => onOpenInstall?.()}
                className="w-full py-3 min-h-[44px] bg-gold text-navy font-semibold rounded-xl text-sm hover:bg-gold-light transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone size={16} /> How to add to Home Screen
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnable}
                disabled={loading || (!permissionBlocked && topics.length === 0)}
                className="w-full py-3 min-h-[44px] bg-gold text-navy font-semibold rounded-xl text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {loading
                  ? "Setting up…"
                  : permissionBlocked
                    ? "I've allowed notifications — try again"
                    : "Enable notifications"}
              </button>
            )}

            <p className="text-white/40 text-[11px] mt-2 text-center">
              {installFirst
                ? "After installing, open the church app from your Home Screen — the enable button will appear there."
                : "Admin test sends go to subscribed phones only — your computer does not need notifications to send them."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}