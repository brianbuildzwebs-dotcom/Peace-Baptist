import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.ContactMessage.create(form);
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="navy-gradient pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Get in Touch</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-4">Contact Us</h1>
            <p className="text-white/60 text-lg max-w-xl">We'd love to hear from you. Reach out with questions, prayer needs, or just to say hello.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">Church Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Address</h3>
                    <p className="text-gray-600 text-sm">320 Military Cutoff Rd<br />Wilmington, NC 28405</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Phone</h3>
                    <a href="tel:+19107914034" className="text-gray-600 text-sm hover:text-gold transition-colors">(910) 791-4034</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Email</h3>
                    <a href="mailto:peacebible@bellsouth.net" className="text-gray-600 text-sm hover:text-gold transition-colors">peacebible@bellsouth.net</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">Service Times</h3>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>Sunday School: 9:30 AM</p>
                      <p>Sunday Worship: 10:30 AM</p>
                      <p>Sunday Evening: 6:00 PM</p>
                      <p>Wednesday Bible Study: 7:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 h-48 bg-cloud flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} className="text-gold/30 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Map view — add Google Maps embed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-2xl font-bold text-navy mb-6">Send Us a Message</h2>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-cloud rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-navy mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for reaching out. We'll respond within 24-48 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Full Name *</label>
                      <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Email *</label>
                      <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Phone</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Subject *</label>
                      <input type="text" required value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Message *</label>
                    <textarea required rows={6} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                  </div>
                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50">
                    <Send size={16} />
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}