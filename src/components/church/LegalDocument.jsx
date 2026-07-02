import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LegalDocument({ label, title, updated, children }) {
  return (
    <div>
      <section className="navy-gradient page-hero-offset pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">{label}</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-3">{title}</h1>
            {updated && <p className="text-white/50 text-sm">Last updated: {updated}</p>}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-navy max-w-none text-gray-600 leading-relaxed space-y-6 text-sm sm:text-base">
            {children}
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <Link to="/privacy" className="text-gold font-medium hover:text-gold-light">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gold font-medium hover:text-gold-light">
              Terms of Use
            </Link>
            <Link to="/contact" className="text-navy/70 hover:text-gold">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}