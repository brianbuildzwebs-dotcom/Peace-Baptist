import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Heart, Facebook, Youtube, Instagram } from "lucide-react";

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <footer className="bg-navy text-white">
      {/* Stay Connected */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-heading text-3xl font-bold mb-3">Stay Connected</h3>
            <p className="text-white/60 mb-8">
              Join our community and receive weekly encouragement, event updates, and sermon highlights.
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

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <span className="text-navy font-heading font-bold text-lg">P</span>
              </div>
              <div>
                <div className="font-heading font-bold text-lg">Peace Baptist</div>
                <div className="text-xs text-gold tracking-widest uppercase">Church</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              An independent Bible-believing church dedicated to glorifying Jesus Christ through heartfelt preaching and uplifting music since 1975.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-6 text-gold">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", path: "/about" },
                { label: "Watch Live", path: "/watch-live" },
                { label: "Events", path: "/events" },
                { label: "Prayer Requests", path: "/prayer-requests" },
                { label: "Give Online", path: "/give" },
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

          {/* Service Times */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-6 text-gold">Service Times</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-gold mt-1 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Sunday Morning Worship</div>
                  <div className="text-white/60 text-sm">10:30 AM</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-gold mt-1 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Sunday School</div>
                  <div className="text-white/60 text-sm">9:30 AM</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-gold mt-1 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Wednesday Bible Study</div>
                  <div className="text-white/60 text-sm">7:00 PM</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-lg mb-6 text-gold">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-1 shrink-0" />
                <span className="text-white/60 text-sm">1234 Peaceful Way<br />Springfield, IL 62701</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold shrink-0" />
                <a href="tel:+12175551234" className="text-white/60 hover:text-gold text-sm transition-colors">(217) 555-1234</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold shrink-0" />
                <a href="mailto:info@peacebaptist.net" className="text-white/60 hover:text-gold text-sm transition-colors">info@peacebaptist.net</a>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-navy transition-all">
                <Facebook size={18} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-navy transition-all">
                <Youtube size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-navy transition-all">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} Peace Baptist Church. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="text-white/40 hover:text-gold text-sm transition-colors">Privacy Policy</Link>
            <Link to="/about" className="text-white/40 hover:text-gold text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}