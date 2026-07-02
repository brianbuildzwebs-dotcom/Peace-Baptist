import React, { useEffect, useState } from "react";
import { Bell, Plus, Save, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Time12Input from "@/components/admin/Time12Input";
import { hour12To24, hour24To12 } from "@/lib/time12";

const DAY_OPTIONS = [
  { id: 0, label: "Sun" },
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
];

const TYPE_OPTIONS = [
  { id: "daily_walk", label: "Daily Walk (today's devotion)" },
  { id: "live", label: "Live stream alert" },
  { id: "custom", label: "Custom message" },
];

const TOPIC_OPTIONS = [
  { id: "daily_walk", label: "Daily Walk subscribers" },
  { id: "prayer", label: "Prayer Request subscribers" },
  { id: "live", label: "Live stream subscribers" },
];

const DEFAULT_SCHEDULES = [
  {
    id: "daily_walk_morning",
    type: "daily_walk",
    hour: 7,
    minute: 0,
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    topic: "daily_walk",
    title: "",
    body: "",
    url: "/daily-walk",
  },
];

function newSchedule() {
  return {
    id: `schedule_${Date.now()}`,
    type: "live",
    hour: 10,
    minute: 30,
    days: [0],
    enabled: true,
    topic: "live",
    title: "Peace Baptist — We're Live!",
    body: "Sunday service is streaming now. Tap to watch.",
    url: "/watch-live",
  };
}

export default function AdminNotifications() {
  const [schedules, setSchedules] = useState(DEFAULT_SCHEDULES);
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.SiteSettings.filter({ key: "push_schedules" })
      .then((rows) => {
        if (rows[0]?.value) {
          try {
            const parsed = JSON.parse(rows[0].value);
            if (Array.isArray(parsed) && parsed.length) setSchedules(parsed);
          } catch {
            /* keep defaults */
          }
          setSettingsId(rows[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSchedule = (id, patch) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const toggleDay = (scheduleId, dayId) => {
    setSchedules((prev) => prev.map((s) => {
      if (s.id !== scheduleId) return s;
      const days = s.days.includes(dayId) ? s.days.filter((d) => d !== dayId) : [...s.days, dayId].sort();
      return { ...s, days };
    }));
  };

  const removeSchedule = (id) => {
    if (!confirm("Remove this scheduled notification?")) return;
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const saveSchedules = async () => {
    setSaving(true);
    try {
      const payload = JSON.stringify(schedules);
      if (settingsId) {
        await base44.entities.SiteSettings.update(settingsId, { value: payload });
      } else {
        const rec = await base44.entities.SiteSettings.create({
          key: "push_schedules",
          label: "Scheduled push notifications",
          value: payload,
        });
        setSettingsId(rec.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white/30 text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-heading text-xl font-bold flex items-center gap-2">
          <Bell size={20} className="text-gold" /> Notification Scheduler
        </h2>
        <p className="text-white/40 text-sm mt-1">
          Automatic pushes run on Eastern Time. Manual &quot;Send Push&quot; buttons on the dashboard still work anytime.
        </p>
      </div>

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-white text-sm font-medium">
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={(e) => updateSchedule(schedule.id, { enabled: e.target.checked })}
                  className="rounded"
                />
                Enabled
              </label>
              <button
                type="button"
                onClick={() => removeSchedule(schedule.id)}
                className="p-2 text-white/30 hover:text-red-400 rounded-lg hover:bg-white/5"
                title="Remove schedule"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">Type</label>
                <select
                  value={schedule.type}
                  onChange={(e) => updateSchedule(schedule.id, { type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm"
                >
                  {TYPE_OPTIONS.map((t) => <option key={t.id} value={t.id} className="bg-[#1E293B]">{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Send to</label>
                <select
                  value={schedule.topic || "live"}
                  onChange={(e) => updateSchedule(schedule.id, { topic: e.target.value })}
                  disabled={schedule.type === "daily_walk"}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm disabled:opacity-50"
                >
                  {TOPIC_OPTIONS.map((t) => <option key={t.id} value={t.id} className="bg-[#1E293B]">{t.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-white/50 text-xs mb-2 block">Send time (Eastern)</label>
              <Time12Input
                hour12={hour24To12(schedule.hour).hour12}
                minute={schedule.minute ?? 0}
                period={hour24To12(schedule.hour).period}
                onHour12Change={(value) => {
                  const { period } = hour24To12(schedule.hour);
                  updateSchedule(schedule.id, { hour: hour12To24(value, period) });
                }}
                onMinuteChange={(value) => updateSchedule(schedule.id, { minute: value })}
                onPeriodChange={(value) => {
                  const { hour12 } = hour24To12(schedule.hour);
                  updateSchedule(schedule.id, { hour: hour12To24(hour12, value) });
                }}
              />
            </div>

            <div>
              <label className="text-white/50 text-xs mb-2 block">Days</label>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(schedule.id, day.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                      schedule.days.includes(day.id)
                        ? "bg-gold/20 border-gold text-gold"
                        : "border-white/15 text-white/40"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {schedule.type === "custom" && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <input
                  placeholder="Notification title"
                  value={schedule.title || ""}
                  onChange={(e) => updateSchedule(schedule.id, { title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm"
                />
                <input
                  placeholder="Notification message"
                  value={schedule.body || ""}
                  onChange={(e) => updateSchedule(schedule.id, { body: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm"
                />
                <input
                  placeholder="Link path (e.g. /events)"
                  value={schedule.url || "/"}
                  onChange={(e) => updateSchedule(schedule.id, { url: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setSchedules((prev) => [...prev, newSchedule()])}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-xl text-sm hover:bg-white/15"
        >
          <Plus size={16} /> Add schedule
        </button>
        <button
          type="button"
          onClick={saveSchedules}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold ${saved ? "bg-green-500 text-white" : "bg-gold text-navy hover:bg-gold-light"}`}
        >
          <Save size={16} /> {saving ? "Saving..." : saved ? "Saved ✓" : "Save schedules"}
        </button>
      </div>
    </div>
  );
}