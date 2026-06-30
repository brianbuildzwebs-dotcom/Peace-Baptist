import React from "react";
import { churchInfo } from "@/lib/churchInfo";

const DEFAULT_SPLASH = churchInfo.images.splash;

export default function AppSplashMark({
  src = DEFAULT_SPLASH,
  size = 112,
  showSpinner = true,
  className = "",
}) {
  return (
    <div className={`text-center ${className}`}>
      <img
        src={src || DEFAULT_SPLASH}
        alt=""
        width={size}
        height={size}
        className="mx-auto mb-5 object-cover bg-navy border border-gold/25 shadow-xl rounded-2xl"
        style={{ width: size, height: size }}
      />
      {showSpinner && (
        <div className="w-8 h-8 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
      )}
    </div>
  );
}