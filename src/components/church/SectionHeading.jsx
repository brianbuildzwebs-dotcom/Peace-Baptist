import React from "react";
import { motion } from "framer-motion";

export default function SectionHeading({ label, title, subtitle, light = false, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className={`${center ? "text-center" : ""} mb-12`}
    >
      {label && (
        <span className={`inline-block text-xs font-bold tracking-[0.25em] uppercase mb-3 ${light ? "text-gold-light" : "text-gold"}`}>
          {label}
        </span>
      )}
      <h2 className={`font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${light ? "text-white" : "text-navy"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`max-w-2xl ${center ? "mx-auto" : ""} text-lg ${light ? "text-white/70" : "text-gray-600"}`}>
          {subtitle}
        </p>
      )}
      <div className={`mt-6 w-16 h-0.5 ${center ? "mx-auto" : ""} bg-gold`} />
    </motion.div>
  );
}