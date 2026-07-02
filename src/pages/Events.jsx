import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Grid3X3, List, ArrowRight, Play, Megaphone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatEventDate } from "@/lib/eventDates";
import EventRegistrationPanel from "@/components/church/EventRegistrationPanel";
import EventAnnouncementsStrip from "@/components/church/EventAnnouncementsStrip";
import ExpandableText from "@/components/church/ExpandableText";
import { churchInfo } from "@/lib/churchInfo";

const TABS = [
  { id: "all", label: "All Events" },
  { id: "featured", label: "Featured" },
  { id: "rsvp", label: "RSVP" },
  { id: "signup", label: "Sign Up" },
];

function EventBadges({ event }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {event.featured && (
        <span className="text-[10px] font-bold uppercase tracking-wider bg-navy text-white px-2 py-0.5 rounded-full">
          Featured
        </span>
      )}
      {event.rsvp_enabled && (
        <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-gold px-2 py-0.5 rounded-full">
          RSVP
        </span>
      )}
      {event.sign_up_enabled && (
        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
          Sign Up
        </span>
      )}
    </div>
  );
}

function EventActions({ event, onRegister }) {
  const hasRsvp = event.rsvp_enabled;
  const hasSignUp = event.sign_up_enabled;

  if (!hasRsvp && !hasSignUp) return null;

  return (
    <div className={`flex gap-2 ${hasRsvp && hasSignUp ? "flex-col sm:flex-row" : ""}`}>
      {hasSignUp && (
        <button
          type="button"
          onClick={() => onRegister(event, "signup")}
          className="flex-1 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light transition-colors text-sm"
        >
          Sign Up
        </button>
      )}
      {hasRsvp && (
        <button
          type="button"
          onClick={() => onRegister(event, "rsvp")}
          className={`flex-1 py-3 font-semibold rounded-xl transition-colors text-sm ${
            hasSignUp
              ? "border border-navy/15 text-navy hover:border-gold hover:text-gold"
              : "bg-navy text-white hover:bg-navy-light"
          }`}
        >
          RSVP Now
        </button>
      )}
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [tab, setTab] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationMode, setRegistrationMode] = useState("rsvp");

  useEffect(() => {
    base44.entities.Event.filter({ status: "upcoming" }, "date", 50)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = useMemo(() => {
    switch (tab) {
      case "featured":
        return events.filter((event) => event.featured);
      case "rsvp":
        return events.filter((event) => event.rsvp_enabled);
      case "signup":
        return events.filter((event) => event.sign_up_enabled);
      default:
        return events;
    }
  }, [events, tab]);

  const openRegistration = (event, mode) => {
    setRegistrationMode(mode);
    setSelectedEvent(event);
  };

  return (
    <div>
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    tab === item.id
                      ? "bg-navy text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setView("grid")} className={`p-2 rounded-lg ${view === "grid" ? "bg-navy text-white" : "text-gray-400 hover:bg-gray-100"}`}>
                <Grid3X3 size={18} />
              </button>
              <button type="button" onClick={() => setView("list")} className={`p-2 rounded-lg ${view === "list" ? "bg-navy text-white" : "text-gray-400 hover:bg-gray-100"}`}>
                <List size={18} />
              </button>
            </div>
          </div>

          <EventAnnouncementsStrip events={filteredEvents} />

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl border border-gray-100 bg-cloud p-8 sm:p-12 text-center shadow-sm mb-10">
                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <Calendar size={28} className="text-gold" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-navy mb-3">
                  {tab === "all" ? "Join Us This Week" : "No events in this category yet"}
                </h3>
                <p className="text-gray-600 mb-8">
                  {tab === "all"
                    ? "Our regular service schedule is below. Special events will appear here once added in the admin dashboard."
                    : "Check another tab or check back soon."}
                </p>
                {tab === "all" && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
                      {churchInfo.serviceTimes.map((service) => (
                        <div key={service.label} className="rounded-2xl bg-white border border-gray-100 p-4">
                          <p className="font-semibold text-navy">{service.label}</p>
                          <p className="text-gold text-sm font-medium mt-1">{service.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href={churchInfo.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gold text-navy font-bold rounded-full hover:bg-gold-light transition-colors"
                      >
                        <MapPin size={16} />
                        Get Directions
                      </a>
                      <Link
                        to="/watch-live"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-navy/15 text-navy font-medium rounded-full hover:border-gold hover:text-gold transition-colors"
                      >
                        <Play size={16} />
                        Watch Live <ArrowRight size={16} />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : view === "grid" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, i) => (
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
                    <EventBadges event={event} />
                    <div className="flex items-center gap-2 text-gold text-sm font-medium mb-2">
                      <Calendar size={14} />
                      {formatEventDate(event.date, "EEEE, MMMM d, yyyy")}
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
                    {event.announcement && (
                      <div className="mb-4 rounded-xl border border-gold/20 bg-gold/5 px-3 py-2 text-sm text-navy flex items-start gap-2">
                        <Megaphone size={14} className="text-gold shrink-0 mt-0.5" />
                        <span>{event.announcement}</span>
                      </div>
                    )}
                    <ExpandableText text={event.description} className="text-gray-600 text-sm mb-5" />
                    <EventActions event={event} onRegister={openRegistration} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event, i) => (
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
                        <div className="text-gold text-xs font-bold uppercase">{formatEventDate(event.date, "MMM")}</div>
                        <div className="text-3xl font-heading font-bold">{formatEventDate(event.date, "d")}</div>
                        <div className="text-white/50 text-xs">{formatEventDate(event.date, "EEEE")}</div>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <EventBadges event={event} />
                    <h3 className="font-heading text-xl font-bold text-navy mb-1">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      {event.time && <span className="flex items-center gap-1"><Clock size={13} />{event.time}</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin size={13} />{event.location}</span>}
                    </div>
                    {event.announcement && (
                      <div className="mb-3 rounded-xl border border-gold/20 bg-gold/5 px-3 py-2 text-sm text-navy flex items-start gap-2">
                        <Megaphone size={14} className="text-gold shrink-0 mt-0.5" />
                        <span>{event.announcement}</span>
                      </div>
                    )}
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{event.description}</p>
                  </div>
                  <div className="w-full sm:w-auto shrink-0">
                    <EventActions event={event} onRegister={openRegistration} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedEvent && (
          <EventRegistrationPanel
            event={selectedEvent}
            mode={registrationMode}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}