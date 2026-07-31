import React from "react";
import { FolderOpen, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface rounded-2xl border border-dashed border-line my-4">
      <div className="p-4 bg-surface-container-low text-on-surface-variant rounded-2xl mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-subheading text-on-surface font-semibold mb-1">{title}</h3>
      <p className="text-body-sm text-on-surface-variant max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary px-5 py-2.5 text-body-sm font-semibold shadow-md hover:shadow-lg transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
