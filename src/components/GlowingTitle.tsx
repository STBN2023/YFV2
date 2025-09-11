"use client";

import React from "react";

const GlowingTitle: React.FC = () => {
  return (
    <h1 className="glow-title text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-fuchsia-500 via-amber-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
      Youri Fortune
      <span className="neon-v2 ml-2 align-middle">V2</span>
    </h1>
  );
};

export default GlowingTitle;