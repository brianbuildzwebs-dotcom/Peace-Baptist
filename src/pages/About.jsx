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
  { name: "Pastor James Mitchell", role: "Senior Pastor", bio: "Leading Peace Baptist since 2005 with a heart for expository preaching and pastoral care.", image: PASTOR_IMG },
  { name: "Rev. Sarah Williams", role: "Associate Pastor", bio: "Overseeing family ministries and women's fellowship with passion and dedication." },
  { name: "Michael Torres", role: "Worship Director", bio: "Leading our congregation in heartfelt praise and worship for over a decade." },
  { name: "Angela Davis", role: "Youth Pastor", bio: "Empowering the next generation with biblical truth and authentic mentorship." },
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
                <p>Peace Baptist Church was founded in 1975 by a small group of believers who shared a vision for an independent, Bible-believing church where the Word of God would be faithfully proclaimed and every person would be warmly welcomed.</p>
                <p>What began as a humble gathering of twenty families in a rented school gymnasium has grown into a vibrant congregation of over 500 members. Through the decades, we have remained steadfast in our commitment to verse-by-verse expository preaching, heartfelt worship, and genuine community.</p>
                <p>Today, Peace Baptist Church continues to be a lighthouse in our community — reaching the lost, discipling believers, and serving those in need with the love of Christ.</p>
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
              <SectionHeading label="Our Pastor" title="Pastor James Mitchell" center={false} />
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p>Pastor James Mitchell has faithfully served as the Senior Pastor of Peace Baptist Church since 2005. A graduate of Southeastern Baptist Theological Seminary, he holds a Master of Divinity and a Doctor of Ministry in Biblical Studies.</p>
                <p>Known for his warm pastoral heart and his commitment to expository preaching, Pastor Mitchell leads our congregation with wisdom, humility, and a deep love for the Word of God. Under his leadership, the church has experienced tremendous growth in both numbers and spiritual depth.</p>
                <p>He and his wife, Grace, have been married for 28 years and have three adult children. In his free time, he enjoys reading, fishing, and mentoring young pastors.</p>
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
              "To glorify God by making disciples of Jesus Christ through the faithful proclamation of His Word, authentic worship, and compassionate service to all people."
            </h2>
            <div className="w-16 h-0.5 bg-gold mx-auto" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}