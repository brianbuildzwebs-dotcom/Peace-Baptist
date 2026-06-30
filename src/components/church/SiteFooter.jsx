import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Heart, Facebook, Youtube } from "lucide-react";
import ChurchLogo from "./ChurchLogo";
import { churchInfo } from "@/lib/churchInfo";

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  const socialLinks = [
    { icon: Facebook, href: churchInfo.social.facebook, label: "Facebook" },
    { icon: Youtube, href: churchInfo.social.youtube, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="bg-navy text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-heading text-3xl font-bold mb-3">Stay Connected</h3>
            <p className="text-white/60 mb-8">
              Get encouragement, service reminders, and updates from Peace Baptist Church.
            </p>
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-gold">
                <Heart size={20} className="fill-gold" />
                <span className="font-medium">Thank you for connecting with us!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-gold text-navy font-semibold rounded-full hover:bg-gold-light transition-all"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ChurchLogo size={40} />
              <div>
                <div className="font-heading font-bold text-lg">{churchInfo.shortName}</div>
                <div className="text-xs text-gold tracking-widest uppercase">Church</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              An independent, fundamental Baptist church in Wilmington, NC — devoted to the King James Bible and dynamic preaching since 1975.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-lg mb-6 text-gold">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", path: "/about" },
                { label: "Watch Live", path: "/watch-live" },
                { label: "Daily Walk", path: "/daily-walk" },
                { label: "Events", path: "/events" },
                { label: "Prayer Requests", path: "/prayer-requests" },
                ...(churchInfo.showGiving ? [{ label: "Give Online", path: "/give" }] : []),
                { label: "Contact Us", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/60 hover:text-gold transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-lg mb-6 text-gold">Service Times</h4>
            <ul className="space-y-4">
              {churchInfo.serviceTimes.map((service) => (
                <li key={service.label} className="flex items-start gap-3">
                  <Clock size={16} className="text-gold mt-1 shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{service.label}</div>
                    <div className="text-white/60 text-sm">{service.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-lg mb-6 text-gold">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-1 shrink-0" />
                <a
                  href={churchInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-gold text-sm transition-colors"
                >
                  {churchInfo.address.street}<br />{churchInfo.address.city}, {churchInfo.address.state} {churchInfo.address.zip}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold shrink-0" />
                <a href={`tel:${churchInfo.phoneTel}`} className="text-white/60 hover:text-gold text-sm transition-colors">
                  {churchInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold shrink-0" />
                <a href={`mailto:${churchInfo.email}`} className="text-white/60 hover:text-gold text-sm transition-colors">
                  {churchInfo.email}
                </a>
              </li>
            </ul>
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-navy transition-all"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} {churchInfo.name}. All rights reserved.</p>
          <p className="text-white/30 text-xs">320 Military Cutoff Rd · Wilmington, NC</p>
        </div>
      </div>
    </footer>
  );
}