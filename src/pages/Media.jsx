import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Search, Radio, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import SectionHeading from "@/components/church/SectionHeading";
import { churchInfo } from "@/lib/churchInfo";

export default function Media() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("sermon");
  const [search, setSearch] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [sermonPlaylistUrl, setSermonPlaylistUrl] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    base44.entities.MediaItem.list("-date", 50)
      .then(setMedia)
      .catch(() => {})
      .finally(() => setLoading(false));

    base44.entities.SiteSettings.filter({ key: "sermon_playlist_url" })
      .then((rows) => {
        setSermonPlaylistUrl(rows[0]?.value || churchInfo.pastServicesPlaylist?.embedUrl || "");
      })
      .catch(() => {
        setSermonPlaylistUrl(churchInfo.pastServicesPlaylist?.embedUrl || "");
      });

  }, []);

  const speakers = [...new Set(media.filter(m => m.speaker).map(m => m.speaker))];
  const series = [...new Set(media.filter(m => m.series).map(m => m.series))];

  const filtered = media.filter((m) => {
    if (m.type !== tab) return false;
    if (search && !(m.title || "").toLowerCase().includes(search.toLowerCase()) && !(m.series || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (speaker && m.speaker !== speaker) return false;
    return true;
  });

  return (
    <div>
      {/* Hero */}
      <section className="navy-gradient page-hero-offset pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Media Library</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-4">Sermons & Worship</h1>
            <p className="text-white/60 text-lg max-w-xl">Browse our collection of sermons, worship recordings, and special messages.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
            <button onClick={() => setTab("sermon")} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${tab === "sermon" ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              <BookOpen size={16} /> Recent Services
            </button>
            <Link to="/bible-believers-broadcast" className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 hover:text-navy">
              <Radio size={16} /> Bible Believers Broadcast
            </Link>
            <button onClick={() => setTab("special")} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${tab === "special" ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              <Play size={16} /> Special Events
            </button>
          </div>

          {/* Sermon Playlist Embed */}
          {tab === "sermon" && sermonPlaylistUrl && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-lg aspect-video">
              <iframe
                src={sermonPlaylistUrl}
                title="Recent Services"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or series..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm"
              />
            </div>
            {tab === "sermon" && speakers.length > 0 && (
              <select value={speaker} onChange={(e) => setSpeaker(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold">
                <option value="">All Speakers</option>
                {speakers.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>

          {/* Video Modal */}
          {selectedVideo && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
              <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <iframe
                  src={selectedVideo}
                  title="Video Player"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  autoPlay
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading media...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Play size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No media found. Add media from the admin dashboard.</p>
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
                  onClick={() => item.video_url && setSelectedVideo(item.video_url)}
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-navy/5 mb-4">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy/10 to-gold/5 flex items-center justify-center">
                        <Play size={32} className="text-navy/20" />
                      </div>
                    )}
                    {item.video_url && (
                      <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
                          <Play size={20} className="text-navy ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-navy group-hover:text-gold transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    {item.speaker && <span>{item.speaker}</span>}
                    {item.date && <span>· {format(new Date(item.date), "MMM d, yyyy")}</span>}
                  </div>
                  {item.series && <span className="inline-block mt-2 text-xs text-gold bg-gold/10 px-3 py-1 rounded-full font-medium">{item.series}</span>}
                  {item.scripture && <p className="text-xs text-gray-400 mt-1">{item.scripture}</p>}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}