"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch/Switch";
import { ChevronLeft, Video, Link, FileText, CheckSquare, Package, Calendar, Plus, X, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import SessionCard from "./SessionCardJadwalKurikulum";
import ActivityCard from "./ActivityCard";
import { getContentQueryKey, useCreateContent } from "@/hooks/useContent";
import { Toast } from "@/components/ui/Toast/Toast";
import { queryClient } from "@/lib/queryClient";
import { getSectionQueryKey } from "@/hooks/useSections";
import { randomUUID } from "crypto";

type ActivityType = "VIDEO" | "LINK" | "PDF" | "QUIZ" | "SCORM" | "jadwal_kurikulum" | null;
type ContentSource = "new" | "curriculum" | null;

interface RestrictionState {
  prerequisiteEnabled: boolean;
  timeEnabled: boolean;
}

interface UploadedMaterial {
  id: string;
  title: string;
  size: string;
}

interface ActivityDrawerContentProps {
  onClose: () => void;
  onSave?: () => void;
  sectionId?: string; // ID section untuk membuat content baru
}

const CURRICULUM_SESSIONS = [
  {
    id: "session-1",
    title: "Sesi 1: Pengantar Next.js",
    date: "2024-08-01",
    status: "upcoming",
    topic: "Fundamental Next.JS",
    duration: "30 menit",
    instructor: "Dr. Alfian Syrff",
    description: "Pengenalan dasar tentang Next.js framework dan konsep fundamental yang perlu dipahami",
    materials: [
      { type: "pdf", title: "Next.js Fundamentals", size: "12 MB" },
      { type: "video", title: "Next.js Introduction", size: "30 MB" },
    ],
  },
  {
    id: "session-2",
    title: "Sesi 2: React Hooks & State Management",
    date: "2024-08-08",
    status: "upcoming",
    topic: "React Advanced Concepts",
    duration: "45 menit",
    instructor: "Dr. Alfian Syrff",
    description: "Mempelajari React Hooks seperti useState, useEffect, dan teknik state management modern",
    materials: [
      { type: "pdf", title: "React Hooks Guide", size: "8 MB" },
      { type: "video", title: "State Management Tutorial", size: "45 MB" },
      { type: "pdf", title: "Best Practices", size: "5 MB" },
    ],
  },
  {
    id: "session-3",
    title: "Sesi 3: API Routes & Data Fetching",
    date: "2024-08-15",
    status: "upcoming",
    topic: "Backend Integration",
    duration: "60 menit",
    instructor: "Prof. Sarah Johnson",
    description: "Implementasi API routes di Next.js dan berbagai metode fetching data (SSR, SSG, ISR)",
    materials: [
      { type: "video", title: "API Routes Demo", size: "50 MB" },
      { type: "pdf", title: "Data Fetching Patterns", size: "10 MB" },
    ],
  },
];



const ACTIVITY_OPTIONS = [
  { type: "VIDEO", label: "Video Upload", description: "Upload file video lokal", icon: Video, color: "blue" },
  { type: "LINK", label: "Link Eksternal", description: "YouTube atau e-Certificate", icon: Link, color: "orange" },
  { type: "PDF", label: "PDF / Dokumen", description: "Upload PDF, DOC, PPT", icon: FileText, color: "green" },
  { type: "QUIZ", label: "Kuis", description: "Buat kuis interaktif", icon: CheckSquare, color: "purple" },
  { type: "SCORM", label: "SCORM Package", description: "Import konten SCORM 1.2 / 2004", icon: Package, color: "amber", span: 2 },
];

const CONTENT_SOURCE_OPTIONS = [
  { value: "curriculum", label: "Jadwal Kurikulum", description: "Pilih dari jadwal kurikulum yang tersedia", icon: Calendar, color: "blue" },
  { value: "new", label: "Konten Baru", description: "Buat konten activity baru", icon: Plus, color: "green" },
];


export function ActivityDrawerContent({ onClose, onSave, sectionId }: ActivityDrawerContentProps) {
  const { mutate: createContent, isPending: isCreating } = useCreateContent({
    onSuccess: async () => {
      setShowToast(true);
      setToastMessage("Activity berhasil ditambahkan!");
      setToastVariant("success");

      // Force refetch queries immediately
      await Promise.all([
        queryClient.refetchQueries({ queryKey: getContentQueryKey() }),
        queryClient.refetchQueries({ queryKey: getSectionQueryKey() })
      ]);

      // Wait for toast to show, then close
      setTimeout(() => {
        onClose();
        if (onSave) onSave();
      }, 1500);
    },
    onError: (error: any) => {
      setShowToast(true);
      console.log(error)
      setToastMessage(error?.message || "Gagal menambahkan activity");
      setToastVariant("warning");
    },
  });
  const [contentSource, setContentSource] = useState<ContentSource>(null);
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [uploadedMaterials, setUploadedMaterials] = useState<UploadedMaterial[]>([]);
  const [uploadedScorm, setUploadedScorm] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"info" | "warning" | "success">("success");
  const [restrictionEnabled, setRestrictionEnabled] = useState(false);
  const [restrictions, setRestrictions] = useState<RestrictionState>({
    prerequisiteEnabled: false,
    timeEnabled: false,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSession, setSelectedSession] = useState<typeof CURRICULUM_SESSIONS[0] | null>(null);
  const [completionEnabled, setCompletionEnabled] = useState(false);
  const [mustOpenLink, setMustOpenLink] = useState(false);
  const [deadlineEnabled, setDeadlineEnabled] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [quizGradingEnabled, setQuizGradingEnabled] = useState(false);
  const [quizStartDate, setQuizStartDate] = useState("");
  const [quizEndDate, setQuizEndDate] = useState("");

  const handleRestrictionToggle = (type: keyof RestrictionState) => {
    setRestrictions(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSessionSelect = (session: any) => {
    setSelectedSession(session);
    setSelectedActivityType('jadwal_kurikulum');
    setTitle(session.title);
    setDescription(session.description);
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) setter(file.name);
  };

  const handleMaterialUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newMaterials = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}`,
      title: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    }));
    setUploadedMaterials(prev => [...prev, ...newMaterials]);
  };

  const handleRemoveMaterial = (id: string) => {
    setUploadedMaterials(prev => prev.filter(material => material.id !== id));
  };

  const handleSave = () => {
    // Validation
    if (!sectionId) {
      setShowToast(true);
      setToastMessage("Section ID tidak ditemukan");
      setToastVariant("warning");
      return;
    }

    if (!title.trim()) {
      setShowToast(true);
      setToastMessage("Judul activity tidak boleh kosong");
      setToastVariant("warning");
      return;
    }

    if (!selectedActivityType || selectedActivityType === "jadwal_kurikulum") {
      setShowToast(true);
      setToastMessage("Pilih tipe activity terlebih dahulu");
      setToastVariant("warning");
      return;
    }

    // Determine content_url based on activity type
    let contentUrl = "";
    if (selectedActivityType === "LINK") {
      if (!linkUrl.trim()) {
        setShowToast(true);
        setToastMessage("URL link tidak boleh kosong");
        setToastVariant("warning");
        return;
      }
      contentUrl = linkUrl;
    } else if (selectedActivityType === "VIDEO") {
      contentUrl = uploadedVideo || "";
    } else if (selectedActivityType === "PDF") {
      contentUrl = uploadedMaterials[0]?.title || "";
    } else if (selectedActivityType === "SCORM") {
      contentUrl = uploadedScorm || "";
    }

    // Prepare dates - use restriction dates or default to current + 1 year
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 1);

    const contentStart = restrictions.timeEnabled && startDate 
      ? new Date(startDate).toISOString() 
      : now.toISOString();
    
    const contentEnd = restrictions.timeEnabled && endDate 
      ? new Date(endDate).toISOString() 
      : oneYearLater.toISOString();

    // Get next sequence number (simplified - should ideally come from API)
    const sequence = 12;

    // Create content payload
    const newContent = {
      idSection: sectionId,
      type: selectedActivityType,
      contentUrl: contentUrl,
      name: title,
      description: description || "",
      contentStart: contentStart,
      contentEnd: contentEnd,
      sequence: sequence,
    };

    createContent(newContent);
  };

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <Button variant="ghost" size="sm" onClick={onClick} className="my-4">
      <ChevronLeft className="size-4 mr-2" />
      Kembali
    </Button>
  );

  const CompletionSection = () => (
    <div className="my-4 space-y-4 border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-green-600 flex items-center justify-center">
            <CheckSquare className="size-5 text-white" />
          </div>
          <div>
            <h5 className="font-medium text-green-900">Pengaturan Penyelesaian</h5>
            <p className="text-sm text-green-700">Atur kriteria kapan activity dianggap selesai</p>
          </div>
        </div>
        <Switch checked={completionEnabled} onChange={setCompletionEnabled} />
      </div>

      {completionEnabled && (
        <div className="space-y-6">
         
          {selectedActivityType === 'LINK' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h6 className="font-medium">Harus Membuka Tautan</h6>
                  <p className="text-sm text-gray-500">Peserta harus membuka link ini agar dianggap selesai</p>
                </div>
                <Switch checked={mustOpenLink} onChange={setMustOpenLink} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="font-medium">Tenggat Waktu</h6>
                <p className="text-sm text-gray-500">Tetapkan deadline penyelesaian aktivitas</p>
              </div>
              <Switch checked={deadlineEnabled} onChange={setDeadlineEnabled} />
            </div>
            {deadlineEnabled && (
              <div>
                <Label htmlFor="deadlineDate" className="block text-sm font-medium text-gray-700 my-2">Deadline</Label>
                <Input
                  id="deadlineDate"
                  type="datetime-local"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {selectedActivityType === 'QUIZ' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h6 className="font-medium">Penilaian</h6>
                    <p className="text-sm text-gray-500">Aktifkan penilaian untuk kuis ini</p>
                  </div>
                  <Switch checked={quizGradingEnabled} onChange={setQuizGradingEnabled} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quizStartDate" className="block text-sm font-medium text-gray-700 mb-2">Mulai Kuis</Label>
                  <Input
                    id="quizStartDate"
                    type="datetime-local"
                    value={quizStartDate}
                    onChange={(e) => setQuizStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quizEndDate" className="block text-sm font-medium text-gray-700 mb-2">Selesai Kuis</Label>
                  <Input
                    id="quizEndDate"
                    type="datetime-local"
                    value={quizEndDate}
                    onChange={(e) => setQuizEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const FileUploadArea = ({ 
    icon: Icon, 
    label, 
    accept, 
    description, 
    color, 
    id, 
    onChange, 
    multiple = false 
  }: any) => (
    <div>
      <Label>{label}</Label>
      <div className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-${color}-500 transition-colors`}>
        <Input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onChange}
          className="hidden"
          id={id}
        />
        <label htmlFor={id} className="cursor-pointer">
          <Icon className={`size-12 mx-auto mb-3 text-${color}-600`} />
          <p className="mb-1 text-gray-600">{description}</p>
        </label>
      </div>
    </div>
  );

  const UploadedFile = ({ icon: Icon, name, color, onRemove, badge }: any) => (
    <div className={`p-3 bg-${color}-50 border border-${color}-200 rounded-lg flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <Icon className={`size-4 text-${color}-600`} />
        <span className={`text-${color}-700`}>{name}</span>
        {badge && <Badge variant="outline" className="text-xs">{badge}</Badge>}
      </div>
      <Button size="sm" variant="ghost" onClick={onRemove}>
        <X className="size-4" />
      </Button>
    </div>
  );

  const RestrictionSection = () => (
    <div className="my-4 space-y-4 border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-600 flex items-center justify-center">
            <Lock className="size-5 text-white" />
          </div>
          <div>
            <h5 className="font-medium text-purple-900">Pembatasan Akses</h5>
            <p className="text-sm text-purple-600">Atur kapan dan bagaimana peserta dapat mengakses activity ini</p>
          </div>
        </div>
        <Switch checked={restrictionEnabled} onChange={setRestrictionEnabled} />
      </div>

      {restrictionEnabled && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            Pilih satu atau lebih pembatasan akses yang ingin diterapkan.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="font-medium">Activity Prasyarat</h6>
                <p className="text-sm text-gray-500">Peserta harus menyelesaikan activity tertentu sebelum dapat mengakses ini</p>
              </div>
              <Switch
                checked={restrictions.prerequisiteEnabled}
                onChange={() => handleRestrictionToggle('prerequisiteEnabled')}
              />
            </div>
            
            {restrictions.prerequisiteEnabled && (
              <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-600">
                Pilih activity prasyarat dari daftar course sections.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="font-medium">Pembatasan Waktu</h6>
                <p className="text-sm text-gray-500">Tentukan rentang waktu kapan activity ini dapat diakses</p>
              </div>
              <Switch
                checked={restrictions.timeEnabled}
                onChange={() => handleRestrictionToggle('timeEnabled')}
              />
            </div>
            
            {restrictions.timeEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tersedia Mulai
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tersedia Hingga
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Curriculum Selection View
  if (contentSource === 'curriculum' && !selectedActivityType) {
    return (
      <div>
        <BackButton onClick={() => setContentSource(null)} />
        <h4 className="mb-4">Pilih Sesi Kurikulum:</h4>
        <div className="space-y-3">
          {CURRICULUM_SESSIONS.map((session) => (
            <SessionCard
              key={session.id}
              onClick={() => handleSessionSelect(session)}
              title={session.title}
              date={session.date}
              status={"upcoming"}
              topic={session.topic}
              duration={session.duration}
              instructor={session.instructor}
            />
          ))}
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <Toast
              variant={toastVariant}
              message={toastMessage}
              onClose={() => setShowToast(false)}
              autoDismiss={true}
              duration={toastVariant === "success" ? 2000 : 3000}
            />
          </div>
        )}
      </div>
    );
  }

  // Activity Type Selection View
  if (contentSource === "new" && !selectedActivityType) {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => setContentSource(null)} />
        <h4 className="mb-4">Pilih jenis konten yang ingin ditambahkan:</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {ACTIVITY_OPTIONS.map(({ type, label, description, icon: Icon, color, span }) => (
            <Card
              key={type}
              className={`p-6 cursor-pointer hover:border-${color}-500 hover:shadow-lg transition-all ${span ? 'col-span-2' : ''}`}
              onClick={() => setSelectedActivityType(type as ActivityType)}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`size-16 rounded-full bg-${color}-100 flex items-center justify-center`}>
                  <Icon className={`size-8 text-${color}-600`} />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <Toast
              variant={toastVariant}
              message={toastMessage}
              onClose={() => setShowToast(false)}
              autoDismiss={true}
              duration={toastVariant === "success" ? 2000 : 3000}
            />
          </div>
        )}
      </div>
    );
  }

  // Activity Form View
  if (contentSource && selectedActivityType) {
    const showMaterialsList = selectedActivityType === 'jadwal_kurikulum' && selectedSession;

    return (
      <div className="space-y-4">
        <BackButton onClick={() => {
          setSelectedActivityType(null);
          setSelectedSession(null);
        }} />

        {selectedActivityType !== "QUIZ" && (
          <>
            <div className="mb-4">
              <Label htmlFor="activity-title">Judul Aktivitas</Label>
              <Input
                id="activity-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul aktivitas"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="activity-description">Deskripsi</Label>
              <Textarea
                id="activity-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tambahkan deskripsi singkat tentang aktivitas ini"
                className="mt-1 bg-transparent"
              />
            </div>

            <RestrictionSection />

            <CompletionSection />

            {showMaterialsList && (
              <div className="mt-6">
                <Label className="mb-3 block">Materi Pembelajaran</Label>
                <div className="space-y-2">
                  {selectedSession.materials.map((material, index) => {
                    const isVideo = material.type === 'video';
                    const isPdf = material.type === 'pdf';
                    const MaterialIcon = isVideo ? Video : FileText;
                    const colorClass = isVideo ? 'blue' : 'green';
                    
                    return (
                      // <Card key={index} className="p-4">
                      //   <div className="flex items-center justify-between">
                      //     <div className="flex items-center gap-3">
                      //       <div className={`size-10 rounded-lg bg-${colorClass}-100 flex items-center justify-center`}>
                      //         <MaterialIcon className={`size-5 text-${colorClass}-600`} />
                      //       </div>
                      //       <div>
                      //         <p className="font-medium text-sm">{material.title}</p>
                      //         <div className="flex items-center gap-2 mt-1">
                      //           <Badge variant="outline" className="text-xs">
                      //             {material.type.toUpperCase()}
                      //           </Badge>
                      //           <span className="text-xs text-gray-500">{material.size}</span>
                      //         </div>
                      //       </div>
                      //     </div>
                      //   </div>
                      // </Card>
                       <ActivityCard
                        key={index}
                        title={material.title}
                        type={"VIDEO"}
                        size={material.size}
                        showAction
                        actionLabel="Download"
                        onAction={() => {
                        // Handle view/download material
                        console.log('View material:', material);
                      }}
                    />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {selectedActivityType === "VIDEO" && (
          <>
            <FileUploadArea
              icon={Video}
              label="Upload Video"
              accept="video/*"
              description="Klik untuk upload video"
              color="blue"
              id="video-upload"
              onChange={(e: any) => handleFileUpload(e, setUploadedVideo)}
            />
            {uploadedVideo && (
              <div className="mt-3">
                <UploadedFile
                  icon={Video}
                  name={uploadedVideo}
                  color="blue"
                  onRemove={() => setUploadedVideo(null)}
                />
              </div>
            )}
          </>
        )}

        {selectedActivityType === "LINK" && (
          <div>
            <Label>Link Eksternal</Label>
            <Input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=example"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-2">
              Masukkan link YouTube atau e-Certificate
            </p>
          </div>
        )}

        {selectedActivityType === "PDF" && (
          <>
            <FileUploadArea
              icon={FileText}
              label="Upload Dokumen"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              description="Klik untuk upload dokumen"
              color="green"
              id="material-upload"
              onChange={handleMaterialUpload}
              multiple
            />
            {uploadedMaterials.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedMaterials.map(material => (
                  <UploadedFile
                    key={material.id}
                    icon={FileText}
                    name={material.title}
                    color="green"
                    badge={material.size}
                    onRemove={() => handleRemoveMaterial(material.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {selectedActivityType === "SCORM" && (
          <>
            <div>
              <Label>SCORM Package</Label>
              <p className="text-sm text-gray-500 mt-1 mb-2">
                Import konten pembelajaran dalam format SCORM 1.2 atau 2004
              </p>
            </div>
            <FileUploadArea
              icon={Package}
              label=""
              accept=".zip"
              description="Klik untuk upload SCORM Package"
              color="purple"
              id="scorm-upload"
              onChange={(e: any) => handleFileUpload(e, setUploadedScorm)}
            />
            {uploadedScorm && (
              <div className="mt-3">
                <UploadedFile
                  icon={Package}
                  name={uploadedScorm}
                  color="purple"
                  onRemove={() => setUploadedScorm(null)}
                />
              </div>
            )}
          </>
        )}

        {selectedActivityType === "QUIZ" && (
          <div>
            <Label>Quiz</Label>
            <p className="text-sm text-gray-500 mt-1">
              Buat kuis interaktif untuk menguji pemahaman peserta
            </p>

            <CompletionSection />
          </div>
        )}

        {selectedActivityType !== "QUIZ" && (
          <div className="flex justify-end gap-3 mt-8 mb-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>Batal</Button>
            <Button onClick={handleSave} disabled={isCreating}>
              {isCreating && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isCreating ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <Toast
              variant={toastVariant}
              message={toastMessage}
              onClose={() => setShowToast(false)}
              autoDismiss={true}
              duration={toastVariant === "success" ? 2000 : 3000}
            />
          </div>
        )}
      </div>
    );
  }

  // Initial Content Source Selection View
  return (
    <div className="space-y-6">
      <div className="text-center my-8">
        <h4 className="mb-2">Dari mana konten activity ini berasal?</h4>
        <p className="text-sm text-gray-500">Pilih salah satu opsi di bawah untuk melanjutkan</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {CONTENT_SOURCE_OPTIONS.map(({ value, label, description, icon: Icon, color }) => (
          <Card
            key={value}
            className={`p-6 cursor-pointer hover:border-${color}-500 hover:shadow-lg transition-all`}
            onClick={() => setContentSource(value as ContentSource)}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`size-16 rounded-full bg-${color}-100 flex items-center justify-center`}>
                <Icon className={`size-8 text-${color}-600`} />
              </div>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Toast
            variant={toastVariant}
            message={toastMessage}
            onClose={() => setShowToast(false)}
            autoDismiss={true}
            duration={toastVariant === "success" ? 2000 : 3000}
          />
        </div>
      )}
    </div>
  );
}