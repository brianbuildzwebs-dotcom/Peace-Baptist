import React, { useRef, useState, useEffect } from "react";

export default function SignaturePad({ onSave, width = 400, height = 150 }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FEFCF8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#C5A059";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    setDrawing(false);
    if (hasDrawn && onSave) {
      onSave(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FEFCF8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    if (onSave) onSave(null);
  };

  return (
    <div>
      <div className="border border-gold/30 rounded-lg overflow-hidden bg-[#FEFCF8]">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">Sign above</span>
        <button type="button" onClick={clear} className="text-xs text-gold hover:text-gold-dark transition-colors">
          Clear
        </button>
      </div>
    </div>
  );
}