import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Bell, Send } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { adminFetch } from "@/lib/admin-fetch";
import Time12Input from "@/components/admin/Time12Input";
import { easternToday, formatEasternTimeLabel, hour12To24, hour24To12 } from "@/lib/time12";

const emptyForm = {
  devotion_date: "",
  title: "Daily Walk",
  scripture_reference: "",
  scripture_text: "",
  message: "",
  author: "Pastor Rudy Shepard",
  publish_mode: "schedule",
  publish_hour12: 7,
  publish_minute: 0,
  publish_ampm: "AM",
};

function rowToForm(row) {
  const { hour12, period } = hour24To12(row.publish_hour ?? 7);
  let publish_mode = "schedule";
  if (row.status === "draft") publish_mode = "draft";
  else if (row.status === "published" && row.publish_hour == null) publish_mode = "now";
  else if (row.status === "published") publish_mode = "schedule";

  return {
    devotion_date: row.devotion_date || "",
    title: row.title || "Daily Walk",
    scripture_reference: row.scripture_reference || "",
    scripture_text: row.scripture_text || "",
    message: row.message || "",
    author: row.author || "Pastor Rudy Shepard",
    publish_mode,
    publish_hour12: hour12,
    publish_minute: row.publish_minute ?? 0,
    publish_ampm: period,
  };
}

function buildPayload(formData) {
  const today = easternToday();
  const payload = {
    devotion_date: formData.devotion_date,
    title: formData.title,
    scripture_reference: formData.scripture_reference,
    scripture_text: formData.scripture_text,
    message: formData.message,
    author: formData.author,
  };

  if (formData.publish_mode === "draft") {
    return { ...payload, status: "draft", publish_hour: null, publish_minute: null };
  }

  if (formData.publish_mode === "now") {
    return { ...payload, status: "published", publish_hour: null, publish_minute: null };
  }

  const publish_hour = hour12To24(formData.publish_hour12, formData.publish_ampm);
  const publish_minute = Number(formData.publish_minute) || 0;
  const isFuture = formData.devotion_date > today;

  return {
    ...payload,
    status: isFuture ? "scheduled" : "scheduled",
    publish_hour,
    publish_minute,
  };
}

function statusLabel(row) {
  if (row.status === "draft") return "Draft";
  if (row.status === "published" && row.publish_hour == null) return "Published";
  if (row.publish_hour != null) {
    return `${row.status === "scheduled" ? "Scheduled" : "Published"} · ${formatEasternTimeLabel(row.publish_hour, row.publish_minute ?? 0)}`;
  }
  return row.status;
}

async function adminPushRequest(path) {
  return adminFetch(`/push/${path}`, { method: "POST" });
}

