import React from "react";

export default function ChurchLogo({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="24" className="fill-gold" />
      <circle cx="24" cy="24" r="21" className="fill-navy" />
      <path
        d="M24 10v28M16 18h16"
        stroke="#C5A059"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="24" r="19" stroke="#C5A059" strokeWidth="0.75" strokeOpacity="0.35" />
    </svg>
  );
}