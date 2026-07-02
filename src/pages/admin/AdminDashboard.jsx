import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Heart, FileText, Play, TrendingUp, Send, Radio, Bell, Trash2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { adminFetch } from "@/lib/admin-fetch";

const DEFAULT_FORM_PREFIX = "default_";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isCustomFormSubmission(submission, activeFormIds) {
  const formId = submission?.form_id;
  if (!formId || String(formId).startsWith(DEFAULT_FORM_PREFIX)) return false;
  if (!UUID_RE.test(String(formId))) return false;
  return activeFormIds.has(formId);
}

function isEventRegistration(submission) {
  const formId = String(submission?.form_id || "");
  return formId.startsWith(DEFAULT_FORM_PREFIX) || Boolean(submission?.event_id);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    events: 0,
    prayers: 0,
    formSubmissions: 0,
    eventRegistrations: 0,
    media: 0,
    contacts: 0,
    giving: 0,
  });
  const [recentPrayers, setRecentPrayers] = useState([]);
  const [recentFormSubmissions, setRecentFormSubmissions] = useState([]);
  const [recentEventRegistrations, setRecentEventRegistrations] = useState([]);
  const [eventTitles, setEventTitles] = useState({});
  const [livePushStatus, setLivePushStatus] = useState("");
  const [subscriberCount, setSubscriberCount] = useState(null);

  const loadDashboard = useCallback(() => {
    Promise.all([
      base44.entities.Event.filter({ status: "upcoming" }).then((d) => d.length).catch(() => 0),
      base44.entities.PrayerRequest.filter({ status: "new" }).then((d) => d.length).catch(() => 0),
      base44.entities.CustomForm.filter({ status: "active" }).catch(() => []),
      base44.entities.Event.list("-date", 50).catch(() => []),
      base44.entities.FormSubmission.list("-created_date", 100).catch(() => []),
      base44.entities.MediaItem.list().then((d) => d.length).catch(() => 0),
      base44.entities.ContactMessage.filter({ status: "new" }).then((d) => d.length).catch(() => 0),
      base44.entities.GivingRecord.list().then((d) => d.reduce((sum, r) => sum + (r.amount || 0), 0)).catch(() => 0),
      base44.entities.PrayerRequest.filter({ status: "new" }, "-created_date", 5).catch(() => []),
    ]).then(([events, prayers, forms, allEvents, submissions, media, contacts, giving, rPrayers]) => {
      const activeFormIds = new Set((forms || []).map((f) => f.id));
      const titles = Object.fromEntries((allEvents || []).map((event) => [event.id, event.title]));
      const all = Array.isArray(submissions) ? submissions : [];

      const customForms = all.filter((row) => isCustomFormSubmission(row, activeFormIds));
      const eventRegs = all.filter((row) => isEventRegistration(row));

      setEventTitles(titles);
      setStats({
        events,
        prayers,
        formSubmissions: customForms.length,
        eventRegistrations: eventRegs.length,
        media,
        contacts,
        giving,
      });
      setRecentFormSubmissions(customForms.slice(0, 5));
      setRecentEventRegistrations(eventRegs.slice(0, 5));
      setRecentPrayers(rPrayers);
    });
  }, []);

  useEffect(() => {
    adminFetch("/admin/cleanup-orphaned-submissions", { method: "POST" })
      .finally(loadDashboard);

    adminFetch("/push/subscriber-count")
      .then((d) => setSubscriberCount(d.count ?? 0))
      .catch(() => setSubscriberCount(null));
  }, [loadDashboard]);

  const deleteSubmission = async (id) => {
    if (!confirm("Delete this submission?")) return;
    await base44.entities.FormSubmission.delete(id);
    loadDashboard();
  };

  const sendLiveAlert = async () => {
    if (!confirm("Send a live stream notification to all subscribers?")) return;
    setLivePushStatus("Sending…");
    try {
      const payload = await adminFetch("/push/send-live", { method: "POST" });
      const sent = payload.sent || 0;
      const total = payload.total || 0;
      if (sent === 0) {
        setLivePushStatus(
          total === 0
            ? "No devices subscribed yet. On each phone: open peacebaptist.net, enable notifications (iPhone: add to Home Screen first, then open the app icon)."
            : `Sent to 0 of ${total} subscriber(s). Check that the other phone enabled alerts and includes the Live stream topic.`
        );
      } else {
        setLivePushStatus(`Live alert sent to ${sent} of ${total} subscriber(s).`);
      }
      if (typeof total === "number") setSubscriberCount(total);
    } catch (err) {
      setLivePushStatus(err.message);
    }
  };

  const cards = [
    { label: "Upcoming Events", value: stats.events, icon: Calendar, color: "text-blue-400" },
    { label: "New Prayer Requests", value: stats.prayers, icon: Heart, color: "text-pink-400" },
    { label: "Custom Form Submissions", value: stats.formSubmissions, icon: FileText, color: "text-green-400" },
    { label: "Event RSVPs / Sign Ups", value: stats.eventRegistrations, icon: Users, color: "text-emerald-400" },
    { label: "Media Items", value: stats.media, icon: Play, color: "text-purple-400" },
    { label: "New Messages", value: stats.contacts, icon: Send, color: "text-orange-400" },
    { label: "Total Giving", value: `$${stats.giving.toLocaleString()}`, icon: TrendingUp, color: "text-gold" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon size={20} className={card.color} />
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-white/40 text-sm">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-heading font-bold">Live stream alert</h3>
          <p className="text-white/40 text-sm mt-1">
            Notify subscribed phones when Sunday service is live. You do not need notification permission on this computer to send.
            {subscriberCount != null && (
              <span className={`block mt-1 ${subscriberCount === 0 ? "text-amber-300" : "text-gold/80"}`}>
                {subscriberCount === 0
                  ? "0 devices subscribed — members must enable alerts on each phone."
                  : `${subscriberCount} device(s) subscribed`}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={sendLiveAlert}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-sm font-semibold hover:bg-red-500/30 shrink-0"
        >
          <Radio size={16} /> We&apos;re Live — Send Push
        </button>
      </div>
      {livePushStatus && <p className="text-white/50 text-sm">{livePushStatus}</p>}

      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-heading font-bold">Scheduled notifications</h3>
          <p className="text-white/40 text-sm mt-1">Set automatic Daily Walk, live, or custom pushes. Manual send buttons still work anytime.</p>
        </div>
        <Link
          to="/admin/notifications"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold/15 text-gold border border-gold/30 rounded-xl text-sm font-semibold hover:bg-gold/25 shrink-0"
        >
          <Bell size={16} /> Manage schedule
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-heading font-bold mb-4">Recent Prayer Requests</h3>
          {recentPrayers.length === 0 ? (
            <p className="text-white/30 text-sm">No new prayer requests.</p>
          ) : (
            <div className="space-y-3">
              {recentPrayers.map((pr) => (
                <div key={pr.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gold uppercase font-bold tracking-wider">{pr.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${pr.status === "new" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>{pr.status}</span>
                  </div>
                  <p className="text-white/70 text-sm line-clamp-2">{pr.request}</p>
                  {pr.name && !pr.is_anonymous && <p className="text-white/30 text-xs mt-1">— {pr.name}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-heading font-bold mb-1">Recent Form Submissions</h3>
          <p className="text-white/35 text-xs mb-4">From custom forms in Admin → Forms only.</p>
          {recentFormSubmissions.length === 0 ? (
            <p className="text-white/30 text-sm">No custom form submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentFormSubmissions.map((s) => (
                <div key={s.id} className="bg-white/5 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-gold text-xs font-bold mb-1">{s.form_title}</div>
                    <div className="text-white/70 text-sm">{s.submitter_name || "Anonymous"}</div>
                    <div className="text-white/30 text-xs">{s.submitter_email}</div>
                  </div>
                  <button type="button" onClick={() => deleteSubmission(s.id)} className="p-2 text-white/30 hover:text-red-400 rounded-lg hover:bg-white/5 shrink-0" aria-label="Delete submission">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between gap-4 mb-1">
          <h3 className="text-white font-heading font-bold">Recent Event RSVPs &amp; Sign Ups</h3>
          <Link to="/admin/events" className="text-gold text-xs font-medium hover:underline shrink-0">
            Manage events
          </Link>
        </div>
        <p className="text-white/35 text-xs mb-4">
          These come from the Events page (RSVP / Sign Up), not the Forms builder. Delete test entries here or in Manage Events.
        </p>
        {recentEventRegistrations.length === 0 ? (
          <p className="text-white/30 text-sm">No event registrations yet.</p>
        ) : (
          <div className="space-y-3">
            {recentEventRegistrations.map((s) => (
              <div key={s.id} className="bg-white/5 rounded-xl p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-gold text-xs font-bold mb-1">{s.form_title || "Event registration"}</div>
                  {s.event_id && eventTitles[s.event_id] && (
                    <div className="text-white/45 text-xs mb-1">{eventTitles[s.event_id]}</div>
                  )}
                  <div className="text-white/70 text-sm">{s.submitter_name || "Anonymous"}</div>
                  <div className="text-white/30 text-xs">{s.submitter_email}</div>
                </div>
                <button type="button" onClick={() => deleteSubmission(s.id)} className="p-2 text-white/30 hover:text-red-400 rounded-lg hover:bg-white/5 shrink-0" aria-label="Delete registration">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}