import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Clock, Calendar, BookOpen, Heart } from "lucide-react";

const HERO_IMG = "https://media.base44.com/images/public/6a41a8ed40c77c0dcdea5394/643f6b9e7_generated_13528674.png";

export default function HeroSection() {
  return (
    <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={HERO_IMG} alt="Peace Baptist Church sanctuary with golden morning light" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-gold text-xs font-bold tracking-[0.3em] uppercase mb-6">
              Welcome to Peace Baptist Church
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8"
          >
            Join us in worship{" "}
            <span className="text-gold-gradient italic">& fellowship</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/80 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10"
          >
            As we glorify Jesus Christ through heartfelt preaching and uplifting music.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
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
              to="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300"
            >
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* Service Times Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl"
        >
          {[
            { icon: Clock, label: "Sunday Worship", time: "10:30 AM" },
            { icon: BookOpen, label: "Sunday School", time: "9:30 AM" },
            { icon: Calendar, label: "Wed Bible Study", time: "7:00 PM" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <item.icon size={18} className="text-gold shrink-0" />
              <div>
                <div className="text-white/60 text-xs">{item.label}</div>
                <div className="text-white font-semibold text-sm">{item.time}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Quick Nav Cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex gap-4"
      >
        {[
          { icon: Heart, label: "Prayer Requests", path: "/prayer-requests" },
          { icon: Calendar, label: "Upcoming Events", path: "/events" },
          { icon: Play, label: "Sermons & Media", path: "/media" },
        ].map((card) => (
          <Link
            key={card.label}
            to={card.path}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-gold/20 hover:border-gold/30 transition-all duration-500 group"
          >
            <card.icon size={20} className="text-gold group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">{card.label}</span>
          </Link>
        ))}
      </motion.div>
    </section>
  );
}