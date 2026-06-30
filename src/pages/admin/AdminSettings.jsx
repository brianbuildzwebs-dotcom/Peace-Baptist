import React, { useState, useEffect } from "react";
import { Save, Upload, Image, Link, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";

const DEFAULT_SETTINGS = [
  { key: "live_stream_url", label: "Live Stream Embed URL (fallback)", value: "", hint: "Only used if Simple Streamz is not configured in churchInfo.js. Paste an iframe src URL." },
  { key: "sermon_playlist_url", label: "Sermon Playlist YouTube Embed URL", value: "", hint: "e.g. https://www.youtube.com/embed/videoseries?list=PLAYLIST_ID" },
  { key: "worship_playlist_url", label: "Worship Music Playlist URL (hearthis.at or embed)", value: "", hint: "Paste full hearthis.at URL or iframe src" },
  { key: "google_maps_embed", label: "Google Maps Embed URL", value: "", hint: "From Google Maps → Share → Embed → copy the src URL only" },
  { key: "facebook_url", label: "Facebook Page URL", value: "", hint: "e.g. https://www.facebook.com/yourchurch" },
  { key: "youtube_url", label: "YouTube Channel URL", value: "", hint: "e.g. https://www.youtube.com/@yourchurch" },
  { key: "instagram_url", label: "Instagram URL", value: "", hint: "e.g. https://www.instagram.com/yourchurch" },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState(null);

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

  const saveSetting = async (key, label) => {
    const current = settings[key];
    if (current?.id) {
      await base44.entities.SiteSettings.update(current.id, { value: current.value || "" });
    } else {
      const rec = await base44.entities.SiteSettings.create({ key, label, value: current?.value || "" });
      setSettings((prev) => ({ ...prev, [key]: { id: rec.id, value: current?.value || "" } }));
    }
    setSaved((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
  };

  const handleImageUpload = async (key, label, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingKey(key);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setValue(key, file_url);
    setUploadingKey(null);
    // auto-save after upload
    const current = settings[key];
    if (current?.id) {
      await base44.entities.SiteSettings.update(current.id, { value: file_url });
    } else {
      const rec = await base44.entities.SiteSettings.create({ key, label, value: file_url });
      setSettings((prev) => ({ ...prev, [key]: { id: rec.id, value: file_url } }));
    }
    setSaved((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
  };

  const IMAGE_KEYS = [
    { key: "hero_image_url", label: "Homepage Hero Image" },
    { key: "about_image_url", label: "About Page Image" },
    { key: "pastor_image_url", label: "Pastor Photo" },
  ];

  if (loading) return <div className="text-white/30 text-center py-12">Loading settings...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-white font-heading text-xl font-bold">Site Settings</h2>

      {/* URL Settings */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Link size={16} className="text-gold" />
          <h3 className="text-white font-semibold">Embed URLs & Links</h3>
        </div>
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

      {/* Image Upload Settings */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Image size={16} className="text-gold" />
          <h3 className="text-white font-semibold">Site Images</h3>
        </div>
        {IMAGE_KEYS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-white/60 text-xs font-medium mb-2">{label}</label>
            <div className="flex items-center gap-3">
              {getValue(key) && (
                <img src={getValue(key)} alt={label} className="w-24 h-16 object-cover rounded-xl border border-white/10" />
              )}
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white/60 text-sm cursor-pointer hover:bg-white/20 transition-all ${uploadingKey === key ? "opacity-50" : ""}`}>
                <Upload size={14} />
                {uploadingKey === key ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(key, label, e)} className="hidden" disabled={uploadingKey === key} />
              </label>
              {getValue(key) && (
                <span className={`text-xs px-2 py-1 rounded-lg ${saved[key] ? "bg-green-500/20 text-green-400" : "text-white/20"}`}>
                  {saved[key] ? "Saved ✓" : "Uploaded"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}