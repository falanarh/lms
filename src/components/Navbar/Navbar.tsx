"use client";
/**
 * Komponen: Navbar
 * Tujuan: Navigasi utama aplikasi dengan brand, daftar menu, dan area aksi (notifikasi + profil).
 *
 * Ringkasan
 * - Styling: Tailwind CSS + CSS variables (fallback warna disediakan).
 * - Aksesibilitas: <nav role="navigation">, fokus ring terlihat, item menu dapat dioperasikan dengan keyboard (Tab/Enter/Space), aria-current pada item aktif.
 * - App Router kompatibel, client component.
 *
 * Import
 * ```tsx
 * import { Navbar } from "@/components/Navbar";
 * ```
 *
 * Props
 * - variant?: "solid" | "outline" | "ghost" (default: "solid")
 * - size?: "sm" | "md" | "lg" (default: "md")
 * - disabled?: boolean — menonaktifkan interaksi semua item dan aksi kanan
 * - isLoading?: boolean — menampilkan skeleton di area kanan; juga menonaktifkan item
 * - error?: boolean — mewarnai container menggunakan palet danger
 * - items?: Array<{ key: string; label: string; href?: string; disabled?: boolean }>
 * - activeKey?: string — key item yang aktif (menandai aria-current="page")
 * - onItemSelect?: (key: string) => void — callback saat item diklik/diaktifkan via keyboard
 * - brandTitle?: string — judul/teks brand (default: "E-Warkop")
 * - brandIcon?: ReactNode — ikon/marka brand kustom (default: ikon sederhana)
 * - showNotifications?: boolean — tampilkan tombol notifikasi (default: true)
 * - user?: { name?: string; role?: string; avatarUrl?: string } — tampilkan avatar dan badge role
 * - className?: string — kelas tambahan untuk <nav>
 * - aria-label?: string — label navigasi (default: "Main Navigation")
 *
 * Variants (container)
 * - solid: latar belakang solid + border bawah halus
 * - outline: border sekeliling, latar transparan
 * - ghost: transparan, tanpa border
 *
 * Size (pengaruh ke tinggi navbar, padding container, dan pill item)
 * - sm: h-12 px-4, item kecil
 * - md: h-14 px-6, item standar
 * - lg: h-16 px-8, item besar
 *
 * States & A11y
 * - focus: item memakai ring fokus variabel (var(--color-focus-ring))
 * - hover: item berubah warna latar tipis (primary-50) dan teks primary
 * - active: item ditandai (bg tint + text primary, aria-current="page")
 * - disabled: item/tombol dinonaktifkan (disabled + aria-disabled)
 * - loading: skeleton di sisi kanan, semua interaksi dimatikan
 * - error: container memakai warna danger
 *
 * CSS Variables yang digunakan (opsional, ada fallback):
 * - --navbar-bg, --navbar-text, --navbar-border — warna kontainer
 * - --navbar-item — warna teks default item
 * - --navbar-icon-bg, --navbar-icon — tombol ikon kanan
 * - --badge-bg, --badge-text — badge role user (default abu-abu kontras)
 * - --color-primary, --color-primary-hover, --color-primary-50, --color-on-primary
 * - --color-focus-ring, --color-ring-offset
 * - --color-danger, --color-danger-hover, --color-on-danger
 *
 * Contoh Penggunaan
 * ```tsx
 * // Minimal
 * <Navbar />
 *
 * // Dengan daftar item dan kontrol aktif
 * const items = [
 *   { key: "home", label: "Home" },
 *   { key: "my-course", label: "My Course" },
 *   { key: "management", label: "Management" },
 * ];
 * const [active, setActive] = useState("my-course");
 * <Navbar items={items} activeKey={active} onItemSelect={setActive} />
 *
 * // Variants & size
 * <Navbar variant="outline" size="sm" brandTitle="E-Warkop" />
 * <Navbar variant="ghost" size="lg" />
 *
 * // Disabled & Loading
 * <Navbar disabled items={items} />
 * <Navbar isLoading />
 *
 * // Error
 * <Navbar error />
 *
 * // Brand icon & user
 * <Navbar brandIcon={<MyLogo />} user={{ role: "Manager", avatarUrl: "/me.png" }} />
 *
 * // Theming via CSS variables (misal di :root atau tokens.css)
 * :root {
 *   --navbar-bg: #ffffff;
 *   --navbar-text: #111827;
 *   --navbar-border: rgba(0,0,0,0.08);
 *   --navbar-item: #6b7280;
 *   --badge-bg: #e5e7eb; (gray-200)
 *   --badge-text: #111827; (gray-900)
 *   --color-primary: #2563eb;
 *   --color-primary-50: rgba(37,99,235,0.08);
 *   --color-focus-ring: #2563eb;
 * }
 * ```
 *
 * Preview
 * - Buka route `/preview/navbar` untuk melihat seluruh varian & state.
 */

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

