"use client"

import { useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import Tabs, { TabItem } from "@/components/ui/Tabs";
import { SectionActivities } from "@/features/course/components/SectionActivities";
import { Drawer } from "@/components/ui/Drawer";
import { ActivityDrawerContent } from "@/features/course/components/ActivityDrawerContent";

export default function CoursePage() {
  const [activeTab, setActiveTab] = useState("section_activities");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const baseItems: TabItem[] = [
    { key: "section_activities", label: "Section & Aktivitas" },
    { key: "peserta", label: "Peserta", counter: 12 },
    { key: "penilaian", label: "Penilaian" },
  ];

  const panels = {
    section_activities: <SectionActivities onAddActivity={() => setIsDrawerOpen(true)} />,
    peserta: <div>Peserta Content</div>,
    penilaian: <div>Penilaian Content</div>,
  } as const;

  return (
    <div className="min-h-screen">
      {/* Container with max-width for better readability on large screens */}
        {/* Content wrapper with consistent horizontal padding */}
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
          {/* Top section with breadcrumb and header */}
          <div className="py-6 space-y-6">
            {/* Breadcrumb */}
            <div className="pt-2">
              <Breadcrumb separator="chevron" items={baseItems} />
            </div>

            {/* Page header with improved spacing */}
            <div className="space-y-2">
              <h1 className="font-bold text-3xl lg:text-4xl text-zinc-900 tracking-tight">
                Manage Course
              </h1>
              <p className="text-base text-zinc-600 leading-relaxed">
                Kelola course, peserta, dan penilaian
              </p>
            </div>
          </div>

          {/* Tabs section with proper spacing */}
          <div className="pb-8">
            <Tabs 
              items={baseItems} 
              panels={panels} 
              activeKey={activeTab} 
              onChange={setActiveTab} 
              variant="underline" 
              size="lg" 
            />
          </div>
      </div>

      {/* Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Tambah Aktivitas"
        size="xl"
        showFooter={false}
      >
        <ActivityDrawerContent onClose={() => setIsDrawerOpen(false)} />
      </Drawer>
    </div>
  );
}