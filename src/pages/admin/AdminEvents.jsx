import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, X, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatEventDate } from "@/lib/eventDates";

const categories = ["worship", "fellowship", "youth", "outreach", "study", "special", "other"];

const emptyForm = {
  title: "",
  description: "",
  announcement: "",
  date: "",
  time: "",
  end_time: "",
  location: "",
  category: "worship",
  image_url: "",
  rsvp_enabled: true,
  sign_up_enabled: false,
  form_id: "",
  featured: false,
};

const eventFormOptions = (forms) =>
  forms.filter((f) => ["event_registration", "general", "volunteer", "ministry_signup"].includes(f.form_type));

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const loadData = () => {
    Promise.all([
      base44.entities.Event.list("-date", 50),
      base44.entities.CustomForm.filter({ status: "active" }),
    ])
      .then(([ev, fo]) => {
        setEvents(ev);
        setForms(fo);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleSave = async () => {
    if (!formData.title?.trim() || !formData.date) {
      alert("Event title and date are required.");
      return;
    }

    const payload = {
      ...formData,
      title: formData.title.trim(),
      announcement: formData.announcement?.trim() || null,
      form_id: formData.form_id || null,
    };

    if (editing) {
      await base44.entities.Event.update(editing, payload);
    } else {
      await base44.entities.Event.create({ ...payload, status: "upcoming" });
    }
    setShowForm(false);
    setEditing(null);
    setFormData({ ...emptyForm });
    loadData();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this event?")) {
      await base44.entities.Event.delete(id);
      loadData();
    }
  };

  const openEdit = (event) => {
    setFormData({
      title: event.title || "",
      description: event.description || "",
      announcement: event.announcement || "",
      date: event.date || "",
      time: event.time || "",
      end_time: event.end_time || "",
      location: event.location || "",
      category: event.category || "worship",
      image_url: event.image_url || "",
      rsvp_enabled: event.rsvp_enabled ?? true,
      sign_up_enabled: event.sign_up_enabled ?? false,
      form_id: event.form_id || "",
      featured: event.featured || false,
    });
    setEditing(event.id);
    setShowForm(true);
  };

  const viewSubmissions = async (event) => {
    const subs = await base44.entities.FormSubmission.filter({ event_id: event.id }, "-created_date", 100);
    setSubmissions(subs);
    setViewingSubmissions(event);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, image_url: file_url });
  };

  const registrationForms = eventFormOptions(forms);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-heading text-xl font-bold">Manage Events</h2>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({ ...emptyForm });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-navy font-semibold rounded-xl text-sm hover:bg-gold-light transition-colors"
        >
          <Plus size={16} /> Add Event
        </button>
      </div>

      {loading ? (
        <div className="text-white/30 text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/5">
              {event.image_url && <img src={event.image_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">{event.title}</h3>
                  {event.featured && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-gold">Featured</span>}
                  {event.rsvp_enabled && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">RSVP</span>}
                  {event.sign_up_enabled && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Sign Up</span>}
                </div>
                <div className="text-white/40 text-sm">
                  {formatEventDate(event.date, "EEE, MMM d, yyyy")}
                  {event.time ? ` · ${event.time}` : ""}
                  {event.location ? ` · ${event.location}` : ""}
                </div>
                {event.announcement && (
                  <p className="text-gold/70 text-xs mt-1 line-clamp-1">Announcement: {event.announcement}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => viewSubmissions(event)} className="p-2 text-white/40 hover:text-blue-400 rounded-lg hover:bg-white/5" title="View submissions">
                  <Eye size={16} />
                </button>
                <button type="button" onClick={() => openEdit(event)} className="p-2 text-white/40 hover:text-gold rounded-lg hover:bg-white/5">
                  <Edit2 size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(event.id)} className="p-2 text-white/40 hover:text-red-400 rounded-lg hover:bg-white/5">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && <div className="text-white/30 text-center py-12">No events yet.</div>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-heading font-bold text-lg">{editing ? "Edit Event" : "New Event"}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Event Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <textarea placeholder="Description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <textarea
                placeholder="Announcement (optional) — shows on the Events page and home when set"
                rows={2}
                value={formData.announcement}
                onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm" />
                <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm" />
              </div>
              <input type="time" placeholder="End Time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm" />
              <input placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm" />
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm">
                {categories.map((c) => <option key={c} value={c} className="bg-[#1E293B]">{c}</option>)}
              </select>
              <div>
                <label className="text-white/60 text-xs mb-2 block">Event Image</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white/60 text-sm cursor-pointer hover:bg-white/20">
                    <Upload size={14} /> Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {formData.image_url && <img src={formData.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-2 block">Attach Custom Form (for RSVP / Sign Up)</label>
                <select value={formData.form_id} onChange={(e) => setFormData({ ...formData, form_id: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none focus:border-gold text-sm">
                  <option value="" className="bg-[#1E293B]">Default form (name + email only)</option>
                  {registrationForms.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#1E293B]">
                      {f.title} ({f.form_type?.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="rounded border-white/20 text-gold focus:ring-gold bg-white/10" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.rsvp_enabled} onChange={(e) => setFormData({ ...formData, rsvp_enabled: e.target.checked })} className="rounded border-white/20 text-gold focus:ring-gold bg-white/10" />
                  RSVP
                </label>
                <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.sign_up_enabled} onChange={(e) => setFormData({ ...formData, sign_up_enabled: e.target.checked })} className="rounded border-white/20 text-gold focus:ring-gold bg-white/10" />
                  Sign Up
                </label>
              </div>
              <button type="button" onClick={handleSave} className="w-full py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light transition-colors">
                {editing ? "Update Event" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingSubmissions && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-heading font-bold text-lg">Submissions: {viewingSubmissions.title}</h3>
              <button type="button" onClick={() => setViewingSubmissions(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            {submissions.length === 0 ? (
              <p className="text-white/30 text-center py-8">No submissions yet.</p>
            ) : (
              <div className="space-y-3">
                {submissions.map((r) => (
                  <div key={r.id} className="bg-white/5 rounded-xl p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-white font-medium">{r.submitter_name || "Anonymous"}</div>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                          {r.data?.registration_type === "sign_up" ? "Sign Up" : "RSVP"}
                        </span>
                      </div>
                      <div className="text-white/40 text-sm">{r.submitter_email}</div>
                      {r.data && Object.entries(r.data).filter(([k]) => !["name", "email", "registration_type"].includes(k)).map(([k, v]) => (
                        <div key={k} className="text-white/30 text-xs mt-1">{k}: {String(v)}</div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("Delete this registration?")) return;
                        await base44.entities.FormSubmission.delete(r.id);
                        viewSubmissions(viewingSubmissions);
                      }}
                      className="p-2 text-white/30 hover:text-red-400 rounded-lg hover:bg-white/5 shrink-0"
                      aria-label="Delete registration"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <div className="text-white/40 text-sm text-center pt-2">{submissions.length} total submission(s)</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}