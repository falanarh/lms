"use client"
import { FileText } from "lucide-react";

export function ActivityForm() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipe Aktivitas
        </label>
        <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Pilih tipe aktivitas</option>
          <option>Video</option>
          <option>Dokumen</option>
          <option>Quiz</option>
          <option>Assignment</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul Aktivitas
        </label>
        <input
          type="text"
          placeholder="Masukkan judul aktivitas"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          rows={4}
          placeholder="Masukkan deskripsi aktivitas"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Durasi (menit)
        </label>
        <input
          type="number"
          placeholder="30"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload File
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            Klik untuk upload atau drag & drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, DOC, MP4 (Max. 100MB)
          </p>
        </div>
      </div>
    </div>
  );
}