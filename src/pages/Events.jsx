import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, Users, Grid3X3, List, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import SectionHeading from "@/components/church/SectionHeading";
import EventRSVPPanel from "@/components/church/EventRSVPPanel";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    base44.entities.Event.filter({ status: "upcoming" }, "date", 50)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="navy-gradient page-hero-offset pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Events</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-4">Upcoming Events</h1>
            <p className="text-white/60 text-lg max-w-xl">Join us for worship, fellowship, and community gatherings.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* View Toggle */}
          <div className="flex items-center justify-end gap-2 mb-8">
            <button onClick={() => setView("grid")} className={`p-2 rounded-lg ${view === "grid" ? "bg-navy text-white" : "text-gray-400 hover:bg-gray-100"}`}>
              <Grid3X3 size={18} />
            </button>
            <button onClick={() => setView("list")} className={`p-2 rounded-lg ${view === "list" ? "bg-navy text-white" : "text-gray-400 hover:bg-gray-100"}`}>
              <List size={18} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming events. Check back soon!</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group bg-white"
                >
                  <div className="h-48 overflow-hidden relative">
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy/10 to-gold/10 flex items-center justify-center">
                        <Calendar size={40} className="text-navy/20" />
                      </div>
                    )}
                    {event.category && (
                      <span className="absolute top-4 left-4 text-xs font-bold bg-gold text-navy px-3 py-1 rounded-full uppercase tracking-wider">
                        {event.category}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-gold text-sm font-medium mb-2">
                      <Calendar size={14} />
                      {event.date && format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                    </div>
                    <h3 className="font-heading text-xl font-bold text-navy mb-2">{event.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                      {event.time && (
                        <span className="flex items-center gap-1"><Clock size={13} />{event.time}{event.end_time && ` - ${event.end_time}`}</span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1"><MapPin size={13} />{event.location}</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-5">{event.description}</p>
                    {event.rsvp_enabled && (
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="w-full py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-colors text-sm"
                      >
                        RSVP Now
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex flex-col sm:flex-row items-start gap-6 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-500"
                >
                  <div className="w-full sm:w-32 shrink-0 text-center bg-navy rounded-xl p-4 text-white">
                    {event.date && (
                      <>
                        <div className="text-gold text-xs font-bold uppercase">{format(new Date(event.date), "MMM")}</div>
                        <div className="text-3xl font-heading font-bold">{format(new Date(event.date), "d")}</div>
                        <div className="text-white/50 text-xs">{format(new Date(event.date), "EEEE")}</div>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold text-navy mb-1">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      {event.time && <span className="flex items-center gap-1"><Clock size={13} />{event.time}</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin size={13} />{event.location}</span>}
                    </div>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  </div>
                  {event.rsvp_enabled && (
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="shrink-0 px-6 py-2.5 bg-gold text-navy font-semibold rounded-full hover:bg-gold-light transition-colors text-sm"
                    >
                      RSVP
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RSVP Panel */}
      <AnimatePresence>
        {selectedEvent && (
          <EventRSVPPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}