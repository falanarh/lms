"use client";
import { Bell, User2, Menu, X, LogOut, Edit, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
  onNotificationClick?: () => void;
  notificationBadge?: React.ReactNode;
  user?: { name?: string; role?: string; avatarUrl?: string; email?: string };
  onEditProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  rightAction?: React.ReactNode;
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
      return "bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700";
    case "ghost":
      return "bg-transparent text-gray-900 dark:text-gray-100";
    case "solid":
    default:
      return "bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none";
  }
}

function itemClasses(active: boolean) {
  const base = "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 font-medium whitespace-nowrap";

  if (active) {
    return `${base} bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400`;
  }
  return `${base} text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400`;
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
  brandIcon = <LogoEwarkop />,
  showNotifications = false,
  onNotificationClick,
  notificationBadge,
  user,
  onEditProfile,
  onSettings,
  onLogout,
  rightAction,
  className,
  "aria-label": ariaLabel = "Main Navigation",
}: NavbarProps) {
  const isDisabled = !!disabled || !!isLoading;
  const sz = sizeMap[size];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const dropdownElement = document.getElementById('profile-dropdown');

      if (dropdownElement && !dropdownElement.contains(target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Only show user section if user is provided
  const showUserSection = !!user;

  // Debug: Log user data
  console.log('Navbar user data:', user);

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
            <Link href={"/"} className="flex-shrink-0">
              {brandIcon || <DefaultBrandIcon />}
            </Link>
            {/* <span className="font-semibold text-lg text-gray-900 truncate">
              {brandTitle}
            </span> */}
          </div>

          {/* Desktop Menu - Centered */}
          <ul className={`hidden lg:flex items-center justify-center ${sz.gap} absolute left-1/2 -translate-x-1/2`}>
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

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />

            {showUserSection ? (
              isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
              ) : (
                <>
                  {showNotifications && (
                    <button
                      type="button"
                      className="relative size-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105 active:scale-95"
                      aria-label="Notifications"
                      disabled={isDisabled}
                      onClick={onNotificationClick}
                    >
                      <Bell size={18} />
                      {notificationBadge}
                    </button>
                  )}

                  {/* Profile Dropdown */}
                  <div
                    id="profile-dropdown"
                    className="relative"
                    onMouseEnter={() => {
                      console.log('Mouse enter profile dropdown');
                      setIsProfileDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      console.log('Mouse leave profile dropdown');
                      setIsProfileDropdownOpen(false);
                    }}
                  >
                    <button
                      onClick={() => {
                        console.log('Profile dropdown clicked, current state:', isProfileDropdownOpen);
                        setIsProfileDropdownOpen(!isProfileDropdownOpen);
                      }}
                      className="size-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105 active:scale-95"
                      aria-label="User profile"
                      aria-expanded={isProfileDropdownOpen}
                      aria-haspopup="true"
                    >
                      {user?.avatarUrl ? (
                        <Image src={user.avatarUrl} alt="" className="size-full object-cover" width={32} height={32} />
                      ) : (
                        <User2 size={20} />
                      )}
                    </button>

                    {/* Profile Dropdown */}
                    <div className={`absolute top-full right-0 mt-2 w-80 transition-all duration-200 z-50 ${
                      isProfileDropdownOpen
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible translate-y-2 pointer-events-none'
                    }`}>
                      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
                        {/* User Info Section */}
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-700">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400">
                              {user?.avatarUrl ? (
                                <Image src={user.avatarUrl} alt="" className="size-full object-cover" width={48} height={48} />
                              ) : (
                                <User2 size={24} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {user?.name && (
                                <p className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                                  {user.name}
                                </p>
                              )}
                              {user?.email && (
                                <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">
                                  {user.email}
                                </p>
                              )}
                              {user?.role && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mt-1">
                                  {user.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions Section */}
                        <div className="py-2">
                          {onEditProfile && (
                            <button
                              onClick={() => {
                                onEditProfile();
                                setIsProfileDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <Edit size={16} className="text-gray-500 dark:text-zinc-500" />
                              Edit Profile
                            </button>
                          )}
                          {onSettings && (
                            <button
                              onClick={() => {
                                onSettings();
                                setIsProfileDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <Settings size={16} className="text-gray-500 dark:text-zinc-500" />
                              Settings
                            </button>
                          )}
                          {onLogout && (
                            <div className="border-t border-gray-100 dark:border-zinc-700 mt-2 pt-2">
                              <button
                                onClick={() => {
                                  onLogout();
                                  setIsProfileDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <LogOut size={16} />
                                Logout
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            ) : (
              rightAction
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="lg:hidden size-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 active:scale-95"
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
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Close Button */}
          <div className="flex justify-between items-center">
            <ThemeToggle showLabel />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="size-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* User Section or Right Action - Only show if user exists or rightAction provided */}
          {showUserSection ? (
            !isLoading && (
              <div className="space-y-4">
                {/* User Info Card */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800">
                  <div className="size-12 rounded-full flex items-center justify-center overflow-hidden bg-white dark:bg-zinc-700 text-gray-600 dark:text-zinc-400 flex-shrink-0">
                    {user?.avatarUrl ? (
                      <Image src={user.avatarUrl} alt="" className="size-full object-cover" width={48} height={48} />
                    ) : (
                      <User2 size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {user?.name && (
                      <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100 truncate">
                        {user.name}
                      </p>
                    )}
                    {user?.email && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </p>
                    )}
                    {user?.role && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mt-1">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile User Actions */}
                <div className="space-y-2">
                  {onEditProfile && (
                    <button
                      onClick={() => {
                        onEditProfile();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                    >
                      <Edit size={16} className="text-gray-500 dark:text-zinc-500" />
                      Edit Profile
                    </button>
                  )}
                  {onSettings && (
                    <button
                      onClick={() => {
                        onSettings();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                    >
                      <Settings size={16} className="text-gray-500 dark:text-zinc-500" />
                      Settings
                    </button>
                  )}
                  {showNotifications && (
                    <button
                      onClick={() => {
                        onNotificationClick?.();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                    >
                      <Bell size={16} className="text-gray-500 dark:text-zinc-500" />
                      Notifications
                    </button>
                  )}
                  {onLogout && (
                    <div className="border-t border-gray-100 dark:border-zinc-700 pt-2">
                      <button
                        onClick={() => {
                          onLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            rightAction && <div className="flex justify-center">{rightAction}</div>
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
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
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

function LogoEwarkop() {
  return (
    <Image
      src="/logo_ewarkop.webp"
      alt="E-Warkop Logo"
      width={128}
      height={128}
      className="object-contain"
    />
  );
}