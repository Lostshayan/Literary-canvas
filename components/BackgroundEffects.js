"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./Providers";

export default function BackgroundEffects() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const { theme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="background-effects">
      <div 
        className="cursor-glow"
        style={{
          transform: `translate(${position.x - 300}px, ${position.y - 300}px)`,
        }}
      />
      <div className="drifting-blob blob-1" />
      <div className="drifting-blob blob-2" />
      <div className="drifting-blob blob-3" />
    </div>
  );
}
