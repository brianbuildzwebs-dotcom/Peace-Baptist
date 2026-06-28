import React from "react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

const COMMUNITY_IMG = "https://media.base44.com/images/public/6a41a8ed40c77c0dcdea5394/46b6067d7_generated_5000933d.png";
const PASTOR_IMG = "https://media.base44.com/images/public/6a41a8ed40c77c0dcdea5394/9a12990e3_generated_590facf1.png";

export default function WelcomeSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-navy/10">
              <img src={COMMUNITY_IMG} alt="Peace Baptist Church community fellowship" className="w-full h-[400px] object-cover" />
            </div>
            {/* Pastor quote card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute -bottom-8 -right-4 sm:right-8 bg-white rounded-2xl shadow-xl p-6 max-w-xs border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={PASTOR_IMG} alt="Pastor James Mitchell" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-heading font-bold text-sm text-navy">Pastor Rudy Shepard</div>
                  <div className="text-xs text-gold">Senior Pastor</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic leading-relaxed">
                "Our doors and hearts are always open to you."
              </p>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SectionHeading
              label="Welcome Home"
              title="A Place Where You Belong"
              subtitle=""
              center={false}
            />
            <div className="space-y-5 text-gray-600 leading-relaxed">
              <p>
                Since 1975, Peace Baptist Church has been a beacon of hope and faith in Wilmington, NC.
                We are an independent, fundamental Baptist congregation devoted to the King James Bible and
                committed to sharing the love of Jesus Christ with everyone who walks through our doors.
              </p>
              <p>
                Whether you're exploring faith for the first time or looking for a church family,
                we invite you to experience the warmth, authenticity, and genuine fellowship that
                makes Peace Baptist a true spiritual home in the heart of Wilmington.
              </p>
              <p>
                Our mission is to impact Wilmington and surrounding areas positively for Jesus Christ
                through dynamic preaching, heartfelt worship, and genuine Christian fellowship.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-navy">50+</div>
                <div className="text-sm text-gold font-medium">Years of Faith</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-navy">500+</div>
                <div className="text-sm text-gold font-medium">Church Family</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-navy">15+</div>
                <div className="text-sm text-gold font-medium">Active Ministries</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}