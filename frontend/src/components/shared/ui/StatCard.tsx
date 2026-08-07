"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trendText: string;
  trendIcon?: string;
  trendType?: "positive" | "negative" | "neutral";
}

export default function StatCard({
  title,
  value,
  icon,
  trendText,
  trendIcon,
  trendType = "neutral",
}: StatCardProps) {
  
  // Dynamic colors based on trendType (using Stitch design system colors)
  let trendColorClass = "text-[#f0a12a] bg-[#fff8ed]"; // fallback/neutral amber-ish
  
  if (trendType === "positive") {
    trendColorClass = "text-[#28a86f] bg-[#eaf7f1]"; // green
  } else if (trendType === "negative") {
    trendColorClass = "text-[#f05a5a] bg-[#ffdad6]"; // red
  } else if (trendType === "neutral") {
    trendColorClass = "text-[#f0a12a] bg-surface-container-highest"; // amber
  }

  return (
    <div className="bg-surface rounded-lg p-[18px] shadow-sm border border-line flex flex-col justify-between" style={{ boxShadow: "0 14px 36px rgba(45, 55, 95, 0.08)" }}>
      <div className="flex justify-between items-start mb-4 gap-2">
        <h3 className="text-[12px] font-extrabold text-[#2d375b] uppercase tracking-wider break-words flex-1">
          {title}
        </h3>
        <div className="w-8 h-8 rounded bg-[#f4f1ff] flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-[32px] font-bold text-on-surface mb-2">{value}</p>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${trendColorClass}`}>
          {trendIcon && <span className="material-symbols-outlined text-[12px]">{trendIcon}</span>}
          {trendText}
        </div>
      </div>
    </div>
  );
}
