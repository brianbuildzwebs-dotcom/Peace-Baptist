import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import SectionHeading from "./SectionHeading";
import { churchInfo } from "@/lib/churchInfo";

export default function UpcomingEventsTeaser() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    base44.entities.Event.filter({ status: "upcoming" }, "-date", 3)
      .then(setEvents)
      .catch(() => {});
  }, []);

  if (events.length === 0) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Gather With Us"
            title="Sunday Is Our Main Event"
            subtitle="While we're building out our events calendar, we'd love for you to join us for worship this week."
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto rounded-3xl border border-gray-100 bg-cloud p-8 sm:p-12 text-center shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <Calendar size={28} className="text-gold" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-navy mb-3">Join Us This Sunday</h3>
            <p className="text-gray-600 mb-6">
              Sunday School at 9:30 AM · Morning Worship at 10:30 AM · Evening Service at 6:00 PM
            </p>
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
                to="/events"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-navy/15 text-navy font-medium rounded-full hover:border-gold hover:text-gold transition-colors"
              >
                View Events <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-500">
              <Clock size={14} className="text-gold" />
              {churchInfo.address.street}, {churchInfo.address.city}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

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