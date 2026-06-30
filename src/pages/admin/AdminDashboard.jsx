import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Heart, FileText, Play, Users, TrendingUp, Eye, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, prayers: 0, submissions: 0, media: 0, contacts: 0, giving: 0 });
  const [recentPrayers, setRecentPrayers] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Event.filter({ status: "upcoming" }).then(d => d.length).catch(() => 0),
      base44.entities.PrayerRequest.filter({ status: "new" }).then(d => d.length).catch(() => 0),
      base44.entities.FormSubmission.list("-created_date", 5).catch(() => []),
      base44.entities.MediaItem.list().then(d => d.length).catch(() => 0),
      base44.entities.ContactMessage.filter({ status: "new" }).then(d => d.length).catch(() => 0),
      base44.entities.GivingRecord.list().then(d => d.reduce((sum, r) => sum + (r.amount || 0), 0)).catch(() => 0),
      base44.entities.PrayerRequest.filter({ status: "new" }, "-created_date", 5).catch(() => []),
    ]).then(([events, prayers, submissions, media, contacts, giving, rPrayers]) => {
      setStats({ events, prayers, submissions: submissions.length, media, contacts, giving });
      setRecentSubmissions(submissions);
      setRecentPrayers(rPrayers);
    });
  }, []);

  const cards = [
    { label: "Upcoming Events", value: stats.events, icon: Calendar, color: "text-blue-400" },
    { label: "New Prayer Requests", value: stats.prayers, icon: Heart, color: "text-pink-400" },
    { label: "Form Submissions", value: stats.submissions, icon: FileText, color: "text-green-400" },
    { label: "Media Items", value: stats.media, icon: Play, color: "text-purple-400" },
    { label: "New Messages", value: stats.contacts, icon: Send, color: "text-orange-400" },
    { label: "Total Giving", value: `$${stats.giving.toLocaleString()}`, icon: TrendingUp, color: "text-gold" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Prayer Requests */}
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

        {/* Recent Submissions */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-heading font-bold mb-4">Recent Form Submissions</h3>
          {recentSubmissions.length === 0 ? (
            <p className="text-white/30 text-sm">No recent submissions.</p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((s) => (
                <div key={s.id} className="bg-white/5 rounded-xl p-4">
                  <div className="text-gold text-xs font-bold mb-1">{s.form_title}</div>
                  <div className="text-white/70 text-sm">{s.submitter_name || "Anonymous"}</div>
                  <div className="text-white/30 text-xs">{s.submitter_email}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}