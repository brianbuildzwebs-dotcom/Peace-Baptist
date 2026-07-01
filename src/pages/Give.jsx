import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, DollarSign, Check, Gift, Users, Globe, Home } from "lucide-react";
import { base44 } from "@/api/base44Client";

const funds = [
  { value: "general", label: "General Fund", icon: Home, desc: "Supports overall ministry operations" },
  { value: "missions", label: "Missions", icon: Globe, desc: "Support missionaries worldwide" },
  { value: "building", label: "Building Fund", icon: Home, desc: "Facility improvements and maintenance" },
  { value: "youth", label: "Youth Ministry", icon: Users, desc: "Programs for the next generation" },
  { value: "benevolence", label: "Benevolence", icon: Heart, desc: "Helping those in need" },
];

const amounts = [25, 50, 100, 250, 500];

export default function Give() {
  const [step, setStep] = useState(1);
  const [fund, setFund] = useState("general");
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState("one-time");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const finalAmount = customAmount || amount;

  const handleSubmit = async () => {
    if (!finalAmount) return;
    setSubmitting(true);
    setError("");
    try {
      await base44.entities.GivingRecord.create({
        donor_name: name,
        donor_email: email,
        amount: parseFloat(finalAmount),
        fund,
        notes: frequency === "monthly" ? "Recurring preference: monthly" : "One-time gift",
        _hp: "",
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Could not record your gift. Please try again or contact the church office.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="navy-gradient page-hero-offset pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Stewardship</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-4 mb-4">Give Online</h1>
            <p className="text-white/60 text-lg max-w-xl">Your generous giving makes a lasting impact on lives and our community.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-green-600" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-navy mb-3">Thank You!</h2>
              <p className="text-gray-600 text-lg mb-2">Your generous gift of ${finalAmount} to the {funds.find(f => f.value === fund)?.label} has been recorded.</p>
              <p className="text-gray-500 text-sm mb-8">A confirmation will be sent to your email. Connect a payment provider for live transaction processing.</p>
              <button onClick={() => { setSubmitted(false); setStep(1); setAmount(""); setCustomAmount(""); }} className="px-6 py-3 bg-navy text-white rounded-xl font-medium">
                Give Again
              </button>
            </motion.div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-4 mb-12">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? "bg-gold text-navy" : "bg-gray-200 text-gray-500"}`}>{s}</div>
                    {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-gold" : "bg-gray-200"}`} />}
                  </React.Fragment>
                ))}
              </div>

              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="font-heading text-2xl font-bold text-navy mb-2 text-center">I want to support</h2>
                  <p className="text-gray-500 text-center mb-8">Choose where your gift will make the most impact.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {funds.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => { setFund(f.value); setStep(2); }}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${fund === f.value ? "border-gold bg-gold/5" : "border-gray-100 hover:border-gold/30"}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center shrink-0">
                          <f.icon size={20} className="text-gold" />
                        </div>
                        <div>
                          <div className="font-semibold text-navy">{f.label}</div>
                          <div className="text-sm text-gray-500">{f.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="font-heading text-2xl font-bold text-navy mb-2 text-center">with a gift of</h2>
                  <p className="text-gray-500 text-center mb-8">Select an amount or enter a custom amount.</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                    {amounts.map((a) => (
                      <button
                        key={a}
                        onClick={() => { setAmount(String(a)); setCustomAmount(""); }}
                        className={`py-4 rounded-xl font-bold text-lg border-2 transition-all ${String(a) === amount ? "border-gold bg-gold text-navy" : "border-gray-200 text-navy hover:border-gold/50"}`}
                      >
                        ${a}
                      </button>
                    ))}
                  </div>
                  <div className="relative mb-8">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
                      className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-gold outline-none text-lg font-medium"
                    />
                  </div>
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-navy mb-3">Giving Frequency</label>
                    <div className="flex gap-3">
                      {["one-time", "weekly", "monthly"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFrequency(f)}
                          className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm capitalize transition-all ${frequency === f ? "border-gold bg-gold/10 text-navy" : "border-gray-200 text-gray-600 hover:border-gold/30"}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">Back</button>
                    <button onClick={() => { if (finalAmount) setStep(3); }} disabled={!finalAmount} className="flex-1 py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light disabled:opacity-50 transition-colors">Continue</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="font-heading text-2xl font-bold text-navy mb-2 text-center">Your Information</h2>
                  <p className="text-gray-500 text-center mb-8">Optional — for your giving receipt.</p>
                  <div className="bg-cloud rounded-2xl p-5 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Gift to {funds.find(f => f.value === fund)?.label}</span>
                      <span className="font-bold text-navy text-lg">${finalAmount}</span>
                    </div>
                    <div className="text-xs text-gold capitalize mt-1">{frequency}</div>
                  </div>
                  <div className="space-y-4 mb-8">
                    <input type="text" placeholder="Full Name (optional)" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                    <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                  </div>
                  <p className="text-xs text-gray-400 mb-6 text-center">
                    Connect Stripe or PayPal in your dashboard to process real transactions. This form records your giving intention.
                  </p>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50">Back</button>
                    {error && (
                      <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{error}</p>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 py-3.5 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      <Gift size={16} className="inline mr-2" />{submitting ? "Saving..." : "Complete Gift"}
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Impact Stories */}
      <section className="py-20 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Your Impact</span>
            <h2 className="font-heading text-3xl font-bold text-navy mt-3">Where Your Gifts Go</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { pct: "45%", label: "Ministry & Worship", desc: "Staff, worship team, and Sunday services" },
              { pct: "25%", label: "Missions & Outreach", desc: "Local and international mission work" },
              { pct: "30%", label: "Operations & Growth", desc: "Facilities, programs, and community care" },
            ].map((item) => (
              <div key={item.label} className="text-center p-8 bg-white rounded-2xl shadow-sm">
                <div className="text-4xl font-heading font-bold text-gold mb-2">{item.pct}</div>
                <h3 className="font-heading text-lg font-bold text-navy mb-2">{item.label}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}