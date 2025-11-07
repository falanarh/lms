"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function NavbarClient() {
  const pathname = usePathname();
  
  // Determine the active key based on the current path
  let activeKey = "home";
  if (pathname === "/course") {
    activeKey = "my-course";
  } else if (pathname === "/forum") {
    activeKey = "forum";
  } else if (pathname === "/management") {
    activeKey = "management";
  }
  
  return (
    <Navbar
      variant="solid"
      size="lg"
      items={[
        { key: "home", label: "Home" },
        { key: "my-course", label: "My Course" },
        { key: "forum", label: "Forum" },
        { key: "management", label: "Management" }
      ]}
      activeKey={activeKey}
      brandTitle="E-Warkop"
      user={{ role: "Manager" }}
    />
  );
}