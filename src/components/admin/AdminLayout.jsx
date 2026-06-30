import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, FileText, Heart, Play, Settings, Menu, X, LogOut, ChevronLeft, BookOpen, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Events", path: "/admin/events", icon: Calendar },
  { label: "Forms", path: "/admin/forms", icon: FileText },
  { label: "Prayer Requests", path: "/admin/prayers", icon: Heart },
  { label: "Daily Walk", path: "/admin/daily-walk", icon: BookOpen },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
  { label: "Media", path: "/admin/media", icon: Play },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0F172A] border-r border-white/5 transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center">
              <span className="text-navy font-heading font-bold">P</span>
            </div>
            <div>
              <div className="text-white font-heading font-bold text-sm">Peace Baptist</div>
              <div className="text-gold/60 text-xs">Admin Dashboard · v2026.06.30b</div>
            </div>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "bg-gold/10 text-gold"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <Link
            to="/admin/settings"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-2 ${
              isActive("/admin/settings") ? "bg-gold/10 text-gold" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings size={18} /> Settings
          </Link>
          <Link to="/" className="flex items-center gap-2 px-4 py-2.5 text-white/40 hover:text-white text-sm rounded-xl hover:bg-white/5 transition-all">
            <ChevronLeft size={16} /> Back to Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-white/40 hover:text-red-400 text-sm rounded-xl hover:bg-white/5 transition-all mt-1">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white/60">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-white font-heading font-bold text-lg">
            {navItems.find((n) => n.path === location.pathname)?.label || "Admin"}
          </h1>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}