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
  Loader2
} from "lucide-react";
import { 
  generateQuizTemplate, 
  parseQuizExcel, 
  excelRowToQuizQuestion,
  type ExcelQuestionRow 
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
  onImport 
}: ImportQuestionsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<ExcelQuestionRow[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    generateQuizTemplate();
  };

  const processFile = async (selectedFile: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet', // ODS
    ];
    
    const fileName = selectedFile.name.toLowerCase();
    const validExtensions = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.ods');
    
    if (!validTypes.includes(selectedFile.type) && !validExtensions) {
      setErrors(['File harus berformat Excel (.xlsx, .xls) atau LibreOffice Calc (.ods)']);
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrors(['Ukuran file maksimal 5MB']);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setIsProcessing(true);

    // Parse Excel file
    const result = await parseQuizExcel(selectedFile);
    setIsProcessing(false);

    if (!result.success) {
      setErrors(result.errors || ['Gagal memproses file']);
      setFile(null);
      return;
    }

    setPreview(result.data || []);
    setStep('preview');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    await processFile(selectedFile);
  };

  // Drag and drop handlers
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

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      await processFile(droppedFile);
    }
  }, []);

  const handleImport = () => {
    if (preview.length === 0) return;

    // Convert Excel rows to QuizQuestion format
    const questions = preview.map((row, index) => 
      excelRowToQuizQuestion(row, index)
    );

    onImport(questions);
    setStep('success');

    // Auto close after success
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setFile(null);
    setErrors([]);
    setPreview([]);
    setStep('upload');
    onClose();
  };

  const handleResetFile = () => {
    setFile(null);
    setErrors([]);
    setPreview([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
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
        <div className="p-6 overflow-auto max-h-[calc(90vh-180px)] bg-gray-50">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Download Template Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Download className="size-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Langkah 1: Download Template
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Download template Excel terlebih dahulu untuk memastikan format yang benar.
                      Template sudah dilengkapi dengan contoh pengisian dan panduan.
                    </p>
                    <Button
                      onClick={handleDownloadTemplate}
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-blue-50 border-blue-300"
                    >
                      <Download className="size-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>

              {/* Upload Section with Drag and Drop */}
              <div 
                className={`bg-white border-2 ${isDragging ? 'border-green-400 bg-green-50' : 'border-dashed border-gray-300'} rounded-xl p-8 transition-colors`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${isDragging ? 'bg-green-100' : 'bg-green-50'} rounded-2xl mb-4`}>
                    <Upload className={`size-8 ${isDragging ? 'text-green-700' : 'text-green-600'}`} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    Langkah 2: Upload File Excel
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    {isDragging ? 'Lepaskan file untuk mengunggah' : 'Pilih file Excel yang sudah diisi sesuai template atau seret file ke sini'}
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

                  <p className="text-xs text-gray-500 mt-4">
                    Format: .xlsx, .xls, atau .ods | Maksimal: 5MB | Maksimal: 100 soal
                  </p>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-2">
                        Terdapat {errors.length} kesalahan:
                      </h4>
                      <ul className="space-y-1">
                        {errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-100 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="size-5" />
                  Panduan Singkat
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">1.</span>
                    <span>Download template Excel dengan klik tombol di atas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">2.</span>
                    <span>Isi data soal sesuai contoh yang ada di template</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">3.</span>
                    <span>Jangan ubah nama kolom atau hapus kolom yang ada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">4.</span>
                    <span>Upload file Excel yang sudah diisi dengan cara klik tombol atau seret file ke area upload</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">5.</span>
                    <span>Sistem akan memvalidasi dan menampilkan preview</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-8 text-green-600" />
                  <div>
                    <h4 className="font-bold text-gray-900">
                      File Berhasil Diproses!
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Ditemukan <span className="font-bold text-green-700">{preview.length} soal</span> yang valid
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-bold text-gray-900">Preview Soal</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Periksa data sebelum melakukan import
                  </p>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipe</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Pertanyaan</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Jawaban</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {preview.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                              {row['Tipe Soal']}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 max-w-md truncate">
                            {row['Pertanyaan']}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {row['Jawaban Benar'] || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="size-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Import Berhasil!
              </h3>
              <p className="text-gray-600 mb-6">
                {preview.length} soal telah ditambahkan ke daftar
              </p>
              <div className="animate-spin">
                <Loader2 className="size-6 text-green-600" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
            {step === 'upload' ? (
              <>
                <div></div>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                >
                  Tutup
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleResetFile}
                >
                  Upload Ulang
                </Button>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleClose}
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleImport}
                    className="bg-green-600 hover:bg-green-700"
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