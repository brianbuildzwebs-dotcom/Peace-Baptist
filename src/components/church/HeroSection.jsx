import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Clock, Calendar, BookOpen, Heart } from "lucide-react";
import { churchInfo } from "@/lib/churchInfo";
import { useSiteImages } from "@/hooks/useSiteImages";
import HomePromoStrip from "./HomePromoStrip";

export default function HeroSection() {
  const { getImage } = useSiteImages();

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={getImage("hero")}
          alt="Peace Baptist Church sanctuary"
          className="w-full h-full object-cover hero-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/55 to-navy/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 sm:pt-32 pb-32 lg:pb-24">
        <div className="max-w-4xl">
          <HomePromoStrip />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-gold text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              {churchInfo.tagline}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold text-white leading-[1.1] mt-8 mb-6"
          >
            A church family devoted to{" "}
            <span className="text-gold-gradient italic">God&apos;s Word</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-white/80 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10"
          >
            Independent, fundamental Baptist preaching from the King James Bible — welcoming Wilmington with Christ-centered worship since 1975.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row flex-wrap gap-4"
          >
            <Link
              to="/watch-live"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gold text-navy font-bold rounded-full hover:bg-gold-light transition-all duration-300 shadow-lg shadow-gold/30 group"
            >
              <div className="w-8 h-8 rounded-full bg-navy/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={16} className="ml-0.5" />
              </div>
              Watch Live
            </Link>
            <Link
              to="/daily-walk"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
            >
              <BookOpen size={18} />
              Daily Walk
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white/90 font-medium hover:text-gold transition-colors"
            >
              Our Story →
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl"
        >
          {[
            { icon: BookOpen, label: "Sunday School", time: "9:30 AM" },
            { icon: Clock, label: "Sunday Worship", time: "10:30 AM & 6:00 PM" },
            { icon: Calendar, label: "Wednesday Study", time: "7:00 PM" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-gold/25 transition-colors"
            >
              <item.icon size={18} className="text-gold shrink-0" />
              <div>
                <div className="text-white/55 text-xs uppercase tracking-wide">{item.label}</div>
                <div className="text-white font-semibold text-sm">{item.time}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden lg:flex gap-3"
      >
        {[
          { icon: Heart, label: "Prayer Requests", path: "/prayer-requests" },
          { icon: Calendar, label: "Events", path: "/events" },
          { icon: Play, label: "Sermons", path: "/media" },
        ].map((card) => (
          <Link
            key={card.label}
            to={card.path}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-gold/15 hover:border-gold/30 transition-all duration-500 group"
          >
            <card.icon size={18} className="text-gold group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">{card.label}</span>
          </Link>
        ))}
      </motion.div>
    </section>
  );
}