import React, { useEffect } from "react";

export default function SimpleStreamzPlayer({ channelId, embedBase }) {
  const frameId = `simple-streamz-${channelId}`;
  const embedUrl = `${embedBase}/embed/c/${channelId}`;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `${embedBase}/embed-host.js?v=16`;
    script.setAttribute("data-frame", frameId);
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [embedBase, frameId]);

  return (
    <div
      className="simple-streamz-embed"
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      <iframe
        id={frameId}
        src={embedUrl}
        title="Simple Streamz Player"
        width="100%"
        style={{
          width: "100%",
          maxWidth: "100%",
          minWidth: "100%",
          aspectRatio: "16/9",
          border: 0,
          borderRadius: "12px",
          overflow: "hidden",
          display: "block",
        }}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}