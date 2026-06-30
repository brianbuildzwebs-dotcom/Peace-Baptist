import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, ArrowRight, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SectionHeading from "@/components/church/SectionHeading";
import SignaturePad from "@/components/church/SignaturePad";
import { churchInfo } from "@/lib/churchInfo";

export default function Ministries() {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMinistry, setSelectedMinistry] = useState(null);
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signature, setSignature] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.entities.Ministry.filter({ status: "active" })
      .then((data) => {
        setMinistries(data.length > 0 ? data : churchInfo.ministries || []);
      })
      .catch(() => {
        setMinistries(churchInfo.ministries || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const openSignup = async (ministry) => {
    setSelectedMinistry(ministry);
    setFormData({}); setName(""); setEmail(""); setSignature(null); setSubmitted(false);
    if (ministry.form_id) {
      const f = await base44.entities.CustomForm.get(ministry.form_id).catch(() => null);
      setForm(f);
    } else {
      setForm(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.FormSubmission.create({
      form_id: selectedMinistry.form_id || "ministry_signup",
      form_title: `${selectedMinistry.name} Sign-Up`,
      data: { ...formData, name, email, ministry: selectedMinistry.name },
      submitter_name: name,
      submitter_email: email,
      signature_url: signature || undefined,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div>
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img src={churchInfo.images.worship} alt="Peace Baptist Church sanctuary" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 to-navy/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-hero-offset">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Serve & Grow</span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4">Our Ministries</h1>
            <p className="text-white/70 text-lg mt-4 max-w-xl">Find your place to serve, connect, and grow in faith.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading ministries...</div>
          ) : ministries.length === 0 ? (
            <div className="text-center py-16">
              <Users size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">Ministries coming soon! Add ministries from the admin dashboard.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {ministries.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
                >
                  {m.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img src={m.image_url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-heading text-xl font-bold text-navy mb-2">{m.name}</h3>
                    {m.leader && <p className="text-gold text-sm font-medium mb-2">Led by {m.leader}</p>}
                    {m.meeting_time && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                        <Clock size={14} />{m.meeting_time}
                      </div>
                    )}
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">{m.description}</p>
                    <button
                      onClick={() => openSignup(m)}
                      className="w-full py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      Sign Up <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sign-up Modal */}
      <AnimatePresence>
        {selectedMinistry && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedMinistry(null)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-2xl font-bold text-navy">Join {selectedMinistry.name}</h2>
                  <button onClick={() => setSelectedMinistry(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
                </div>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-navy mb-2">Welcome Aboard!</h3>
                    <p className="text-gray-600">Thank you for joining {selectedMinistry.name}. We'll be in touch soon!</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Full Name *</label>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Email *</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                    </div>
                    {form?.fields?.map((field, i) => (
                      <div key={i}>
                        <label className="block text-sm font-medium text-navy mb-1">{field.label} {field.required && "*"}</label>
                        {field.type === "textarea" ? (
                          <textarea required={field.required} value={formData[field.label] || ""} onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                        ) : field.type === "select" ? (
                          <select required={field.required} value={formData[field.label] || ""} onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm">
                            <option value="">Select...</option>
                            {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : field.type === "signature" ? (
                          <SignaturePad onSave={setSignature} />
                        ) : (
                          <input type={field.type || "text"} required={field.required} value={formData[field.label] || ""} onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                        )}
                      </div>
                    ))}
                    <button type="submit" disabled={submitting} className="w-full py-3.5 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50">
                      {submitting ? "Submitting..." : "Complete Sign-Up"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}