import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Car, Users, ArrowRight } from "lucide-react";
import { churchInfo } from "@/lib/churchInfo";
import SectionHeading from "./SectionHeading";

const visitTips = [
  { icon: Users, title: "Come as you are", desc: "Friendly, family-oriented worship. We'd love to meet you." },
  { icon: Clock, title: "Arrive early", desc: "Sunday School at 9:30 AM is a great way to get connected before worship." },
  { icon: Car, title: "Easy to find", desc: "Conveniently located on Military Cutoff Rd with on-site parking." },
];

export default function PlanYourVisit() {
  return (
    <section className="py-24 bg-cloud">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Plan Your Visit"
          title="We'd Love to See You Sunday"
          subtitle="Whether it's your first visit or you're looking for a church home, you'll find a warm welcome at Peace Baptist."
        />

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {visitTips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5">
                <tip.icon size={22} className="text-gold" />
              </div>
              <h3 className="font-heading text-lg font-bold text-navy mb-2">{tip.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{tip.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl navy-gradient p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-gold text-sm font-medium mb-3">
              <MapPin size={16} />
              {churchInfo.address.full}
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
              Join us this Sunday at 10:30 AM
            </h3>
            <p className="text-white/70 max-w-xl">
              Experience Christ-centered preaching, uplifting worship, and genuine fellowship in Wilmington.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <a
              href={churchInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-navy font-bold rounded-full hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
            >
              Get Directions
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-all"
            >
              Contact Us <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}