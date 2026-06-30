import React, { useEffect, useRef, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import {
  fetchPushStatus,
  getPushPermission,
  getSavedTopics,
  hasActivePushSubscription,
  isPushSupported,
  subscribeToPush,
} from "@/lib/pushNotifications";

const DISMISS_KEY = "pbc_notify_prompt_dismissed";
const ENABLED_KEY = "pbc_notify_enabled";

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false);
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

  useEffect(() => {
    if (!isPushSupported()) return undefined;

    let cancelled = false;

    const loadState = async () => {
      const [subscribed, status] = await Promise.all([
        hasActivePushSubscription(),
        fetchPushStatus().catch(() => ({ configured: false })),
      ]);

      if (cancelled) return;

      setServerReady(status.configured);

      if (subscribed || localStorage.getItem(ENABLED_KEY)) {
        setVisible(false);
        return;
      }

      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      const perm = await getPushPermission();
      if (!dismissed && perm !== "denied") setVisible(true);
    };

    loadState();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTopic = (topic) => {
    setTopics((prev) => (
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    ));
  };

  const handleEnable = () => {
    if (loading || enablingRef.current) return;
    enablingRef.current = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
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

        await subscribeToPush(topics.length ? topics : ["daily_walk", "prayer", "live"]);
        localStorage.setItem(ENABLED_KEY, "1");
        sessionStorage.setItem(DISMISS_KEY, "1");
        setVisible(false);
        setToast("Notifications enabled");
      } catch (err) {
        setError(err.message || "Could not enable notifications.");
      } finally {
        setLoading(false);
        enablingRef.current = false;
      }
    })();
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!isPushSupported()) return null;

  return (
    <>
      {toast && (
        <div
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 bg-navy border border-gold/30 rounded-full shadow-xl text-white text-sm"
          role="status"
        >
          <Check size={16} className="text-gold shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {visible && (
        <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-4 right-4 md:left-auto md:right-4 z-40 max-w-md mx-auto md:mx-0 pointer-events-auto">
          <div className="bg-navy border border-gold/30 rounded-2xl shadow-2xl p-5 text-white">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 text-gold font-semibold text-sm">
                  <Bell size={16} /> Stay connected
                </div>
                <p className="text-white/70 text-sm mt-1">
                  Get the Daily Walk each morning, prayer request updates, and live service alerts.
                </p>
              </div>
              <button type="button" onClick={dismiss} className="text-white/40 hover:text-white shrink-0 p-1" aria-label="Dismiss">
                <X size={18} />
              </button>
            </div>

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

            {error && <p className="text-red-300 text-xs mb-3">{error}</p>}

            <button
              type="button"
              onClick={handleEnable}
              disabled={loading || topics.length === 0}
              className="w-full py-3 min-h-[44px] bg-gold text-navy font-semibold rounded-xl text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? "Setting up…" : "Enable notifications"}
            </button>
            <p className="text-white/40 text-[11px] mt-2 text-center">
              iPhone: open from your Home Screen icon first for best results.
            </p>
          </div>
        </div>
      )}
    </>
  );
}