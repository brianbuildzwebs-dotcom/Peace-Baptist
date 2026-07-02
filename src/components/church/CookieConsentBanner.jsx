import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import {
  acceptAllConsent,
  applyPrivacyControlDefaults,
  essentialOnlyConsent,
  getConsent,
  hasUserChosen,
  OPEN_COOKIE_SETTINGS_EVENT,
  saveConsent,
} from "@/lib/cookieConsent";

const CATEGORIES = [
  {
    id: "essential",
    label: "Essential",
    description: "Required for sign-in, security, and remembering your cookie choices.",
    locked: true,
  },
  {
    id: "functional",
    label: "Functional",
    description: "Saves preferences such as app install state, notification settings, and embedded maps.",
    locked: false,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Helps us understand how visitors use the site. Not enabled today, but honored when added.",
    locked: false,
  },
];

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(() => !hasUserChosen());
  const [manageOpen, setManageOpen] = useState(false);
  const [prefs, setPrefs] = useState(getConsent);

  useEffect(() => {
    applyPrivacyControlDefaults();
    setVisible(!hasUserChosen());
  }, []);

  useEffect(() => {
    const openSettings = () => {
      setPrefs(getConsent());
      setManageOpen(true);
      setVisible(false);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  const closeAll = () => {
    setManageOpen(false);
    setVisible(false);
  };

  const handleAcceptAll = () => {
    acceptAllConsent();
    closeAll();
  };

  const handleEssentialOnly = () => {
    essentialOnlyConsent();
    closeAll();
  };

  const handleSavePreferences = () => {
    saveConsent(prefs);
    closeAll();
  };

  if (!visible && !manageOpen) return null;

  return (
    <>
      {visible && (
        <div className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto rounded-2xl border border-white/10 bg-navy shadow-2xl p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                <Cookie size={20} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading text-lg font-bold text-white mb-2">Cookie & privacy choices</h2>
                <p className="text-white/65 text-sm leading-relaxed">
                  We use essential cookies and local storage so the site works. Optional tools — like embedded maps
                  and future analytics — load only if you allow them. See our{" "}
                  <Link to="/privacy" className="text-gold hover:text-gold-light underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-5 py-2.5 bg-gold text-navy text-sm font-semibold rounded-full hover:bg-gold-light transition-colors"
                  >
                    Accept all
                  </button>
                  <button
                    type="button"
                    onClick={handleEssentialOnly}
                    className="px-5 py-2.5 border border-white/20 text-white text-sm font-medium rounded-full hover:border-gold hover:text-gold transition-colors"
                  >
                    Essential only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrefs(getConsent());
                      setManageOpen(true);
                      setVisible(false);
                    }}
                    className="px-5 py-2.5 text-white/70 text-sm font-medium rounded-full hover:text-gold transition-colors"
                  >
                    Manage preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {manageOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            aria-label="Close cookie settings"
            className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
            onClick={closeAll}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-navy shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">Cookie preferences</h2>
                <p className="text-white/60 text-sm mt-1">
                  Choose which optional tools we may use. Essential cookies are always on.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAll}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className="text-white font-semibold text-sm">{category.label}</h3>
                    {category.locked ? (
                      <span className="text-[10px] uppercase tracking-wider text-gold font-bold">Always on</span>
                    ) : (
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className="sr-only">Enable {category.label}</span>
                        <input
                          type="checkbox"
                          checked={!!prefs[category.id]}
                          onChange={(e) => setPrefs((current) => ({ ...current, [category.id]: e.target.checked }))}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-gold focus:ring-gold"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-white/55 text-xs leading-relaxed">{category.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="flex-1 px-5 py-2.5 bg-gold text-navy text-sm font-semibold rounded-full hover:bg-gold-light transition-colors"
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 px-5 py-2.5 border border-white/20 text-white text-sm font-medium rounded-full hover:border-gold hover:text-gold transition-colors"
              >
                Accept all
              </button>
            </div>

            <p className="text-white/40 text-xs mt-4 text-center">
              <Link to="/privacy" className="text-gold hover:text-gold-light underline">
                Privacy Policy
              </Link>
              {" · "}
              <Link to="/terms" className="text-gold hover:text-gold-light underline">
                Terms of Use
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}