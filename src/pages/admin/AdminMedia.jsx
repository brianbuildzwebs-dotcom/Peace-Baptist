import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Upload, Radio, Save, Tv } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { churchInfo } from "@/lib/churchInfo";
import { extractEmbedSrc } from "@/lib/embedUtils";

const types = ["sermon", "worship", "special"];

const PLAYER_SETTINGS = [
  {
    key: "live_player_embed",
    label: "Live Stream Player",
    hint: "Paste Simple Streamz iframe src or full embed code. Example: https://simplestreamz.io/embed/c/your-channel-id",
    defaultValue: `${churchInfo.liveStream.embedBase}/embed/c/${churchInfo.liveStream.channelId}`,
  },
  {
    key: "bbb_player_embed",
    label: "Bible Believers Broadcast Player",
    hint: "Paste hearthis.at iframe src or embed code.",
    defaultValue: churchInfo.bibleBelieversBroadcast.embedUrl,
  },
];

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", type: "sermon", video_url: "", thumbnail_url: "", speaker: "", series: "", date: "", duration: "", scripture: "", featured: false });
  const [playerSettings, setPlayerSettings] = useState({});
  const [playerDraft, setPlayerDraft] = useState({});
  const [playerSaved, setPlayerSaved] = useState({});

  const load = () => {
    base44.entities.MediaItem.list("-date", 50).then(setMedia).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    base44.entities.SiteSettings.list()
      .then((rows) => {
        const map = {};
        rows.forEach((r) => { map[r.key] = { id: r.id, value: r.value }; });
        setPlayerSettings(map);
        const draft = {};
        PLAYER_SETTINGS.forEach((p) => {
          draft[p.key] = map[p.key]?.value || "";
        });
        setPlayerDraft(draft);
      })
      .catch(() => {});
  }, []);

  const savePlayerSetting = async (field) => {
    const normalized = extractEmbedSrc(playerDraft[field.key] || "");
    const current = playerSettings[field.key];
    if (current?.id) {
      await base44.entities.SiteSettings.update(current.id, { value: normalized });
    } else {
      const rec = await base44.entities.SiteSettings.create({
        key: field.key,
        label: field.label,
        value: normalized,
      });
      setPlayerSettings((prev) => ({ ...prev, [field.key]: { id: rec.id, value: normalized } }));
    }
    setPlayerDraft((prev) => ({ ...prev, [field.key]: normalized }));
    setPlayerSaved((prev) => ({ ...prev, [field.key]: true }));
    setTimeout(() => setPlayerSaved((prev) => ({ ...prev, [field.key]: false })), 2000);
  };

  const handleSave = async () => {
    if (editing) { await base44.entities.MediaItem.update(editing, form); }
    else { await base44.entities.MediaItem.create(form); }
    setShowForm(false); setEditing(null);
    setForm({ title: "", description: "", type: "sermon", video_url: "", thumbnail_url: "", speaker: "", series: "", date: "", duration: "", scripture: "", featured: false });
    load();
  };

  const handleDelete = async (id) => { if (confirm("Delete?")) { await base44.entities.MediaItem.delete(id); load(); } };

  const openEdit = (m) => {
    setForm({ title: m.title || "", description: m.description || "", type: m.type || "sermon", video_url: m.video_url || "", thumbnail_url: m.thumbnail_url || "", speaker: m.speaker || "", series: m.series || "", date: m.date || "", duration: m.duration || "", scripture: m.scripture || "", featured: m.featured || false });
    setEditing(m.id); setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ ...form, thumbnail_url: file_url });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 rounded-2xl p-6 border border-gold/20 space-y-6">
        <div className="flex items-center gap-2">
          <Tv size={18} className="text-gold" />
          <div>
            <h3 className="text-white font-heading font-bold">Stream Players</h3>
            <p className="text-white/40 text-sm">Update live stream or Bible Believers embed from your phone — paste iframe src or full embed code.</p>
          </div>
        </div>

        {PLAYER_SETTINGS.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="block text-white/70 text-sm font-medium">{field.label}</label>
            <p className="text-white/30 text-xs">{field.hint}</p>
            <textarea
              rows={3}
              value={playerDraft[field.key] ?? ""}
              onChange={(e) => setPlayerDraft((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.defaultValue}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-gold text-sm font-mono"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => savePlayerSetting(field)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${playerSaved[field.key] ? "bg-green-500 text-white" : "bg-gold text-navy hover:bg-gold-light"}`}
              >
                <Save size={14} /> {playerSaved[field.key] ? "Saved ✓" : "Save Player"}
              </button>
              {!playerDraft[field.key] && (
                <span className="text-white/30 text-xs">Using default embed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-gold" />
            <h2 className="text-white font-heading text-xl font-bold">Media Library</h2>
          </div>
          <button onClick={() => { setShowForm(true); setEditing(null); }} className="flex items-center gap-2 px-4 py-2 bg-gold text-navy font-semibold rounded-xl text-sm hover:bg-gold-light">
            <Plus size={16} /> Add Media
          </button>
        </div>

        {loading ? (
          <div className="text-white/30 text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-3">
            {media.map((m) => (
              <div key={m.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                {m.thumbnail_url && <img src={m.thumbnail_url} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm">{m.title}</h3>
                  <div className="text-white/40 text-xs">{m.speaker} · {m.series} · {m.type}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(m)} className="p-2 text-white/40 hover:text-gold rounded-lg hover:bg-white/5"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-2 text-white/40 hover:text-red-400 rounded-lg hover:bg-white/5"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {media.length === 0 && <div className="text-white/30 text-center py-12">No media yet.</div>}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-heading font-bold text-lg">{editing ? "Edit Media" : "Add Media"}</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Title *" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm">
                {types.map(t => <option key={t} value={t} className="bg-[#1E293B]">{t}</option>)}
              </select>
              <input placeholder="Video URL (YouTube embed)" value={form.video_url} onChange={(e) => setForm({...form, video_url: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Speaker" value={form.speaker} onChange={(e) => setForm({...form, speaker: e.target.value})} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
                <input placeholder="Series" value={form.series} onChange={(e) => setForm({...form, series: e.target.value})} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm" />
                <input placeholder="Duration (e.g. 45:00)" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              </div>
              <input placeholder="Scripture Reference" value={form.scripture} onChange={(e) => setForm({...form, scripture: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <div>
                <label className="text-white/60 text-xs mb-2 block">Thumbnail</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white/60 text-sm cursor-pointer hover:bg-white/20">
                    <Upload size={14} /> Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {form.thumbnail_url && <img src={form.thumbnail_url} alt="" className="w-12 h-8 rounded object-cover" />}
                </div>
              </div>
              <button onClick={handleSave} disabled={!form.title} className="w-full py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light disabled:opacity-50">
                {editing ? "Update" : "Add Media"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}