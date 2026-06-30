import React from "react";
import { motion } from "framer-motion";
import { Radio, ExternalLink } from "lucide-react";
import SectionHeading from "@/components/church/SectionHeading";
import { churchInfo } from "@/lib/churchInfo";
import { extractEmbedSrc } from "@/lib/embedUtils";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function BibleBelieversBroadcast() {
  const { bibleBelieversBroadcast } = churchInfo;
  const { get } = useSiteSettings();
  const embedUrl = extractEmbedSrc(get("bbb_player_embed")) || bibleBelieversBroadcast.embedUrl;

  return (
    <div>
      <section className="navy-gradient page-hero-offset pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Listen</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-4">
              {bibleBelieversBroadcast.title}
            </h1>
            <p className="text-white/60 text-lg max-w-xl">
              Stream Bible-based preaching and teaching anytime from our hearthis.at playlist.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Now Playing"
            title="Bible Believers Broadcast"
            center
            subtitle="Press play to listen to messages from Peace Baptist Church and fellow Bible-believing ministries."
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-cloud"
          >
            <iframe
              id="hearthis_at_user_521575"
              src={embedUrl}
              title={bibleBelieversBroadcast.title}
              width="100%"
              height="350"
              className="w-full rounded-t-2xl"
              style={{ border: 0 }}
              scrolling="no"
              allow="autoplay"
              allowTransparency
            />
            <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Radio size={16} className="text-gold" />
                <span>Streaming via hearthis.at</span>
              </div>
              <a
                href={bibleBelieversBroadcast.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-navy hover:text-gold transition-colors"
              >
                <ExternalLink size={14} />
                Open full playlist
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}