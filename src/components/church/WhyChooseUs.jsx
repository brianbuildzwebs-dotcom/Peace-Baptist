import React from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, Heart, Sparkles } from "lucide-react";
import SectionHeading from "./SectionHeading";

const cards = [
  {
    icon: Users,
    title: "Vibrant Community",
    desc: "A welcoming church family united by faith — genuine connections rooted in Christ's love.",
  },
  {
    icon: BookOpen,
    title: "Biblical Teaching",
    desc: "Verse-by-verse preaching from the King James Bible — relevant, powerful, and unchanging.",
  },
  {
    icon: Heart,
    title: "Family Ministries",
    desc: "Programs for every age, from children's church to youth and senior fellowship.",
  },
  {
    icon: Sparkles,
    title: "Faith in Action",
    desc: "Missions, outreach, and service opportunities to live out the Gospel in Wilmington.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 sm:py-28 bg-cloud relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Why Peace Baptist"
          title="Where Faith Comes Alive"
          subtitle="Four pillars that define our church and the experience that awaits you."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
              <div className="w-14 h-14 rounded-xl bg-navy/5 flex items-center justify-center mb-6 group-hover:bg-gold/10 transition-colors">
                <card.icon size={28} className="text-gold" />
              </div>
              <h3 className="font-heading text-xl font-bold text-navy mb-3">{card.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}