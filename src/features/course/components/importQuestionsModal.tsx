"use client";
import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Trash2,
  Edit,
} from "lucide-react";
import {
  generateQuizTemplate,
  parseQuizExcel,
  excelRowToQuizQuestion,
  type ExcelQuestionRow,
} from "@/utils/QuestionTemplateUtils";
import type { QuizQuestion } from "./QuizQuestionsManager";

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: QuizQuestion[]) => void;
}

export function ImportQuestionsModal({
  isOpen,
  onClose,
  onImport,
}: ImportQuestionsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<ExcelQuestionRow[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "success">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<ExcelQuestionRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (selectedFile: File) => {
    // Validate file type
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.oasis.opendocument.spreadsheet", // ODS
    ];

    const fileName = selectedFile.name.toLowerCase();
    const validExtensions =
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".ods");

    if (!validTypes.includes(selectedFile.type) && !validExtensions) {
      setErrors([
        "File harus berformat Excel (.xlsx, .xls) atau LibreOffice Calc (.ods)",
      ]);
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrors(["Ukuran file maksimal 5MB"]);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setIsProcessing(true);

    // Parse Excel file
    const result = await parseQuizExcel(selectedFile);
    setIsProcessing(false);

    if (!result.success) {
      setErrors(result.errors || ["Gagal memproses file"]);
      setFile(null);
      return;
    }

    setPreview(result.data || []);
    setStep("preview");
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        await processFile(droppedFile);
      }
    },
    [processFile],
  );

  // NOW we can conditionally return after all hooks are defined
  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    generateQuizTemplate();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    await processFile(selectedFile);
  };

  const handleImport = () => {
    if (preview.length === 0) return;

    // Convert Excel rows to QuizQuestion format
    const questions = preview.map((row, index) =>
      excelRowToQuizQuestion(row, index),
    );

    onImport(questions as any);
    setStep("success");

    // Auto close after success
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setFile(null);
    setErrors([]);
    setPreview([]);
    setStep("upload");
    onClose();
  };

  const handleResetFile = () => {
    setFile(null);
    setErrors([]);
    setPreview([]);
    setStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // New functions for editing and deleting rows
  const handleEditRow = (index: number) => {
    setEditingIndex(index);
    setEditingRow({ ...preview[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingRow) {
      const updatedPreview = [...preview];
      updatedPreview[editingIndex] = editingRow;
      setPreview(updatedPreview);
      setEditingIndex(null);
      setEditingRow(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingRow(null);
  };

  const handleDeleteRow = (index: number) => {
    const updatedPreview = preview.filter((_, i) => i !== index);
    setPreview(updatedPreview);
  };

  const handleEditCell = (field: keyof ExcelQuestionRow, value: string) => {
    if (editingRow) {
      setEditingRow({
        ...editingRow,
        [field]: value,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileSpreadsheet className="size-5" />
                Import Soal dari Excel
              </h3>
              <p className="text-green-100 text-sm mt-1">
                Upload file Excel untuk menambahkan banyak soal sekaligus
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-180px)] bg-gray-50 dark:bg-zinc-900/50">
          {step === "upload" && (
            <div className="space-y-6">
              {/* Download Template Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Download className="size-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-zinc-100 mb-2">
                      Langkah 1: Download Template
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                      Download template Excel terlebih dahulu untuk memastikan
                      format yang benar. Template sudah dilengkapi dengan contoh
                      pengisian dan panduan.
                    </p>
                    <Button
                      onClick={handleDownloadTemplate}
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                    >
                      <Download className="size-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>

              {/* Upload Section with Drag and Drop */}
              <div
                className={`bg-white dark:bg-zinc-800 border-2 ${isDragging ? "border-green-400 bg-green-50 dark:bg-green-900/20" : "border-dashed border-gray-300 dark:border-zinc-600"} rounded-xl p-8 transition-colors`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 ${isDragging ? "bg-green-100 dark:bg-green-900/30" : "bg-green-50 dark:bg-green-900/20"} rounded-2xl mb-4`}
                  >
                    <Upload
                      className={`size-8 ${isDragging ? "text-green-700 dark:text-green-400" : "text-green-600 dark:text-green-500"}`}
                    />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-zinc-100 mb-2">
                    Langkah 2: Upload File Excel
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
                    {isDragging
                      ? "Lepaskan file untuk mengunggah"
                      : "Pilih file Excel yang sudah diisi sesuai template atau seret file ke sini"}
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.ods"
                    onChange={handleFileChange}
                    className="hidden"
                    id="excel-upload"
                  />
                  <Button
                    onClick={triggerFileInput}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4 mr-2" />
                        Pilih File Excel
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-4">
                    Format: .xlsx, .xls, atau .ods | Maksimal: 5MB | Maksimal:
                    100 soal
                  </p>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Terdapat {errors.length} kesalahan:
                      </h4>
                      <ul className="space-y-1">
                        {errors.map((error, index) => (
                          <li
                            key={index}
                            className="text-sm text-red-700 dark:text-red-300"
                          >
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-100 dark:bg-zinc-800 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                  <FileText className="size-5 text-gray-700 dark:text-zinc-300" />
                  Panduan Singkat
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">1.</span>
                    <span>
                      Download template Excel dengan klik tombol di atas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">2.</span>
                    <span>
                      Isi data soal sesuai contoh yang ada di template
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">3.</span>
                    <span>
                      Untuk Pilihan Ganda: Isi "Jawaban Benar" dan minimal 1
                      "Jawaban Salah"
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">4.</span>
                    <span>
                      Upload file Excel yang sudah diisi dengan cara klik tombol
                      atau seret file ke area upload
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">5.</span>
                    <span>Sistem akan memvalidasi dan menampilkan preview</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-zinc-100">
                      File Berhasil Diproses!
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                      Ditemukan{" "}
                      <span className="font-bold text-green-700 dark:text-green-300">
                        {preview.length} soal
                      </span>{" "}
                      yang valid
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Table with Edit and Delete functionality */}
              <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-700 border-b border-gray-200 dark:border-zinc-600 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-zinc-100">
                      Preview Soal
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                      Periksa dan edit data sebelum melakukan import
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-zinc-400">
                    Total: {preview.length} soal
                  </div>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">
                          No
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">
                          Tipe
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">
                          Pertanyaan
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">
                          Jawaban Benar
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">
                          Jawaban Salah 1
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">
                          Jawaban Salah 2
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">
                          Jawaban Salah 3
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-zinc-300">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-600">
                      {preview.map((row, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-zinc-600/50"
                        >
                          <td className="px-4 py-3 text-gray-900 dark:text-zinc-100">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            {editingIndex === index ? (
                              <select
                                className="w-full px-2 py-1 border rounded text-sm"
                                value={editingRow?.["Tipe Soal"] || ""}
                                onChange={(e) =>
                                  handleEditCell("Tipe Soal", e.target.value)
                                }
                              >
                                <option value="Pilihan Ganda">
                                  Pilihan Ganda
                                </option>
                                <option value="Jawaban Singkat">
                                  Jawaban Singkat
                                </option>
                                <option value="Benar/Salah">Benar/Salah</option>
                              </select>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                {row["Tipe Soal"]}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-zinc-300 max-w-md">
                            {editingIndex === index ? (
                              <textarea
                                className="w-full px-2 py-1 border rounded text-sm"
                                rows={2}
                                value={editingRow?.["Pertanyaan"] || ""}
                                onChange={(e) =>
                                  handleEditCell("Pertanyaan", e.target.value)
                                }
                              />
                            ) : (
                              <div
                                className="truncate"
                                title={row["Pertanyaan"]}
                              >
                                {row["Pertanyaan"]}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                            {editingIndex === index ? (
                              <input
                                type="text"
                                className="w-full px-2 py-1 border rounded text-sm"
                                value={editingRow?.["Jawaban Benar"] || ""}
                                onChange={(e) =>
                                  handleEditCell(
                                    "Jawaban Benar",
                                    e.target.value,
                                  )
                                }
                              />
                            ) : (
                              <div
                                className="truncate"
                                title={row["Jawaban Benar"]}
                              >
                                {row["Jawaban Benar"] || "-"}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                            {editingIndex === index ? (
                              <input
                                type="text"
                                className="w-full px-2 py-1 border rounded text-sm"
                                value={editingRow?.["Jawaban Salah 1"] || ""}
                                onChange={(e) =>
                                  handleEditCell(
                                    "Jawaban Salah 1",
                                    e.target.value,
                                  )
                                }
                              />
                            ) : (
                              <div
                                className="truncate"
                                title={row["Jawaban Salah 1"]}
                              >
                                {row["Jawaban Salah 1"] || "-"}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                            {editingIndex === index ? (
                              <input
                                type="text"
                                className="w-full px-2 py-1 border rounded text-sm"
                                value={editingRow?.["Jawaban Salah 2"] || ""}
                                onChange={(e) =>
                                  handleEditCell(
                                    "Jawaban Salah 2",
                                    e.target.value,
                                  )
                                }
                              />
                            ) : (
                              <div
                                className="truncate"
                                title={row["Jawaban Salah 2"]}
                              >
                                {row["Jawaban Salah 2"] || "-"}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-zinc-300">
                            {editingIndex === index ? (
                              <input
                                type="text"
                                className="w-full px-2 py-1 border rounded text-sm"
                                value={editingRow?.["Jawaban Salah 3"] || ""}
                                onChange={(e) =>
                                  handleEditCell(
                                    "Jawaban Salah 3",
                                    e.target.value,
                                  )
                                }
                              />
                            ) : (
                              <div
                                className="truncate"
                                title={row["Jawaban Salah 3"]}
                              >
                                {row["Jawaban Salah 3"] || "-"}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingIndex === index ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleSaveEdit}
                                  className="h-8 px-2 text-green-600 border-green-600"
                                >
                                  <CheckCircle className="size-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  className="h-8 px-2 text-gray-600 border-gray-600"
                                >
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditRow(index)}
                                  className="h-8 px-2 text-blue-600 border-blue-600"
                                  title="Edit"
                                >
                                  <Edit className="size-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteRow(index)}
                                  className="h-8 px-2 text-red-600 border-red-600"
                                  title="Hapus"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
                Import Berhasil!
              </h3>
              <p className="text-gray-600 dark:text-zinc-400 mb-6">
                {preview.length} soal telah ditambahkan ke daftar
              </p>
              <div className="animate-spin">
                <Loader2 className="size-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "success" && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 flex justify-between">
            {step === "upload" ? (
              <>
                <div></div>
                <Button variant="outline" onClick={handleClose}>
                  Tutup
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleResetFile}>
                  Upload Ulang
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose}>
                    Batal
                  </Button>
                  <Button
                    onClick={handleImport}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={preview.length === 0}
                  >
                    <CheckCircle className="size-4 mr-2" />
                    Import {preview.length} Soal
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
