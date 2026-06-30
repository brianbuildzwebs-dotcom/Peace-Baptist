import React from "react";
import { motion } from "framer-motion";
import { churchInfo } from "@/lib/churchInfo";

export default function ScriptureBanner() {
  const { scripture } = churchInfo;

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 navy-gradient" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#C5A059_0%,_transparent_65%)]" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">King James Bible</span>
          <blockquote className="font-heading text-xl sm:text-2xl lg:text-3xl text-white/90 italic leading-relaxed mt-6 mb-6">
            &ldquo;{scripture.text}&rdquo;
          </blockquote>
          <cite className="text-gold-light text-sm sm:text-base not-italic font-medium tracking-wide">
            — {scripture.reference}
          </cite>
        </motion.div>
      </div>
    </section>
  );
}