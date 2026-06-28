import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import SectionHeading from "./SectionHeading";

export default function UpcomingEventsTeaser() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    base44.entities.Event.filter({ status: "upcoming" }, "-date", 3)
      .then(setEvents)
      .catch(() => {});
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="What's Coming"
          title="Upcoming Events"
          subtitle="Join us for fellowship, worship, and community gatherings."
        />
        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group"
            >
              {event.image_url && (
                <div className="h-48 overflow-hidden">
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 text-gold text-sm font-medium mb-3">
                  <Calendar size={14} />
                  {event.date && format(new Date(event.date), "MMMM d, yyyy")}
                  {event.time && ` · ${event.time}`}
                </div>
                <h3 className="font-heading text-xl font-bold text-navy mb-2">{event.title}</h3>
                {event.location && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <MapPin size={14} />
                    {event.location}
                  </div>
                )}
                <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-gold font-semibold hover:gap-4 transition-all duration-300"
          >
            View All Events <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}