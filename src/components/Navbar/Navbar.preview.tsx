"use client";
import React from "react";
import { Navbar } from "@/components/Navbar";

export default function NavbarPreview() {
  const [active, setActive] = React.useState("my-course");
  const items = [
    { key: "home", label: "Home" },
    { key: "my-course", label: "My Course" },
    { key: "management", label: "Management" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Navbar
        variant="solid"
        size="md"
        items={items}
        activeKey={active}
        onItemSelect={setActive}
        brandTitle="E-Warkop"
        user={{ role: "Manager" }}
      />

      <Navbar
        variant="outline"
        size="sm"
        items={items}
        activeKey={active}
        onItemSelect={setActive}
        brandTitle="E-Warkop"
        user={{ role: "Manager" }}
      />

      <Navbar
        variant="ghost"
        size="lg"
        items={items}
        activeKey={active}
        onItemSelect={setActive}
        brandTitle="E-Warkop"
        user={{ role: "Manager" }}
      />

      <Navbar
        variant="solid"
        size="md"
        items={items}
        activeKey={active}
        onItemSelect={setActive}
        brandTitle="E-Warkop"
        user={{ role: "Manager" }}
        isLoading
      />

      <Navbar
        variant="solid"
        size="md"
        items={items}
        activeKey={active}
        onItemSelect={setActive}
        brandTitle="E-Warkop"
        user={{ role: "Manager" }}
        error
      />
    </div>
  );
}

