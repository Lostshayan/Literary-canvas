"use client";

import { Feather } from "lucide-react";

export default function LiteraryLoader() {
  return (
    <div className="literary-loader-wrapper">
      <Feather size={36} className="animate-writing" />
      <span className="literary-loader-text">Turning pages...</span>
    </div>
  );
}
