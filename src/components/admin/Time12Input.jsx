import React from "react";
import { formatEasternTimeLabel, hour12To24 } from "@/lib/time12";

export default function Time12Input({
  hour12,
  minute,
  period,
  onHour12Change,
  onMinuteChange,
  onPeriodChange,
  className = "",
}) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={hour12}
          onChange={(e) => onHour12Change(Number(e.target.value))}
          className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h} className="bg-[#1E293B]">{h}</option>
          ))}
        </select>
        <span className="text-white/40">:</span>
        <input
          type="number"
          min={0}
          max={59}
          value={minute}
          onChange={(e) => onMinuteChange(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
          className="w-20 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm"
        />
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm"
        >
          <option value="AM" className="bg-[#1E293B]">AM</option>
          <option value="PM" className="bg-[#1E293B]">PM</option>
        </select>
      </div>
      <p className="text-white/35 text-xs mt-1.5">
        {formatEasternTimeLabel(hour12To24(hour12, period), minute)}
      </p>
    </div>
  );
}