import React, { useState, useEffect } from "react";
import { Heart, Eye, CheckCircle, Archive, MessageSquare, Trash2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminPrayers() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");

  const loadPrayers = () => {
    const query = filter === "all" ? {} : { status: filter };
    base44.entities.PrayerRequest.filter(query, "-created_date", 50)
      .then(setPrayers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadPrayers, [filter]);

  const updateStatus = async (id, status) => {
    await base44.entities.PrayerRequest.update(id, { status });
    loadPrayers();
  };

  const saveNotes = async () => {
    if (!selected) return;
    await base44.entities.PrayerRequest.update(selected.id, { admin_notes: notes });
    setSelected(null);
    loadPrayers();
  };

  const togglePublic = async (id, current) => {
    await base44.entities.PrayerRequest.update(id, { is_public: !current });
    loadPrayers();
  };

  const handleDelete = async (pr) => {
    if (!confirm(`Delete this prayer request${pr.name && !pr.is_anonymous ? ` from ${pr.name}` : ""}? This cannot be undone.`)) return;
    await base44.entities.PrayerRequest.delete(pr.id);
    if (selected?.id === pr.id) setSelected(null);
    loadPrayers();
  };

  const statusColors = { new: "bg-blue-500/20 text-blue-400", praying: "bg-yellow-500/20 text-yellow-400", answered: "bg-green-500/20 text-green-400", archived: "bg-gray-500/20 text-gray-400" };

  // Category stats
  const categoryCounts = {};
  prayers.forEach(p => { categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1; });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-white font-heading text-xl font-bold">Prayer Requests</h2>
        <div className="flex gap-2">
          {["all", "new", "praying", "answered", "archived"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? "bg-gold text-navy" : "bg-white/5 text-white/40 hover:text-white"}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Category Heat Map */}
      {Object.keys(categoryCounts).length > 0 && (
        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 mb-6">
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Areas of Need</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                <div className="text-gold font-bold text-lg">{count}</div>
                <div className="text-white/40 text-xs capitalize">{cat}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-white/30 text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-3">
          {prayers.map((pr) => (
            <div key={pr.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gold uppercase font-bold tracking-wider capitalize">{pr.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[pr.status]}`}>{pr.status}</span>
                    {pr.is_anonymous && <span className="text-xs text-white/20">Anonymous</span>}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{pr.request}</p>
                  {pr.name && !pr.is_anonymous && <p className="text-white/30 text-xs mt-2">— {pr.name} {pr.email && `(${pr.email})`}</p>}
                  {pr.admin_notes && <p className="text-gold/50 text-xs mt-1 italic">Notes: {pr.admin_notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => updateStatus(pr.id, "praying")} title="Mark as Praying" className="p-1.5 text-white/30 hover:text-yellow-400 rounded hover:bg-white/5"><Heart size={14} /></button>
                  <button onClick={() => updateStatus(pr.id, "answered")} title="Mark as Answered" className="p-1.5 text-white/30 hover:text-green-400 rounded hover:bg-white/5"><CheckCircle size={14} /></button>
                  <button onClick={() => togglePublic(pr.id, pr.is_public)} title="Toggle Public" className="p-1.5 text-white/30 hover:text-blue-400 rounded hover:bg-white/5"><Eye size={14} /></button>
                  <button onClick={() => { setSelected(pr); setNotes(pr.admin_notes || ""); }} title="Add Notes" className="p-1.5 text-white/30 hover:text-gold rounded hover:bg-white/5"><MessageSquare size={14} /></button>
                  <button onClick={() => updateStatus(pr.id, "archived")} title="Archive" className="p-1.5 text-white/30 hover:text-gray-400 rounded hover:bg-white/5"><Archive size={14} /></button>
                  <button onClick={() => handleDelete(pr)} title="Delete" className="p-1.5 text-white/30 hover:text-red-400 rounded hover:bg-white/5"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {prayers.length === 0 && <div className="text-white/30 text-center py-12">No prayer requests found.</div>}
        </div>
      )}

      {/* Notes Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-heading font-bold">Admin Notes</h3>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-gold text-sm mb-4" placeholder="Add notes about this prayer request..." />
            <button onClick={saveNotes} className="w-full py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light">Save Notes</button>
          </div>
        </div>
      )}
    </div>
  );
}