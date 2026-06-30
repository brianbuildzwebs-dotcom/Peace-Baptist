import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Users, HandHelping, BookOpen } from "lucide-react";
import { useSiteImages } from "@/hooks/useSiteImages";

const actions = [
  { icon: Heart, title: "Submit a Prayer", desc: "Share your burdens and let our community lift you up in prayer.", path: "/prayer-requests", btn: "Request Prayer" },
  { icon: Users, title: "Join a Ministry", desc: "Find your place to serve and grow alongside fellow believers.", path: "/ministries", btn: "Explore Ministries" },
  { icon: HandHelping, title: "Volunteer", desc: "Use your gifts to serve our church and the wider community.", path: "/ministries", btn: "Get Started" },
  { icon: BookOpen, title: "Attend Bible Study", desc: "Deepen your understanding of Scripture in our weekly studies.", path: "/events", btn: "Find a Group" },
];

export default function GetInvolved() {
  const { getImage } = useSiteImages();

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src={getImage("worship")} alt="Peace Baptist Church sanctuary" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/85" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold tracking-[0.25em] uppercase mb-3 text-gold">Get Involved</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Be Part of Something Greater
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            There are many ways to connect, serve, and grow at Peace Baptist Church.
          </p>
          <div className="mt-6 w-16 h-0.5 mx-auto bg-gold" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={item.path}
                className="block p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-gold/30 transition-all duration-500 text-center group h-full"
              >
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-gold/20 transition-colors">
                  <item.icon size={28} className="text-gold" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm mb-5 leading-relaxed">{item.desc}</p>
                <span className="text-gold text-sm font-semibold">{item.btn} →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}