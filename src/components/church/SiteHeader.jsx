import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChurchLogo from "./ChurchLogo";
import { churchInfo } from "@/lib/churchInfo";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Watch Live", path: "/watch-live" },
  { label: "Media", path: "/media" },
  { label: "Events", path: "/events" },
  { label: "Ministries", path: "/ministries" },
  { label: "Prayer", path: "/prayer-requests" },
  { label: "Contact", path: "/contact" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header
        className={`transition-all duration-500 ${
          scrolled
            ? "glass-morphism shadow-lg shadow-black/10"
            : "bg-navy/40 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
            <Link to="/" className="flex items-center gap-3 group">
              <ChurchLogo size={42} className="group-hover:scale-105 transition-transform duration-300" />
              <div>
                <span className="font-heading font-bold text-lg tracking-wide text-white block leading-tight">
                  {churchInfo.shortName}
                </span>
                <span className="hidden sm:block text-[10px] tracking-[0.2em] uppercase text-gold-light">
                  Church
                </span>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive(link.path)
                      ? "text-gold bg-white/10"
                      : "text-white/80 hover:text-gold hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/give"
                className="ml-2 px-6 py-2.5 bg-gold text-navy font-semibold text-sm rounded-full hover:bg-gold-light transition-all duration-300 shadow-lg shadow-gold/20"
              >
                Give
              </Link>
            </nav>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-0 z-40 xl:hidden"
          >
            <div className="absolute inset-0 bg-navy/95 backdrop-blur-xl" />
            <div className="relative pt-28 px-6 pb-8 h-full overflow-y-auto">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={link.path}
                      className={`block px-4 py-3.5 text-lg font-medium rounded-xl transition-all ${
                        isActive(link.path)
                          ? "text-gold bg-white/10"
                          : "text-white/80 hover:text-gold hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.04 }}
                  className="mt-4 space-y-3"
                >
                  <Link
                    to="/give"
                    className="block text-center px-6 py-4 bg-gold text-navy font-bold text-lg rounded-xl"
                  >
                    Give Online
                  </Link>
                  <a
                    href={`tel:${churchInfo.phoneTel}`}
                    className="block text-center px-6 py-3 border border-white/20 text-white/80 rounded-xl text-sm"
                  >
                    Call {churchInfo.phone}
                  </a>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}