export default function AdminDailyWalk() {
  const [devotions, setDevotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm, devotion_date: easternToday() });
  const [pushStatus, setPushStatus] = useState("");

  const loadData = () => {
    base44.entities.DailyDevotion.list("-devotion_date", 60)
      .then(setDevotions)
      .catch(() => setDevotions([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleSave = async () => {
    if (!formData.devotion_date || !formData.scripture_reference || !formData.scripture_text || !formData.message) {
      alert("Date, scripture reference, scripture text, and message are required.");
      return;
    }

    const payload = buildPayload(formData);
    if (editing) {
      await base44.entities.DailyDevotion.update(editing, payload);
    } else {
      await base44.entities.DailyDevotion.create(payload);
    }
    setShowForm(false);
    setEditing(null);
    setFormData({ ...emptyForm, devotion_date: easternToday() });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this devotion?")) return;
    await base44.entities.DailyDevotion.delete(id);
    loadData();
  };

  const openEdit = (row) => {
    setFormData(rowToForm(row));
    setEditing(row.id);
    setShowForm(true);
  };

  const sendDailyWalkNow = async () => {
    setPushStatus("Sending…");
    try {
      const result = await adminPushRequest("send-daily-walk");
      setPushStatus(`Sent to ${result.sent || 0} device(s).`);
    } catch (err) {
      setPushStatus(err.message);
    }
  };

  const isFutureDate = formData.devotion_date > easternToday();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white font-heading text-xl font-bold">Daily Walk</h2>
          <p className="text-white/40 text-sm mt-1">
            Schedule devotions to go live on their date at the time you choose (Eastern). Hidden until publish time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={sendDailyWalkNow}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl text-sm hover:bg-white/15"
          >
            <Send size={16} /> Send today&apos;s push now
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setFormData({ ...emptyForm, devotion_date: easternToday() });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-navy font-semibold rounded-xl text-sm hover:bg-gold-light"
          >
            <Plus size={16} /> Add devotion
          </button>
        </div>
      </div>

      {pushStatus && <p className="text-white/50 text-sm mb-4">{pushStatus}</p>}

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="text-white font-semibold">{editing ? "Edit devotion" : "New devotion"}</h3>
          <input
            type="date"
            value={formData.devotion_date}
            onChange={(e) => setFormData({ ...formData, devotion_date: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm"
          />

          <div>
            <label className="text-white/50 text-xs mb-2 block">When should this go live?</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "schedule", label: isFutureDate ? "Schedule on devotion date" : "Schedule time today" },
                { id: "now", label: "Publish now", disabled: isFutureDate },
                { id: "draft", label: "Save as draft" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => setFormData({ ...formData, publish_mode: option.id })}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    formData.publish_mode === option.id
                      ? "bg-gold/20 border-gold text-gold"
                      : "border-white/15 text-white/50 hover:border-white/25 disabled:opacity-40"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {isFutureDate && (
              <p className="text-white/35 text-xs mt-2">
                Future dates are scheduled automatically and stay hidden until that day at the time you set.
              </p>
            )}
          </div>

          {formData.publish_mode === "schedule" && (
            <div>
              <label className="text-white/50 text-xs mb-2 block">Publish time (Eastern)</label>
              <Time12Input
                hour12={formData.publish_hour12}
                minute={formData.publish_minute}
                period={formData.publish_ampm}
                onHour12Change={(value) => setFormData({ ...formData, publish_hour12: value })}
                onMinuteChange={(value) => setFormData({ ...formData, publish_minute: value })}
                onPeriodChange={(value) => setFormData({ ...formData, publish_ampm: value })}
              />
            </div>
          )}

          <input placeholder="Title (optional)" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
          <input placeholder="Scripture reference (e.g. Psalm 23:1)" value={formData.scripture_reference} onChange={(e) => setFormData({ ...formData, scripture_reference: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
          <textarea rows={3} placeholder="Scripture text (KJV)" value={formData.scripture_text} onChange={(e) => setFormData({ ...formData, scripture_text: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
          <textarea rows={5} placeholder="Pastor's message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
          <input placeholder="Author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
          <div className="flex gap-3">
            <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-gold text-navy font-semibold rounded-xl text-sm">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-5 py-2.5 text-white/50 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-white/30">Loading…</p>
      ) : devotions.length === 0 ? (
        <p className="text-white/30 text-center py-12">No devotions yet. Add today&apos;s Daily Walk above.</p>
      ) : (
        <div className="space-y-3">
          {devotions.map((row) => (
            <div key={row.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-medium">{format(new Date(row.devotion_date + "T12:00:00"), "EEE, MMM d, yyyy")}</p>
                <p className="text-white/50 text-sm truncate">{row.scripture_reference} — {row.title || "Daily Walk"}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                  <span>{statusLabel(row)}</span>
                  {row.notification_sent_at && (
                    <span className="flex items-center gap-1 text-gold/70">
                      <Bell size={12} /> Push sent
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => openEdit(row)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white"><Edit2 size={16} /></button>
                <button type="button" onClick={() => handleDelete(row.id)} className="p-2 rounded-lg bg-white/5 text-red-400/70 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}