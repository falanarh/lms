"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import Tabs, { TabItem } from "@/components/ui/Tabs";
import { SectionActivities } from "@/features/course/components/SectionActivities";
import { BankContent } from "@/features/course/components/BankContent";
import { Drawer } from "@/components/ui/Drawer";
import { ActivityDrawerContent } from "@/features/course/components/ActivityDrawerContent";
import { Content } from "@/api/contents";
import { queryClient } from "@/lib/queryClient";

export default function ManageCoursePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("section_activities");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");

  const baseItems: TabItem[] = [
    { key: "section_activities", label: "Section & Aktivitas" },
    { key: "bank_content", label: "Bank Content" },
    { key: "peserta", label: "Peserta", counter: 12 },
    { key: "penilaian", label: "Penilaian" },
    
  ];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");

  // ✅ State untuk data yang akan diedit
  const [currentSectionId, setCurrentSectionId] = useState<string | undefined>(
    undefined,
  );
  const [currentContentId, setCurrentContentId] = useState<string | undefined>(
    undefined,
  );
  const [currentContentData, setCurrentContentData] = useState<
    Content | undefined
  >(undefined);

  
  // ✅ Handler saat klik "Tambah Activity"
  const handleAddActivity = (sectionId: string) => {
    console.log("🟢 ADD Activity triggered for section:", sectionId);
    setDrawerMode("create");
    setCurrentSectionId(sectionId);
    setCurrentContentId(undefined);
    setCurrentContentData(undefined);
    setIsDrawerOpen(true);
  };

  // ✅ Handler saat klik tombol "Edit" pada activity
  const handleEditActivity = (
    sectionId: string,
    activityId: string,
    activityData: Content,
  ) => {
    // console.log("🟡 EDIT Activity triggered:", { sectionId, activityId, activityData });
    setDrawerMode("edit");
    setCurrentSectionId(sectionId);
    setCurrentContentId(activityId);
    setCurrentContentData(activityData);
    setIsDrawerOpen(true);
  };

  // ✅ Handler saat klik "Kelola Soal" pada quiz activity
  const handleManageQuizQuestions = (
    sectionId: string,
    activityId: string,
    activityData: Content,
  ) => {
    console.log("🟣 MANAGE QUIZ QUESTIONS triggered:", { sectionId, activityId, activityData });
    // Navigate to dedicated quiz management page
    router.push(`/course/manage/quiz/${activityId}`);
  };

  // ✅ Handler saat drawer ditutup
  const handleDrawerClose = () => {
    console.log("🔴 CLOSE Drawer");
    setIsDrawerOpen(false);
    // Reset state setelah animasi close selesai
    setTimeout(() => {
      setCurrentSectionId(undefined);
      setCurrentContentId(undefined);
      setCurrentContentData(undefined);
      setDrawerMode("create");
      // Refetch contents to ensure new activities are loaded
      queryClient.refetchQueries({ queryKey: ["contents"] });
    }, 300);
  };

  // ✅ Handler setelah save berhasil
  const handleSaveSuccess = () => {
    console.log("✅ Activity saved successfully!");
    // Refetch contents to ensure new activities are loaded for drag & drop
    queryClient.refetchQueries({ queryKey: ["contents"] });
  };

  const panels = {
    section_activities: (
      <SectionActivities
        onAddActivity={handleAddActivity}
        onEditActivity={handleEditActivity}
        onManageQuizQuestions={handleManageQuizQuestions}
      />
    ),
    bank_content:
      <BankContent />,
  
    peserta: <div>Peserta Content</div>,
    penilaian: <div>Penilaian Content</div>,
  } as const;

  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="py-6 space-y-6">
          <div className="pt-2 hidden md:block">
            <Breadcrumb separator="chevron" items={baseItems} />
          </div>

          <div className="pt-2 block md:hidden">
            <Breadcrumb separator="slash" items={baseItems} size="sm" />
          </div>

          <div className="space-y-2">
            <h1 className="font-bold text-3xl lg:text-4xl text-zinc-900 dark:text-zinc-100 tracking-tight">
              Manage Course
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Kelola course, peserta, dan penilaian
            </p>
          </div>
        </div>

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

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        title={drawerMode === "edit" ? "Edit Activity" : "Tambah Activity Baru"}
        size="lg"
        showFooter={false}
      >
        <ActivityDrawerContent
          onClose={handleDrawerClose}
          onSave={handleSaveSuccess}
          sectionId={currentSectionId}
          contentId={currentContentId}
          initialData={currentContentData}
        />
      </Drawer>
    </div>
  );
}
