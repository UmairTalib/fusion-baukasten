import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "positive",
  subtitle,
}: StatCardProps) {
  const trendColors = {
    positive: "text-green bg-green/10",
    negative: "text-red bg-red/10",
    neutral: "text-on-surface-variant bg-surface-container-low",
  };

  return (
    <div className="bg-surface p-5 rounded-2xl border border-line shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-body-sm font-medium text-on-surface-variant">{title}</span>
        {Icon && (
          <div className="p-2.5 bg-primary-container/10 text-primary rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-stat-value text-on-surface font-bold">{value}</span>
        {trend && (
          <span className={`text-caption-tiny px-2 py-0.5 rounded-full font-semibold ${trendColors[trendType]}`}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-caption-tiny text-on-surface-variant mt-2">{subtitle}</p>
      )}
    </div>
  );
}
