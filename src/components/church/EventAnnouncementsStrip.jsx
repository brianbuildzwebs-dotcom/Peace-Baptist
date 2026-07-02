import React from "react";
import { Megaphone } from "lucide-react";

export default function EventAnnouncementsStrip({ events = [] }) {
  const announcements = events.filter((event) => String(event.announcement || "").trim());

  if (!announcements.length) return null;

  return (
    <div className="space-y-3 mb-10">
      {announcements.map((event) => (
        <div
          key={event.id}
          className="rounded-2xl border border-gold/25 bg-gold/10 px-5 py-4 flex items-start gap-3"
        >
          <Megaphone size={18} className="text-gold shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold mb-1">{event.title}</p>
            <p className="text-navy text-sm leading-relaxed">{event.announcement}</p>
          </div>
        </div>
      ))}
    </div>
  );
}