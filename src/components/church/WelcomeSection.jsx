import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { churchInfo } from "@/lib/churchInfo";
import { useSiteImages } from "@/hooks/useSiteImages";

const COMMUNITY_IMG = "https://media.base44.com/images/public/6a41a8ed40c77c0dcdea5394/46b6067d7_generated_5000933d.png";
const PASTOR_IMG = "https://media.base44.com/images/public/6a41a8ed40c77c0dcdea5394/f4b111e89_Rudy-Shepard.webp";

const stats = [
  { value: "50+", label: "Years of Ministry" },
  { value: "KJV", label: "Bible Preaching" },
  { value: "1975", label: "Founded" },
];

export default function WelcomeSection() {
  const { getImage } = useSiteImages();

  return (
    <section className="py-24 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-gold/20 to-transparent -z-10" />
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-navy/10 ring-1 ring-black/5">
              <img src={getImage("welcome")} alt="Peace Baptist Church building with cross" className="w-full h-[420px] object-cover" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute -bottom-8 -right-2 sm:right-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs border border-gold/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={getImage("pastor")} alt={churchInfo.pastor} className="w-12 h-12 rounded-full object-cover ring-2 ring-gold/30" />
                <div>
                  <div className="font-heading font-bold text-sm text-navy">{churchInfo.pastor}</div>
                  <div className="text-xs text-gold">Senior Pastor</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic leading-relaxed">
                &ldquo;Our doors and hearts are always open to you.&rdquo;
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SectionHeading
              label="Welcome Home"
              title="A Place Where You Belong"
              center={false}
            />
            <div className="space-y-5 text-gray-600 leading-relaxed">
              <p>
                Since 1975, Peace Baptist Church has been a beacon of hope and faith in Wilmington, NC.
                We are an independent, fundamental Baptist congregation devoted to the King James Bible,
                committed to sharing the love of Jesus Christ with everyone who walks through our doors.
              </p>
              <p>
                Whether you&apos;re exploring faith for the first time or searching for a church family,
                we invite you to experience the warmth, authenticity, and fellowship that makes Peace Baptist home.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-2xl bg-cloud border border-gray-100"
                >
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-navy">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gold font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 mt-8 text-navy font-semibold hover:text-gold transition-colors"
            >
              Read our story →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}