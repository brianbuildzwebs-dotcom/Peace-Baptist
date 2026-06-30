import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SectionHeading from "./SectionHeading";

const fallbackTestimonials = [
  { name: "Longtime Member", quote: "Peace Baptist has been our church home for years. The preaching is faithful, the people are genuine, and our children have grown up loving the Lord here.", role: "Wilmington, NC" },
  { name: "Church Family", quote: "From the moment we visited, we felt welcomed. The King James preaching strengthened our faith and this congregation became our extended family.", role: "Member" },
  { name: "Youth Parent", quote: "Pastor Shepard's preaching is powerful and biblical. The youth ministry has been a blessing for our teenagers. This church lives what it teaches.", role: "Member" },
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
    const interval = setInterval(next, 7000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const t = testimonials[current];

  return (
    <section className="py-24 sm:py-28 navy-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_top_right,_#C5A059_0%,_transparent_50%)]" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Testimonials"
          title="Voices of Faith"
          subtitle="Hear from members of our church family about their walk with Christ."
          light
        />
        <div className="relative mt-12">
          <Quote size={48} className="text-gold/20 mb-6 mx-auto sm:mx-0" />
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center sm:text-left"
            >
              <p className="text-xl sm:text-2xl font-heading italic text-white/90 leading-relaxed mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-gold text-lg">{t.name}</div>
                <div className="text-white/50 text-sm">{t.role}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center sm:justify-start gap-4 mt-10">
            <button onClick={prev} aria-label="Previous testimonial" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === current ? "bg-gold w-6" : "bg-white/30 w-2"}`}
                />
              ))}
            </div>
            <button onClick={next} aria-label="Next testimonial" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}