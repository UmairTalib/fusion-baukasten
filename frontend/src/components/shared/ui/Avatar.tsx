import React from "react";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

export default function Avatar({ name, src, size = "md" }: AvatarProps) {
  const getInitials = (str: string) => {
    if (!str) return "?";
    const parts = str.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeStyles = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeStyles[size]} rounded-full object-cover border border-line`}
      />
    );
  }

  return (
    <div
      className={`${sizeStyles[size]} rounded-full bg-primary-container text-on-secondary-container font-bold flex items-center justify-center border border-primary/20 flex-shrink-0`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
