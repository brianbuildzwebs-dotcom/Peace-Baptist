import React from "react";
import { motion } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import SectionHeading from "@/components/church/SectionHeading";
import SimpleStreamzPlayer from "@/components/watch/SimpleStreamzPlayer";
import { churchInfo } from "@/lib/churchInfo";
import { parseSimpleStreamzEmbed, extractEmbedSrc } from "@/lib/embedUtils";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useUnlockOrientation } from "@/hooks/useUnlockOrientation";

export default function WatchLive() {
  useUnlockOrientation();
  const { get } = useSiteSettings();
  const { data: legacyRows = [] } = useQuery({
    queryKey: ["site-setting", "live_stream_url"],
    queryFn: () => base44.entities.SiteSettings.filter({ key: "live_stream_url" }).catch(() => []),
    staleTime: 5 * 60 * 1000,
  });

  const { liveStream, pastServicesPlaylist } = churchInfo;
  const defaultLiveEmbed = `${liveStream.embedBase}/embed/c/${liveStream.channelId}`;
  const liveEmbed = get("live_player_embed") || legacyRows[0]?.value || defaultLiveEmbed;
  const streamz = parseSimpleStreamzEmbed(liveEmbed);
  const fallbackIframeSrc = !streamz ? extractEmbedSrc(liveEmbed) : "";
  const hasStreamzPlayer = streamz?.channelId && streamz?.embedBase;
  const playlistEmbed = get("sermon_playlist_url") || pastServicesPlaylist?.embedUrl;

  return (
    <div>
      <section className="relative navy-gradient page-hero-offset pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Watch Live</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-4">Live Worship Services</h1>
            <p className="text-white/60 text-lg max-w-xl">Join us live every Sunday at 10:30 AM or revisit past sermons anytime.</p>
          </motion.div>
        </div>
      </section>

      <section className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-5xl mx-auto">
            {hasStreamzPlayer ? (
              <div className="relative shadow-2xl">
                <SimpleStreamzPlayer
                  channelId={streamz.channelId}
                  embedBase={streamz.embedBase}
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video watch-player-frame shadow-2xl">
                {fallbackIframeSrc ? (
                  <iframe
                    src={fallbackIframeSrc}
                    title="Live Stream"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-navy-light">
                    <div className="text-center px-8">
                      <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                        <Play size={32} className="text-gold ml-1" />
                      </div>
                      <p className="text-white/60 text-sm">Live stream will appear here during services</p>
                      <p className="text-white/40 text-xs mt-2">Admins can update the player in Media Library</p>
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
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Sermon Library"
            title="Past Services"
            subtitle="Browse and watch recordings from our past worship services and sermons."
          />

          {playlistEmbed ? (
            <div className="max-w-5xl mx-auto">
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-video bg-black">
                <iframe
                  src={playlistEmbed}
                  title="Past Services Playlist"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              {pastServicesPlaylist?.url && (
                <div className="mt-6 text-center">
                  <a
                    href={pastServicesPlaylist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-gold transition-colors"
                  >
                    <ExternalLink size={16} />
                    Open full playlist on YouTube
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Past services playlist coming soon.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}