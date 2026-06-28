import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Send, Check, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SectionHeading from "@/components/church/SectionHeading";

const categories = ["health", "spiritual", "financial", "family", "relationships", "guidance", "thanksgiving", "other"];

export default function PrayerRequests() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [category, setCategory] = useState("spiritual");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [praiseReports, setPraiseReports] = useState([]);

  useEffect(() => {
    base44.entities.PrayerRequest.filter({ status: "answered", is_public: true }, "-updated_date", 6)
      .then(setPraiseReports)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.PrayerRequest.create({
      name: isAnonymous ? "" : name,
      email: isAnonymous ? "" : email,
      request,
      category,
      is_anonymous: isAnonymous,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setName(""); setEmail(""); setRequest(""); setCategory("spiritual"); setIsAnonymous(false); setSubmitted(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="navy-gradient pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Prayer</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-4">Prayer Requests</h1>
            <p className="text-white/60 text-lg max-w-xl">Share your prayer needs. Our church family is committed to lifting you up before the Lord.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <SectionHeading label="We're Here for You" title="Submit a Prayer Request" center={false} subtitle="Your request will be shared with our prayer team. All submissions are kept confidential." />

              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-cloud rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-navy mb-2">Prayer Request Received</h3>
                  <p className="text-gray-600 mb-6">Thank you for sharing your heart with us. Our prayer team will be lifting you up in prayer.</p>
                  <button onClick={resetForm} className="px-6 py-3 bg-navy text-white rounded-xl font-medium hover:bg-navy-light transition-colors">
                    Submit Another Request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded border-gray-300 text-gold focus:ring-gold" />
                      Submit anonymously
                    </label>
                  </div>

                  {!isAnonymous && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-navy mb-1">Your Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" placeholder="Optional" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" placeholder="Optional" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Category *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm capitalize">
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Your Prayer Request *</label>
                    <textarea required rows={5} value={request} onChange={(e) => setRequest(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" placeholder="Share what's on your heart..." />
                  </div>

                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50">
                    <Send size={16} />
                    {submitting ? "Sending..." : "Submit Prayer Request"}
                  </button>
                </form>
              )}
            </div>

            {/* Praise Reports */}
            <div className="lg:col-span-2">
              <SectionHeading label="Praise Reports" title="Answered Prayers" center={false} />
              {praiseReports.length === 0 ? (
                <div className="bg-cloud rounded-2xl p-8 text-center">
                  <Heart size={32} className="text-gold/30 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Praise reports will appear here as prayers are answered.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {praiseReports.map((pr) => (
                    <div key={pr.id} className="bg-cloud rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
                        <Heart size={12} className="fill-gold" />
                        {pr.category}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{pr.request}</p>
                      {pr.name && !pr.is_anonymous && (
                        <p className="text-gray-400 text-xs mt-2">— {pr.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}