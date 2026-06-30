import React from "react";
import { Phone, MapPin, Clock } from "lucide-react";
import { churchInfo } from "@/lib/churchInfo";

export default function TopBar() {
  return (
    <div className="bg-navy-dark border-b border-white/10 text-white/80 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-9 sm:h-10">
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <Clock size={14} className="text-gold shrink-0" />
            <span className="truncate">
              Sunday Worship <span className="text-gold font-medium">10:30 AM</span>
              <span className="text-white/40 mx-2">|</span>
              Wednesday Bible Study <span className="text-gold font-medium">7:00 PM</span>
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1 md:flex-none md:ml-auto">
            <a
              href={churchInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 hover:text-gold transition-colors min-w-0"
            >
              <MapPin size={14} className="text-gold shrink-0" />
              <span className="truncate">{churchInfo.address.street}</span>
            </a>
            <a
              href={`tel:${churchInfo.phoneTel}`}
              className="flex items-center gap-1.5 hover:text-gold transition-colors shrink-0 ml-auto md:ml-0"
            >
              <Phone size={14} className="text-gold" />
              <span className="font-medium">{churchInfo.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}