const sizeMap: Record<NavbarSize, { container: string; item: string; gap: string }> = {
  sm: { container: "h-12 px-4", item: "px-3 py-1.5 text-sm rounded-xl", gap: "gap-4" },
  md: { container: "h-14 px-6", item: "px-3.5 py-2 text-sm rounded-xl", gap: "gap-6" },
  lg: { container: "h-16 px-8", item: "px-4 py-2.5 text-base rounded-2xl", gap: "gap-8" },
};

function variantContainer(variant: NavbarVariant, error?: boolean) {
  if (error) {
    return [
      "bg-[var(--color-danger,#dc2626)]",
      "text-[var(--color-on-danger,#ffffff)]",
      "border border-transparent",
    ].join(" ");
  }
  switch (variant) {
    case "outline":
      return [
        "bg-[var(--navbar-bg,transparent)]",
        "text-[var(--navbar-text,inherit)]",
        "border",
        "border-[var(--navbar-border,rgba(0,0,0,0.1))]",
      ].join(" ");
    case "ghost":
      return [
        "bg-transparent",
        "text-[var(--navbar-text,inherit)]",
      ].join(" ");
    case "solid":
    default:
      return [
        "bg-[var(--navbar-bg,#ffffff)]",
        "text-[var(--navbar-text,inherit)]",
        "border-b",
        "border-[var(--navbar-border,rgba(0,0,0,0.08))]",
      ].join(" ");
  }
}

function itemClasses(active: boolean) {
  return [
    "inline-flex items-center justify-center transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ring-offset,#ffffff)]",
    active
      ? "bg-[var(--color-primary-50,rgba(37,99,235,0.08))] text-[var(--color-primary,#2563eb)]"
      : "text-[var(--navbar-item,#6b7280)] hover:bg-[var(--color-primary-50,rgba(37,99,235,0.08))] hover:text-[var(--color-primary,#2563eb)]",
  ].join(" ");
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

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className={[
        "w-full",
        variantContainer(variant, error),
        isDisabled ? "opacity-60 pointer-events-none select-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={["mx-auto flex items-center justify-between", sz.container].join(" ")}>
        {/* Left: Brand */}
        <div className="flex items-center gap-3 min-w-0">
          {brandIcon ?? <DefaultBrandIcon />}
          <span className="font-semibold text-[var(--navbar-brand,#111827)] truncate">{brandTitle}</span>
        </div>

        {/* Center: Items */}
        <ul className={["flex items-center", sz.gap].join(" ")}>
          {items.map((item) => {
            const active = item.key === activeKey;
            const isItemDisabled = isDisabled || item.disabled;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  className={[itemClasses(active), sz.item].join(" ")}
                  aria-current={active ? "page" : undefined}
                  aria-disabled={isItemDisabled || undefined}
                  disabled={isItemDisabled}
                  onClick={() => {
                    if (!isItemDisabled) onItemSelect?.(item.key);
                  }}
                >
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
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
                  className={[
                    "size-10 rounded-full flex items-center justify-center",
                    "bg-[var(--navbar-icon-bg,#f3f4f6)] text-[var(--navbar-icon,#6b7280)]",
                    "hover:bg-[var(--color-primary-50,rgba(37,99,235,0.08))] hover:text-[var(--color-primary,#2563eb)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring,#2563eb)] focus-visible:ring-offset-2",
                  ].join(" ")}
                  aria-label="Notifications"
                  disabled={isDisabled}
                >
                  <BellIcon />
                </button>
              )}

              <div className="flex items-center gap-3">
                <div className="relative size-10 rounded-full overflow-hidden bg-gray-200">
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <UserIcon />
                  )}
                </div>
                {user?.role && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-[var(--badge-bg,#e5e7eb)] text-[var(--badge-text,#111827)]">
                    {user.role}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function DefaultBrandIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="var(--color-primary,#2563eb)" />
      <path d="M10 17l4 4 8-8" stroke="var(--color-on-primary,#ffffff)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M14 19a2 2 0 1 1-4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 8a6 6 0 1 1 12 0c0 4 2 6 2 6H4s2-2 2-6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default Navbar;
