import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar, MapPin, Clock, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import SignaturePad from "./SignaturePad";

export default function EventRSVPPanel({ event, onClose }) {
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signature, setSignature] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (event.form_id) {
      base44.entities.CustomForm.get(event.form_id).then(setForm).catch(() => {});
    }
  }, [event.form_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const submission = {
      form_id: event.form_id || "default_rsvp",
      form_title: form?.title || "Event RSVP",
      event_id: event.id,
      submitter_name: name,
      submitter_email: email,
      data: { ...formData, name, email },
    };
    if (signature) submission.signature_url = signature;
    await base44.entities.FormSubmission.create(submission);
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 overflow-y-auto shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold text-navy">RSVP</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Event info */}
          <div className="bg-cloud rounded-xl p-4 mb-6">
            <h3 className="font-heading font-bold text-navy mb-2">{event.title}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              {event.date && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gold" />
                  {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gold" />
                  {event.time}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gold" />
                  {event.location}
                </div>
              )}
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-navy mb-2">You're Registered!</h3>
              <p className="text-gray-600">Thank you for your RSVP. We look forward to seeing you!</p>
              <button onClick={onClose} className="mt-6 px-6 py-3 bg-navy text-white rounded-xl font-medium hover:bg-navy-light transition-colors">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Full Name *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Email Address *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
              </div>

              {/* Custom form fields */}
              {form?.fields?.map((field, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-navy mb-1">
                    {field.label} {field.required && "*"}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      required={field.required}
                      value={formData[field.label] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm"
                    />
                  ) : field.type === "select" ? (
                    <select
                      required={field.required}
                      value={formData[field.label] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={formData[field.label] || false}
                        onChange={(e) => setFormData({ ...formData, [field.label]: e.target.checked })}
                        className="rounded border-gray-300 text-gold focus:ring-gold"
                      />
                      {field.placeholder || field.label}
                    </label>
                  ) : field.type === "signature" ? (
                    <SignaturePad onSave={setSignature} />
                  ) : (
                    <input
                      type={field.type || "text"}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.label] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm"
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Confirm RSVP"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </>
  );
}