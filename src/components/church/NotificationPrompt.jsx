import React, { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import {
  getPushPermission,
  getSavedTopics,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/pushNotifications";

const DISMISS_KEY = "pbc_notify_prompt_dismissed";

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topics, setTopics] = useState(getSavedTopics());

  useEffect(() => {
    if (!isPushSupported()) return;
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    getPushPermission().then((perm) => {
      setEnabled(perm === "granted");
      if (!dismissed && perm !== "granted") setVisible(true);
    });
  }, []);

  const toggleTopic = (topic) => {
    setTopics((prev) => (
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    ));
  };

  const handleEnable = async () => {
    setLoading(true);
    setError("");
    try {
      await subscribeToPush(topics.length ? topics : ["daily_walk", "prayer", "live"]);
      setEnabled(true);
      setVisible(false);
    } catch (err) {
      setError(err.message || "Could not enable notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await unsubscribeFromPush();
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!isPushSupported()) return null;

  if (enabled) {
    return (
      <div className="fixed bottom-4 right-4 z-40 max-w-xs">
        <div className="bg-navy border border-white/10 rounded-2xl shadow-2xl p-4 text-white">
          <div className="flex items-center gap-2 text-gold text-sm font-semibold mb-2">
            <Bell size={16} /> Notifications on
          </div>
          <p className="text-white/60 text-xs mb-3">You&apos;ll receive Daily Walk, prayer request, and live stream alerts.</p>
          <button
            type="button"
            onClick={handleDisable}
            disabled={loading}
            className="text-xs text-white/50 hover:text-white flex items-center gap-1"
          >
            <BellOff size={14} /> Turn off
          </button>
        </div>
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-40 max-w-md mx-auto md:mx-0">
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
          <button type="button" onClick={dismiss} className="text-white/40 hover:text-white shrink-0" aria-label="Dismiss">
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
              className={`px-3 py-1.5 rounded-full border transition-colors ${
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
          className="w-full py-2.5 bg-gold text-navy font-semibold rounded-xl text-sm hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {loading ? "Enabling…" : "Enable notifications"}
        </button>
        <p className="text-white/40 text-[11px] mt-2 text-center">
          iPhone: Add this site to your Home Screen first for best results.
        </p>
      </div>
    </div>
  );
}