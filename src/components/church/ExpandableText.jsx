import React, { useState } from "react";

const TRUNCATE_CHARS = 140;

export default function ExpandableText({
  text,
  className = "",
  clampClass = "line-clamp-2",
  moreLabel = "Read more",
  lessLabel = "Show less",
}) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const needsTruncate = text.length > TRUNCATE_CHARS || text.includes("\n");

  if (!needsTruncate) {
    return <p className={`whitespace-pre-wrap ${className}`}>{text}</p>;
  }

  return (
    <div>
      <p className={`whitespace-pre-wrap ${className} ${expanded ? "" : clampClass}`}>{text}</p>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="text-gold text-sm font-medium mt-1 hover:underline"
      >
        {expanded ? lessLabel : moreLabel}
      </button>
    </div>
  );
}