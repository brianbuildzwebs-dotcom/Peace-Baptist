import React, { useState, useEffect } from "react";
import { Save, Upload, Image, Link } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SITE_IMAGE_FIELDS } from "@/hooks/useSiteImages";
import { churchInfo } from "@/lib/churchInfo";

const DEFAULT_SETTINGS = [
  { key: "sermon_playlist_url", label: "Sermon Playlist YouTube Embed URL (optional override)", hint: "Default playlist is in churchInfo.js. Paste iframe src URL here to override." },
  { key: "google_maps_embed", label: "Google Maps Embed URL (optional override)", hint: "Default map is in churchInfo.js. Paste embed src URL here to override." },
  { key: "facebook_url", label: "Facebook Page URL", hint: "e.g. https://www.facebook.com/yourchurch" },
  { key: "youtube_url", label: "YouTube Channel URL", hint: "e.g. https://www.youtube.com/@yourchurch" },
  { key: "instagram_url", label: "Instagram URL", hint: "e.g. https://www.instagram.com/yourchurch" },
];

function defaultImageForField(field) {
  if (field.imageKey) return churchInfo.images[field.imageKey] || "";
  if (field.ministryId) {
    return churchInfo.ministries?.find((m) => m.id === field.ministryId)?.image_url || "";
  }
  return "";
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    base44.entities.SiteSettings.list()
      .then((rows) => {
        const map = {};
        rows.forEach((r) => { map[r.key] = { id: r.id, value: r.value }; });
        setSettings(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getValue = (key) => settings[key]?.value || "";
  const setValue = (key, value) => setSettings((prev) => ({ ...prev, [key]: { ...prev[key], value } }));

  const persistSetting = async (key, label, value) => {
    const current = settings[key];
    if (current?.id) {
      await base44.entities.SiteSettings.update(current.id, { value: value || "" });
    } else {
      const rec = await base44.entities.SiteSettings.create({ key, label, value: value || "" });
      setSettings((prev) => ({ ...prev, [key]: { id: rec.id, value: value || "" } }));
    }
  };

  const saveSetting = async (key, label) => {
    const current = settings[key];
    await persistSetting(key, label, current?.value || "");
    setSaved((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
  };

  const handleImageUpload = async (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKey(field.key);
    setUploadError("");
    try {
      const { file_url: fileUrl } = await base44.integrations.Core.UploadFile({ file });
      if (!fileUrl) throw new Error("Upload succeeded but no image URL was returned.");
      setValue(field.key, fileUrl);
      await persistSetting(field.key, field.label, fileUrl);
      setSaved((prev) => ({ ...prev, [field.key]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [field.key]: false })), 2000);
    } catch (err) {
      setUploadError(err.message || "Upload failed. Try a smaller image (under 4MB).");
    } finally {
      setUploadingKey(null);
      e.target.value = "";
    }
  };

  if (loading) return <div className="text-white/30 text-center py-12">Loading settings...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-heading text-xl font-bold">Site Settings</h2>
        <p className="text-white/40 text-sm mt-1">Upload images and update links. Changes appear on the public site within a few minutes.</p>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Image size={16} className="text-gold" />
          <h3 className="text-white font-semibold">Site Images</h3>
        </div>
        <p className="text-white/30 text-xs -mt-2">Upload a new image for any section below. JPEG or PNG under 4MB. Leave blank to keep the current default.</p>
        {uploadError && (
          <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{uploadError}</p>
        )}
        {SITE_IMAGE_FIELDS.map((field) => {
          const customUrl = getValue(field.key);
          const preview = customUrl || defaultImageForField(field);
          return (
            <div key={field.key} className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
              <label className="block text-white/60 text-xs font-medium mb-1">{field.label}</label>
              {field.hint && <p className="text-white/30 text-xs mb-2">{field.hint}</p>}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {preview && (
                  <img
                    key={preview}
                    src={preview}
                    alt={field.label}
                    className={`object-cover border border-white/10 shrink-0 ${
                      field.squarePreview
                        ? "w-24 h-24 rounded-2xl"
                        : "w-32 h-20 rounded-xl"
                    }`}
                  />
                )}
                <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white/60 text-sm cursor-pointer hover:bg-white/20 transition-all ${uploadingKey === field.key ? "opacity-50" : ""}`}>
                  <Upload size={14} />
                  {uploadingKey === field.key ? "Uploading..." : "Upload Image"}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(field, e)} className="hidden" disabled={uploadingKey === field.key} />
                </label>
                {customUrl && (
                  <span className={`text-xs px-2 py-1 rounded-lg ${saved[field.key] ? "bg-green-500/20 text-green-400" : "text-gold/70"}`}>
                    {saved[field.key] ? "Saved ✓" : "Custom image active"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Link size={16} className="text-gold" />
          <h3 className="text-white font-semibold">Links & Embeds</h3>
        </div>
        <p className="text-white/30 text-xs -mt-2">Live stream and Bible Believers players are managed in Media Library.</p>
        {DEFAULT_SETTINGS.map(({ key, label, hint }) => (
          <div key={key}>
            <label className="block text-white/60 text-xs font-medium mb-1">{label}</label>
            <p className="text-white/30 text-xs mb-2">{hint}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={getValue(key)}
                onChange={(e) => setValue(key, e.target.value)}
                placeholder="Paste URL here..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm"
              />
              <button
                onClick={() => saveSetting(key, label)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${saved[key] ? "bg-green-500 text-white" : "bg-gold text-navy hover:bg-gold-light"}`}
              >
                {saved[key] ? "Saved ✓" : <Save size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}