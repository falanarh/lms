"use client";
import { Bell, User2, Menu, X } from "lucide-react";
import React from "react";

export type NavbarVariant = "solid" | "outline" | "ghost";
export type NavbarSize = "sm" | "md" | "lg";

export type NavItem = {
  key: string;
  label: string;
  href?: string;
  disabled?: boolean;
};

export type NavbarProps = {
  variant?: NavbarVariant;
  size?: NavbarSize;
  disabled?: boolean;
  isLoading?: boolean;
  error?: boolean;
  items?: NavItem[];
  activeKey?: string;
  onItemSelect?: (key: string) => void;
  brandTitle?: string;
  brandIcon?: React.ReactNode;
  showNotifications?: boolean;
  user?: { name?: string; role?: string; avatarUrl?: string };
  className?: string;
  "aria-label"?: string;
};

const sizeMap: Record<NavbarSize, { container: string; item: string; gap: string; height: string }> = {
  sm: { container: "px-4 sm:px-6", item: "px-3 py-2 text-sm rounded-xl", gap: "gap-2", height: "h-14" },
  md: { container: "px-4 sm:px-6 lg:px-8", item: "px-4 py-2 text-sm rounded-xl", gap: "gap-3", height: "h-16" },
  lg: { container: "px-4 sm:px-6 lg:px-10 xl:px-14", item: "px-4 py-2.5 text-base rounded-xl", gap: "gap-4", height: "h-18" },
};

function variantContainer(variant: NavbarVariant, error?: boolean) {
  if (error) {
    return "bg-red-600 text-white border-b border-transparent";
  }

  switch (variant) {
    case "outline":
      return "bg-white text-gray-900 border-b border-gray-200";
    case "ghost":
      return "bg-transparent text-gray-900";
    case "solid":
    default:
      return "bg-white text-gray-900 border-b border-gray-200 shadow-sm";
  }
}

function itemClasses(active: boolean) {
  const base = "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 font-medium whitespace-nowrap";
  
  if (active) {
    return `${base} bg-blue-50 text-blue-600`;
  }
  return `${base} text-gray-600 hover:bg-blue-50 hover:text-blue-600`;
}

export function Navbar({
  variant = "solid",
  size = "md",
  disabled,
  isLoading,
  error,
  items = [
    { key: "home", label: "Home" },
    { key: "my-course", label: "My Course" },
    { key: "management", label: "Management" },
  ],
  activeKey = "my-course",
  onItemSelect,
  brandTitle = "E-Warkop",
  brandIcon,
  showNotifications = true,
  user = { name: "", role: "Manager", avatarUrl: "" },
  className,
  "aria-label": ariaLabel = "Main Navigation",
}: NavbarProps) {
  const isDisabled = !!disabled || !!isLoading;
  const sz = sizeMap[size];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      <nav
        role="navigation"
        aria-label={ariaLabel}
        className={`w-full sticky top-0 z-50 backdrop-blur-md ${variantContainer(variant, error)} ${isDisabled ? "opacity-60 pointer-events-none" : ""} ${className || ""}`}
      >
        <div className={`mx-auto ${sz.container} ${sz.height} flex items-center justify-between`}>
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <div className="flex-shrink-0">
              {brandIcon || <DefaultBrandIcon />}
            </div>
            <span className="font-semibold text-lg text-gray-900 truncate">
              {brandTitle}
            </span>
          </div>

          {/* Desktop Menu */}
          <ul className={`hidden lg:flex items-center justify-center ${sz.gap}`}>
            {items.map((item) => {
              const active = item.key === activeKey;
              const isItemDisabled = isDisabled || item.disabled;
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    className={`${itemClasses(active)} ${sz.item}`}
                    aria-current={active ? "page" : undefined}
                    disabled={isItemDisabled}
                    onClick={() => {
                      if (!isItemDisabled) onItemSelect?.(item.key);
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-6 w-24 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : (
              <>
                {showNotifications && (
                  <button
                    type="button"
                    className="size-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105 active:scale-95"
                    aria-label="Notifications"
                    disabled={isDisabled}
                  >
                    <Bell size={18} />
                  </button>
                )}
                <button
                  className="size-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="User profile"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <User2 size={20} />
                  )}
                </button>
                {user?.role && (
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-900">
                    {user.role}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="lg:hidden size-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-95"
            aria-label="Toggle menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="relative w-5 h-5">
              <Menu 
                size={20} 
                className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? "rotate-90 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100"}`}
              />
              <X 
                size={20} 
                className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-0"}`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 g-white/30 backdrop-invert backdrop-opacity-20 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="size-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Section */}
          {!isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50">
              <button
                className="size-12 rounded-full flex items-center justify-center overflow-hidden bg-white text-gray-600 flex-shrink-0"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  <User2 size={24} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                {user?.name && (
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {user.name}
                  </p>
                )}
                {user?.role && (
                  <p className="text-xs text-gray-600 mt-0.5">{user.role}</p>
                )}
              </div>
              {showNotifications && (
                <button
                  className="size-10 rounded-full flex items-center justify-center bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                </button>
              )}
            </div>
          )}

          {/* Menu Items */}
          <nav>
            <ul className="space-y-2">
              {items.map((item, index) => {
                const active = item.key === activeKey;
                const isItemDisabled = isDisabled || item.disabled;
                return (
                  <li 
                    key={item.key}
                    style={{ 
                      animation: `slideIn 0.3s ease-out ${index * 50}ms both`
                    }}
                  >
                    <button
                      type="button"
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium active:scale-98 ${
                        active
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                      aria-current={active ? "page" : undefined}
                      disabled={isItemDisabled}
                      onClick={() => {
                        if (!isItemDisabled) {
                          onItemSelect?.(item.key);
                          setIsMobileMenuOpen(false);
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}

function DefaultBrandIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#2563eb" />
      <path d="M10 17l4 4 8-8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}