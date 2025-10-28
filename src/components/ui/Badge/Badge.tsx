import React from "react";
import { X } from "lucide-react";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  onClose?: () => void;
  className?: string;
}

function Badge({
  children,
  variant = "default",
  size = "sm",
  onClose,
  className,
  ...props
}: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    default:
      "border-transparent bg-blue-500 text-white shadow hover:bg-blue-500/80",
    secondary:
      "border-transparent bg-gray-200 text-gray-800 hover:bg-gray-200/80",
    destructive:
      "border-transparent bg-red-500 text-white shadow hover:bg-red-500/80",
    outline: "border border-gray-300 text-gray-700",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-1 inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Remove badge"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

export { Badge };
