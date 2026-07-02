import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, parseISO } from "date-fns";
import { base44 } from "@/api/base44Client";
import { churchInfo } from "@/lib/churchInfo";

function easternToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

export default function DailyWalk() {
  const [selectedDate, setSelectedDate] = useState(easternToday());
  const [devotion, setDevotion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.DailyDevotion.filter({ devotion_date: selectedDate })
      .then((rows) => setDevotion(rows[0] || null))
      .catch(() => setDevotion(null))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const shiftDate = (days) => {
    const next = format(addDays(parseISO(selectedDate), days), "yyyy-MM-dd");
    setSelectedDate(next);
  };

  const isToday = selectedDate === easternToday();

  return (
    <div>
      <section className="relative navy-gradient page-hero-offset pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Daily Walk</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-4">Morning Devotion</h1>
            <p className="text-white/60 text-lg max-w-2xl">
              Start your day in God&apos;s Word with a daily message from {churchInfo.pastor}, using the King James Bible.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              className="flex items-center gap-1 text-navy/60 hover:text-navy text-sm font-medium"
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-gold font-bold">Devotion</p>
              <p className="font-heading text-xl font-bold text-navy">
                {format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
              </p>
              {!isToday && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(easternToday())}
                  className="text-xs text-gold hover:underline mt-1"
                >
                  Back to today
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => shiftDate(1)}
              className="flex items-center gap-1 text-navy/60 hover:text-navy text-sm font-medium"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading…</div>
          ) : !devotion ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
              <BookOpen className="w-12 h-12 text-gold/40 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No devotion posted for this date yet.</p>
              <p className="text-gray-400 text-sm mt-2">Check back soon or enable notifications for the morning alert.</p>
            </div>
          ) : (
            <article className="bg-navy rounded-3xl p-8 sm:p-10 text-white shadow-xl">
              {devotion.title && (
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gold mb-6">{devotion.title}</h2>
              )}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <p className="text-gold text-sm font-bold uppercase tracking-wider mb-2">Scripture</p>
                <p className="font-heading text-lg font-semibold mb-3">{devotion.scripture_reference}</p>
                <p className="text-white/80 leading-relaxed italic whitespace-pre-wrap">{devotion.scripture_text}</p>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-lg">{devotion.message}</p>
              </div>
              {devotion.author && (
                <p className="mt-8 text-white/50 text-sm">— {devotion.author}</p>
              )}
            </article>
          )}
        </div>
      </section>
    </div>
  );
}