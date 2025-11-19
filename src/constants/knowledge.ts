/**
 * Knowledge Center Constants
 *
 * Mengikuti rekomendasi dokumentasi refactor Knowledge Center:
 * - Satu sumber konfigurasi cache (staleTime, gcTime)
 * - Konfigurasi aplikasi (pagination, search, upload limits)
 * - Data statis seperti opsi penyelenggara
 */

import { SortOption } from '@/types/knowledge-center';
import { SORT_OPTIONS } from '@/types/knowledge-center';

// Cache times berdasarkan volatilitas data
export const CACHE_TIMES = {
  // Data subject relatif statis
  subjects: {
    staleTime: 1000 * 60 * 30, // 30 menit
    gcTime: 1000 * 60 * 60, // 1 jam
  },

  // Detail knowledge (semi statis)
  knowledgeDetail: {
    staleTime: 1000 * 60 * 15, // 15 menit
    gcTime: 1000 * 60 * 30, // 30 menit
  },

  // List knowledge (cukup dinamis)
  knowledgeList: {
    staleTime: 1000 * 60 * 5, // 5 menit
    gcTime: 1000 * 60 * 15, // 15 menit
  },

  // Hasil pencarian (real-time)
  searchResults: {
    staleTime: 1000 * 30, // 30 detik
    gcTime: 1000 * 60 * 5, // 5 menit
  },

  // Statistik / overview
  stats: {
    staleTime: 1000 * 60 * 10, // 10 menit
    gcTime: 1000 * 60 * 20, // 20 menit
  },
} as const;

// Konfigurasi aplikasi Knowledge Center
export const KNOWLEDGE_CONFIG = {
  // Pagination
  itemsPerPage: 12,
  maxItemsPerPage: 50,

  // Pencarian
  searchDebounceMs: 300,
  minSearchLength: 2,
  maxSearchLength: 100,

  // Konten
  maxTitleLength: 200,
  maxDescriptionLength: 1000,
  maxTagsCount: 10,

  // Upload gambar thumbnail
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  allowedImageExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,

  // Upload video
  maxVideoSize: 100 * 1024 * 1024, // 100MB
  allowedVideoTypes: ['video/mp4', 'video/webm'] as const,

  // Upload PDF
  maxPdfSize: 10 * 1024 * 1024, // 10MB
  allowedPdfTypes: ['application/pdf'] as const,
} as const;

// Opsi penyelenggara untuk dropdown, dibekukan agar tidak bisa dimodifikasi runtime
export const PENYELENGGARA_OPTIONS = Object.freeze([
  {
    id: 'Politeknik Statistika STIS',
    name: 'Politeknik Statistika STIS',
    description: 'Penyelenggara internal Politeknik Statistika STIS',
  },
  {
    id: 'Pusdiklat BPS',
    name: 'Pusdiklat BPS',
    description: 'Pusat Pendidikan dan Pelatihan BPS',
  },
  {
    id: 'Pusdiklat BPS RI',
    name: 'Pusdiklat BPS RI',
    description: 'Pusdiklat BPS Republik Indonesia',
  },
  {
    id: 'Badan Pusat Statistik',
    name: 'Badan Pusat Statistik',
    description: 'Badan Pusat Statistik',
  },
  {
    id: 'BPS',
    name: 'BPS',
    description: 'Singkatan umum Badan Pusat Statistik',
  },
]);

// Re-export agar konsumen bisa tetap menggunakan SortOption & SORT_OPTIONS dari satu tempat jika ingin
export type KnowledgeSortOption = SortOption;
export { SORT_OPTIONS };
