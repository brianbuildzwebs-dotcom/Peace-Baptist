import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Search, Calendar, User, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import SectionHeading from "@/components/church/SectionHeading";
import LiveChat from "@/components/watch/LiveChat";
import SimpleStreamzPlayer from "@/components/watch/SimpleStreamzPlayer";
import { churchInfo } from "@/lib/churchInfo";

export default function WatchLive() {
  const [media, setMedia] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [liveUrl, setLiveUrl] = useState("");
  const { liveStream } = churchInfo;
  const hasStreamzPlayer = liveStream?.channelId && liveStream?.embedBase;

  useEffect(() => {
    base44.entities.MediaItem.filter({ type: "sermon" }, "-date", 20)
      .then(setMedia)
      .catch(() => {})
      .finally(() => setLoading(false));

    if (!hasStreamzPlayer) {
      base44.entities.SiteSettings.filter({ key: "live_stream_url" })
        .then((rows) => { if (rows[0]) setLiveUrl(rows[0].value); })
        .catch(() => {});
    }
  }, [hasStreamzPlayer]);

  const filtered = media.filter((m) =>
    (m.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.speaker || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.series || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative navy-gradient page-hero-offset pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Watch Live</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-4">Live Worship Services</h1>
            <p className="text-white/60 text-lg max-w-xl">Join us live every Sunday at 10:30 AM or revisit past sermons anytime.</p>
          </motion.div>
        </div>
      </section>

      {/* Live Stream Player */}
      <section className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-3">
              {hasStreamzPlayer ? (
                <div className="relative shadow-2xl">
                  <SimpleStreamzPlayer
                    channelId={liveStream.channelId}
                    embedBase={liveStream.embedBase}
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl">
                  {liveUrl ? (
                    <iframe
                      src={liveUrl}
                      title="Live Stream"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-navy-light">
                      <div className="text-center px-8">
                        <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                          <Play size={32} className="text-gold ml-1" />
                        </div>
                        <p className="text-white/60 text-sm">Live stream will appear here during services</p>
                        <p className="text-white/40 text-xs mt-2">Configure your Simple Streamz channel in site settings</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex items-center gap-4 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Next Live: Sunday 10:30 AM</span>
                </div>
              </div>
            </div>

            {/* Sidebar - Live Chat */}
            <div className="flex flex-col">
              <LiveChat />
            </div>
          </div>
        </div>
      </section>

      {/* Sermon Archive */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Sermon Library" title="Past Services" subtitle="Watch or re-watch any of our past sermons and worship services." />

          {/* Search */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sermons by title, speaker, or series..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading sermons...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No sermons found. Add sermons from the admin dashboard.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-navy/5 mb-4 shadow-sm">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy/10 to-navy/5 flex items-center justify-center">
                        <Play size={32} className="text-navy/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300">
                        <Play size={20} className="text-navy ml-0.5" />
                      </div>
                    </div>
                    {item.duration && (
                      <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">{item.duration}</span>
                    )}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-navy group-hover:text-gold transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    {item.speaker && <span>{item.speaker}</span>}
                    {item.date && <span>· {format(new Date(item.date), "MMM d, yyyy")}</span>}
                  </div>
                  {item.series && <span className="text-xs text-gold font-medium">{item.series}</span>}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}