"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navbar, NavItem } from "./Navbar";

interface NavbarClientProps {
  items: NavItem[];
  activeKey?: string;
  user?: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
}

export default function NavbarClient({ items, user }: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine active key based on current path
  const getActiveKey = () => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/course")) return "my-course";
    if (pathname.startsWith("/forum")) return "forum";
    if (pathname.startsWith("/management")) return "management";
    return "";
  };
  
  const activeKey = getActiveKey();
  
  // Handle navigation when an item is selected
  const handleItemSelect = (key: string) => {
    switch (key) {
      case "home":
        router.push("/");
        break;
      case "my-course":
        router.push("/course");
        break;
      case "forum":
        router.push("/forum");
        break;
      case "management":
        router.push("/management");
        break;
      default:
        break;
    }
  };
  
  return (
    <Navbar
      items={items}
      activeKey={activeKey}
      onItemSelect={handleItemSelect}
      user={user}
    />
  );
}