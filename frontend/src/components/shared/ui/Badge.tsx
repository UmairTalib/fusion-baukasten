import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "neutral";
  size?: "sm" | "md";
}

export default function Badge({
  children,
  variant = "primary",
  size = "md",
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-primary-container/15 text-primary border-primary/20",
    secondary: "bg-secondary-container/15 text-secondary border-secondary/20",
    success: "bg-green/10 text-green border-green/20",
    warning: "bg-amber/15 text-amber border-amber/30",
    error: "bg-error-container text-on-error-container border-error/20",
    neutral: "bg-surface-container-low text-on-surface-variant border-line",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-caption-tiny font-medium",
    md: "px-2.5 py-1 text-body-sm font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}
