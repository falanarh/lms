"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";

import { ChevronLeft, Video, ExternalLink, FileText, CheckSquare, Package, Calendar, Plus, Link, X, Lock } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/Switch/Switch";
import { RadioButton } from "@/components/ui/RadioButton";

type ActivityType = "video" | "link" | "pdf" | "quiz" | "scorm" | null;
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
}

export function ActivityDrawerContent({ onClose, onSave }: ActivityDrawerContentProps) {
  const [contentSource, setContentSource] = useState<ContentSource>(null);
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [uploadedMaterials, setUploadedMaterials] = useState<UploadedMaterial[]>([]);
  const [uploadedScorm, setUploadedScorm] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [restrictionEnabled, setRestrictionEnabled] = useState(false);
  const [restrictions, setRestrictions] = useState<RestrictionState>({
    prerequisiteEnabled: false,
    timeEnabled: false,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleRestrictionToggle = (type: keyof RestrictionState) => {
    setRestrictions((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSelectActivityType = (type: ActivityType) => {
    setSelectedActivityType(type);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedVideo(file.name);
    }
  };

  const handleMaterialUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newMaterials: UploadedMaterial[] = Array.from(files).map((file) => ({
        id: file.name + Date.now(),
        title: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      }));
      setUploadedMaterials((prev) => [...prev, ...newMaterials]);
    }
  };

  const handleRemoveMaterial = (id: string) => {
    setUploadedMaterials((prev) => prev.filter((material) => material.id !== id));
  };

  const handleScormUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedScorm(file.name);
    }
  };

  const activityTypeOptions = [
    { value: "video", label: "Video" },
    { value: "link", label: "Link Eksternal" },
    { value: "pdf", label: "PDF / Dokumen" },
    { value: "quiz", label: "Kuis" },
    { value: "scorm", label: "SCORM Package" },
  ];

  const restrictionOptions = [
    { value: "prerequisite", label: "Berdasarkan Activity Prasyarat" },
    { value: "time", label: "Berdasarkan Waktu" },
  ];

  if (contentSource === "new" && !selectedActivityType) {
    return (
      <div className="space-y-4">
        <div className="">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setContentSource(null)}
            className="my-4"
          >
            <ChevronLeft className="size-4 mr-2" />
            Kembali
          </Button>
        </div>

        <h4 className="mb-4">Pilih jenis konten yang ingin ditambahkan:</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
            onClick={() => handleSelectActivityType("video")}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Video className="size-8 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Video Upload</p>
                <p className="text-sm text-gray-500 mt-1">Upload file video lokal</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:border-orange-500 hover:shadow-lg transition-all"
            onClick={() => handleSelectActivityType("link")}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="size-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Link className="size-8 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Link Eksternal</p>
                <p className="text-sm text-gray-500 mt-1">YouTube atau e-Certificate</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all"
            onClick={() => handleSelectActivityType("pdf")}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="size-16 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="size-8 text-green-600" />
              </div>
              <div>
                <p className="font-medium">PDF / Dokumen</p>
                <p className="text-sm text-gray-500 mt-1">Upload PDF, DOC, PPT</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:border-purple-500 hover:shadow-lg transition-all"
            onClick={() => handleSelectActivityType("quiz")}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="size-16 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckSquare className="size-8 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Kuis</p>
                <p className="text-sm text-gray-500 mt-1">Buat kuis interaktif</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:border-amber-500 hover:shadow-lg transition-all col-span-2"
            onClick={() => handleSelectActivityType("scorm")}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Package className="size-8 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">SCORM Package</p>
                <p className="text-sm text-gray-500 mt-1">Import konten SCORM 1.2 / 2004</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (contentSource === "new" && selectedActivityType) {
    return (
      <div className="space-y-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedActivityType(null)}
            className="my-4"
          >
            <ChevronLeft className="size-4 mr-2" />
            Kembali
          </Button>
        </div>

        {/* Common form fields for all types except quiz */}
        {selectedActivityType !== "quiz" && (
          <>
            <div>
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

            {/* Restriction Section */}
            <div className="mt-8 space-y-4 border rounded-xl p-4">
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
                <Switch
                  checked={restrictionEnabled}
                  onChange={setRestrictionEnabled}
                />
              </div>

              {restrictionEnabled && (
                <div className="space-y-6">
                  <p className="text-sm text-gray-500">
                    Pilih satu atau lebih pembatasan akses yang ingin diterapkan.
                  </p>

                  {/* Prerequisite Activity Restriction */}
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
                        {/* Placeholder for prerequisite activity selection */}
                        Pilih activity prasyarat dari daftar course sections.
                      </div>
                    )}
                  </div>

                  {/* Time-based Restriction */}
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
                          <Label
                            htmlFor="startDate"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
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
                          <Label
                            htmlFor="endDate"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
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
          </>
        )}

        {selectedActivityType === "video" && (
          <div>
            <Label>Upload Video</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Video className="size-12 mx-auto mb-3 text-blue-600" />
                <p className="mb-1 text-gray-600">Klik untuk upload video</p>
                <p className="text-sm text-gray-400">MP4, AVI, MOV (max 500MB)</p>
              </label>
            </div>
            {uploadedVideo && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="size-4 text-blue-600" />
                  <span className="text-blue-700">{uploadedVideo}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setUploadedVideo(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedActivityType === "link" && (
          <div>
            <Label>Link Eksternal</Label>
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=example"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-2">
              Masukkan link YouTube atau e-Certificate
            </p>
          </div>
        )}

        {selectedActivityType === "pdf" && (
          <div>
            <Label>Upload Dokumen</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-green-500 transition-colors">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                multiple
                onChange={handleMaterialUpload}
                className="hidden"
                id="material-upload"
              />
              <label htmlFor="material-upload" className="cursor-pointer">
                <FileText className="size-12 mx-auto mb-3 text-green-600" />
                <p className="mb-1 text-gray-600">Klik untuk upload dokumen</p>
                <p className="text-sm text-gray-400">PDF, DOC, PPT (max 50MB per file)</p>
              </label>
            </div>
            {uploadedMaterials.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedMaterials.map(material => (
                  <div
                    key={material.id}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-green-600" />
                      <span className="text-green-700">{material.title}</span>
                      <Badge variant="outline" className="text-xs">{material.size}</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleRemoveMaterial(material.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedActivityType === "scorm" && (
          <div>
            <Label>SCORM Package</Label>
            <p className="text-sm text-gray-500 mt-1 mb-2">
              Import konten pembelajaran dalam format SCORM 1.2 atau 2004
            </p>
            <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <Input
                type="file"
                accept=".zip"
                onChange={handleScormUpload}
                className="hidden"
                id="scorm-upload"
              />
              <label htmlFor="scorm-upload" className="cursor-pointer">
                <Package className="size-12 mx-auto mb-3 text-purple-600" />
                <p className="mb-1 text-gray-600">Klik untuk upload SCORM Package</p>
                <p className="text-sm text-gray-400">File ZIP (SCORM 1.2 / 2004)</p>
              </label>
            </div>
            {uploadedScorm && (
              <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-purple-600" />
                  <span className="text-purple-700">{uploadedScorm}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setUploadedScorm(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedActivityType === "quiz" && (
          <div>
            <Label>Quiz</Label>
            <p className="text-sm text-gray-500 mt-1">
              Buat kuis interaktif untuk menguji pemahaman peserta
            </p>
          </div>
        )}

        {/* Action buttons */}
        {selectedActivityType !== "quiz" && (
          <div className="flex justify-end gap-3 mt-8 mb-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={onSave}>
              Simpan
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="mb-4">Pilih sumber konten activity:</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <Card
          className="p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
          onClick={() => setContentSource("curriculum")}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="size-8 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Jadwal Kurikulum</p>
              <p className="text-sm text-gray-500 mt-1">Pilih dari jadwal kurikulum yang tersedia</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all"
          onClick={() => setContentSource("new")}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="size-16 rounded-full bg-green-100 flex items-center justify-center">
              <Plus className="size-8 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Konten Baru</p>
              <p className="text-sm text-gray-500 mt-1">Buat konten activity baru</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}