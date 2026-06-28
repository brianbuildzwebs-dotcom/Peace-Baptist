import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, Users, Globe, Shield, Star } from "lucide-react";
import SectionHeading from "@/components/church/SectionHeading";

const PASTOR_IMG = "https://media.base44.com/images/public/6a41a8ed40c77c0dcdea5394/9a12990e3_generated_590facf1.png";
const COMMUNITY_IMG = "https://media.base44.com/images/public/6a41a8ed40c77c0dcdea5394/46b6067d7_generated_5000933d.png";
const BIBLE_IMG = "https://media.base44.com/images/public/6a41a8ed40c77c0dcdea5394/12dd4b96b_generated_ae10f41a.png";
const PEACE_IMG = "https://media.base44.com/images/public/6a41a8ed40c77c0dcdea5394/39e1a28f5_generated_721db83b.png";

const values = [
  { icon: BookOpen, title: "Biblical Authority", desc: "We believe the Bible is the inspired, inerrant Word of God and our sole authority for faith and practice." },
  { icon: Heart, title: "Grace & Love", desc: "We extend the same grace and unconditional love that Christ has shown to each of us." },
  { icon: Users, title: "Community", desc: "We foster genuine relationships built on mutual support, accountability, and fellowship." },
  { icon: Globe, title: "Missions", desc: "We actively support missionaries worldwide and engage in local community outreach." },
  { icon: Shield, title: "Integrity", desc: "We strive for transparency and honesty in every aspect of our ministry and leadership." },
  { icon: Star, title: "Excellence", desc: "We honor God by giving our best in worship, service, and every endeavor we undertake." },
];

const staff = [
  { name: "Pastor Rudy Shepard", role: "Senior Pastor", bio: "Founded Peace Baptist in 1975 and has faithfully led the congregation for 50 years. Now 77, his dedication to God and Wilmington is unwavering.", image: PASTOR_IMG },
  { name: "Sunday School", role: "9:30 AM Sunday", bio: "Bible study for all ages before the morning worship service." },
  { name: "Children's Church", role: "Master Clubs", bio: "Dedicated programs for children, nurturing their faith in a fun and engaging environment." },
  { name: "Peace Teens", role: "Youth Ministry", bio: "Active youth group helping teenagers grow in their faith and build lasting friendships." },
];

const fade = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img src={PEACE_IMG} alt="Serene lake at dawn" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 to-navy/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <motion.div {...fade}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">About Us</span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-4">Our Story & Mission</h1>
            <p className="text-white/70 text-lg mt-4 max-w-xl">Fifty years of faithfully proclaiming the Gospel and serving our community.</p>
          </motion.div>
        </div>
      </section>

      {/* History */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fade}>
              <SectionHeading label="Since 1975" title="Our History" center={false} />
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p>Peace Baptist Church was established in 1975 by Pastor Rudy Shepard as an independent, fundamental Baptist church in Wilmington, NC, devoted to the King James Bible and dynamic preaching of God's Word.</p>
                <p>What began as a small gathering of believers has grown into a vibrant congregation dedicated to serving Wilmington and the surrounding areas. Through decades of faithful ministry, we have remained committed to sound biblical teaching, heartfelt worship, and genuine Christian fellowship.</p>
                <p>Today, Peace Baptist Church continues to be a lighthouse in the Wilmington community — reaching the lost, discipling believers, and serving those in need with the love of Christ.</p>
              </div>
            </motion.div>
            <motion.div {...fade} className="grid grid-cols-2 gap-4">
              <img src={BIBLE_IMG} alt="Open Bible" className="rounded-2xl shadow-lg h-64 object-cover w-full" />
              <img src={COMMUNITY_IMG} alt="Church community" className="rounded-2xl shadow-lg h-64 object-cover w-full mt-8" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pastor */}
      <section className="py-24 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fade} className="order-2 lg:order-1">
              <img src={PASTOR_IMG} alt="Pastor James Mitchell" className="rounded-2xl shadow-2xl w-full max-w-md mx-auto object-cover" />
            </motion.div>
            <motion.div {...fade} className="order-1 lg:order-2">
              <SectionHeading label="Our Pastor" title="Pastor Rudy Shepard" center={false} />
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p>Pastor Rudy Shepard's journey with the Lord began at the tender age of 12, and by 18 he was laying the foundations of his ministry at Mt. Olive College. After graduating, he became the part-time pastor of Lanier's Chapel in Lyman, NC.</p>
                <p>In 1975, he founded Peace Baptist Church in Wilmington, NC, where he continues to lead after an incredible 50 years of faithful ministry. Now at 77 years old, he remains a devoted servant of the Lord, having witnessed countless lives transformed by the Gospel.</p>
                <p>He has had the joy of watching children he once baptized grow into adults, start families, and welcome grandchildren. His life is a testament to resilience and unwavering dedication in service to God and his congregation.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="What We Stand For" title="Our Core Values" subtitle="The biblical principles that guide everything we do as a church." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div key={v.title} {...fade} transition={{ ...fade.transition, delay: i * 0.1 }} className="p-8 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center mb-5">
                  <v.icon size={24} className="text-gold" />
                </div>
                <h3 className="font-heading text-xl font-bold text-navy mb-3">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff */}
      <section className="py-24 bg-cloud">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Our Team" title="Church Staff" subtitle="Meet the dedicated team that serves our congregation." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {staff.map((s, i) => (
              <motion.div key={s.name} {...fade} transition={{ ...fade.transition, delay: i * 0.1 }} className="text-center group">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-5 shadow-lg ring-4 ring-white">
                  {s.image ? (
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-navy/10 flex items-center justify-center">
                      <span className="text-3xl font-heading font-bold text-navy/30">{s.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-heading text-lg font-bold text-navy">{s.name}</h3>
                <p className="text-gold text-sm font-medium mb-2">{s.role}</p>
                <p className="text-gray-600 text-sm">{s.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 navy-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fade}>
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase">Our Mission</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-8">
              "To impact Wilmington and surrounding areas positively for Jesus Christ through dynamic preaching, heartfelt worship, and genuine Christian fellowship."
            </h2>
            <div className="w-16 h-0.5 bg-gold mx-auto" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}