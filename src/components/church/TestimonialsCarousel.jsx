import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SectionHeading from "./SectionHeading";

const fallbackTestimonials = [
  { name: "Sarah Johnson", quote: "Peace Baptist changed our family's life. The warmth and authenticity of this congregation is unlike anything we've experienced. We truly found our spiritual home.", role: "Member since 2018" },
  { name: "David & Lisa Chen", quote: "From the moment we walked in, we felt welcomed. The biblical teaching has strengthened our faith and the community has become our extended family.", role: "Members since 2020" },
  { name: "Marcus Williams", quote: "Pastor Shepard's preaching is powerful and convicting. The youth ministry has been transformative for my teenagers. This church walks the talk.", role: "Member since 2015" },
];

export default function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    base44.entities.Testimonial.filter({ featured: true })
      .then((data) => { if (data.length > 0) setTestimonials(data); })
      .catch(() => {});
  }, []);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const t = testimonials[current];

  return (
    <section className="py-24 navy-gradient text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Testimonials"
          title="Voices of Faith"
          subtitle="Hear from members of our church family about their journey with Christ."
          light
        />
        <div className="relative mt-12">
          <Quote size={48} className="text-gold/20 mb-6" />
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-xl sm:text-2xl font-heading italic text-white/90 leading-relaxed mb-8">
                "{t.quote}"
              </p>
              <div>
                <div className="font-semibold text-gold text-lg">{t.name}</div>
                <div className="text-white/50 text-sm">{t.role}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={prev} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-gold w-6" : "bg-white/30"}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}