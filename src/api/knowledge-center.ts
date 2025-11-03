/**
 * Knowledge Center API
 *
 * This file contains all API functions for the Knowledge Center feature.
 * Following the API → Hooks → UI pattern from coding principles.
 */

import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';
import {
  Knowledge,
  KnowledgeListResponse,
  KnowledgeDetailResponse,
  KnowledgeQueryParams,
  CreateKnowledgeFormData,
  Subject,
  Penyelenggara,
  Tag,
  KnowledgeAnalytics,
  WebinarSchedule,
  KnowledgeCenterSettings,
} from '@/types/knowledge-center';

// Configure axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-lms-kappa.vercel.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling helper
const handleApiError = (error: any, fallbackMessage: string) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  if (error.message) {
    throw new Error(error.message);
  }
  throw new Error(fallbackMessage);
};

// Knowledge CRUD operations
export const knowledgeApi = {
  // Get all knowledge items with filters and pagination
  async getKnowledge(params: KnowledgeQueryParams = {}): Promise<KnowledgeListResponse> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getKnowledge with params:', params);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate dummy knowledge data
    const dummyKnowledge: Knowledge[] = [
      {
        id: '1',
        title: 'Pengenalan Statistik Ekonomi Indonesia',
        description: 'Webinar dasar pengenalan konsep statistik ekonomi yang digunakan oleh BPS untuk mengukur pertumbuhan ekonomi nasional.',
        subject: 'Ekonomi',
        knowledge_type: 'webinar',
        penyelenggara: 'Pusdiklat BPS',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop',
        author: 'Dr. Ahmad Wijaya',
        like_count: 45,
        dislike_count: 2,
        view_count: 1234,
        tags: ['statistik', 'ekonomi', 'dasar'],
        published_at: '2024-11-01T10:00:00Z',
        status: 'published',
        created_at: '2024-11-01T09:30:00Z',
        updated_at: '2024-11-01T09:30:00Z',
        tgl_zoom: '2024-11-15T10:00:00Z',
        link_zoom: 'https://zoom.us/j/123456789',
        link_record: 'https://youtube.com/watch?v=example1',
        link_youtube: 'https://youtube.com/watch?v=example1',
        link_vb: 'https://videobuilder.com/example1',
        file_notulensi_pdf: 'https://example.com/notulensi1.pdf',
        content_richtext: '<p>Konten webinar tentang statistik ekonomi...</p>',
        jumlah_jp: 8,
        gojags_ref: 'GOJAGS-2024-001'
      },
      {
        id: '2',
        title: 'Teknik Sampling dalam Survei Kependudukan',
        description: 'Panduan lengkap teknik sampling yang digunakan dalam survei kependudukan BPS, mencakup probability sampling dan non-probability sampling.',
        subject: 'Demografi',
        knowledge_type: 'konten',
        penyelenggara: 'BPS Sumatera Barat',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6af6b8037f7c?w=800&h=450&fit=crop',
        author: 'Ir. Siti Nurhaliza',
        like_count: 32,
        dislike_count: 1,
        view_count: 892,
        tags: ['sampling', 'survei', 'kependudukan'],
        published_at: '2024-10-28T14:00:00Z',
        status: 'published',
        created_at: '2024-10-28T13:30:00Z',
        updated_at: '2024-10-28T13:30:00Z',
        media_resource: 'https://example.com/video2.mp4',
        media_type: 'video',
        content_richtext: '<p>Panduan lengkap teknik sampling...</p>'
      },
      {
        id: '3',
        title: 'Analisis Indeks Harga Konsumen (IHK)',
        description: 'Podcast membahas metodologi perhitungan IHK, interpretasi data, dan dampaknya terhadap kebijakan moneter.',
        subject: 'Ekonomi',
        knowledge_type: 'konten',
        penyelenggara: 'Pusdiklat BPS',
        thumbnail: 'https://images.unsplash.com/photo-1590602827861-800964f4b2b1?w=800&h=450&fit=crop',
        author: 'Prof. Budi Santoso',
        like_count: 28,
        dislike_count: 3,
        view_count: 654,
        tags: ['IHK', 'inflasi', 'harga konsumen'],
        published_at: '2024-10-25T09:00:00Z',
        status: 'published',
        created_at: '2024-10-25T08:30:00Z',
        updated_at: '2024-10-25T08:30:00Z',
        media_resource: 'https://example.com/podcast3.mp3',
        media_type: 'audio',
        content_richtext: '<p>Podcast analisis IHK...</p>'
      },
      {
        id: '4',
        title: 'Panduan Pengisian Survei Sosial Ekonomi (Susenas)',
        description: 'Modul pelatihan lengkap untuk petugas lapangan dalam melakukan pengisian kuesioner Susenas dengan standar BPS.',
        subject: 'Sosial',
        knowledge_type: 'konten',
        penyelenggara: 'BPS Jawa Tengah',
        thumbnail: 'https://images.unsplash.com/photo-1565079973934-7155e6d4b7d8?w=800&h=450&fit=crop',
        author: 'Drs. Ratna Sari',
        like_count: 56,
        dislike_count: 4,
        view_count: 1567,
        tags: ['susenas', 'survei sosial', 'pelatihan'],
        published_at: '2024-10-20T11:00:00Z',
        status: 'published',
        created_at: '2024-10-20T10:30:00Z',
        updated_at: '2024-10-20T10:30:00Z',
        media_resource: 'https://example.com/modul4.pdf',
        media_type: 'pdf',
        content_richtext: '<p>Panduan lengkap pengisian Susenas...</p>'
      },
      {
        id: '5',
        title: 'Big Data dan Machine Learning di Statistik Modern',
        description: 'Webinar mendalam tentang penerapan big data dan machine learning dalam analisis statistik modern di era digital.',
        subject: 'Teknologi',
        knowledge_type: 'webinar',
        penyelenggara: 'Pusdiklat BPS',
        thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop',
        author: 'Dr. Andi Pratama',
        like_count: 89,
        dislike_count: 5,
        view_count: 2341,
        tags: ['big data', 'machine learning', 'teknologi'],
        published_at: '2024-11-05T13:00:00Z',
        status: 'published',
        created_at: '2024-11-05T12:30:00Z',
        updated_at: '2024-11-05T12:30:00Z',
        tgl_zoom: '2024-11-20T13:00:00Z',
        link_zoom: 'https://zoom.us/j/987654321',
        link_record: 'https://youtube.com/watch?v=example5',
        link_youtube: 'https://youtube.com/watch?v=example5',
        content_richtext: '<p>Webinar tentang big data dan ML...</p>',
        jumlah_jp: 12,
        gojags_ref: 'GOJAGS-2024-005'
      }
    ];

    // Apply filters to dummy data
    let filteredData = dummyKnowledge;

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (params.subject?.length) {
      filteredData = filteredData.filter(item => params.subject!.includes(item.subject));
    }

    if (params.penyelenggara?.length) {
      filteredData = filteredData.filter(item => params.penyelenggara!.includes(item.penyelenggara));
    }

    if (params.knowledge_type?.length) {
      filteredData = filteredData.filter(item => params.knowledge_type!.includes(item.knowledge_type));
    }

    if (params.media_type?.length) {
      filteredData = filteredData.filter(item => {
        if (item.knowledge_type === 'konten') {
          return params.media_type!.includes((item as any).media_type);
        }
        return true;
      });
    }

    if (params.tags?.length) {
      filteredData = filteredData.filter(item =>
        params.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    if (params.sort) {
      switch (params.sort) {
        case 'newest':
          filteredData.sort((a, b) => new Date(b.published_at || b.created_at || '').getTime() - new Date(a.published_at || a.created_at || '').getTime());
          break;
        case 'most_liked':
          filteredData.sort((a, b) => b.like_count - a.like_count);
          break;
        case 'most_viewed':
          filteredData.sort((a, b) => b.view_count - a.view_count);
          break;
        case 'upcoming_webinar':
          filteredData.sort((a, b) => {
            if (a.knowledge_type === 'webinar' && b.knowledge_type !== 'webinar') return -1;
            if (a.knowledge_type !== 'webinar' && b.knowledge_type === 'webinar') return 1;
            return 0;
          });
          break;
      }
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filteredData.length,
      page: page,
      limit: limit,
      total_pages: Math.ceil(filteredData.length / limit)
    };
  },

  // Get single knowledge item by ID
  async getKnowledgeById(id: string): Promise<KnowledgeDetailResponse> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getKnowledgeById with id:', id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get the knowledge from dummy data
    const knowledgeData = await this.getKnowledge();
    const knowledge = knowledgeData.data.find(item => item.id === id);

    if (!knowledge) {
      throw new Error('Knowledge item not found');
    }

    // Increment view count (in real app, this would be a separate API call)
    knowledge.view_count += 1;

    return {
      data: knowledge
    };
  },

  // Create new knowledge item
  async createKnowledge(data: CreateKnowledgeFormData): Promise<Knowledge> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: createKnowledge with data:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate new knowledge item
    const newKnowledge: Knowledge = {
      id: Date.now().toString(), // Generate unique ID
      title: data.title,
      description: data.description,
      subject: data.subject,
      knowledge_type: data.knowledge_type!,
      penyelenggara: data.penyelenggara,
      thumbnail: data.thumbnail instanceof File ? URL.createObjectURL(data.thumbnail) : data.thumbnail || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop',
      author: data.author,
      like_count: 0,
      dislike_count: 0,
      view_count: 0,
      tags: data.tags,
      published_at: data.published_at,
      status: data.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Webinar specific fields
      ...(data.knowledge_type === 'webinar' && {
        tgl_zoom: data.tgl_zoom,
        link_zoom: data.link_zoom,
        link_record: data.link_record,
        link_youtube: data.link_youtube,
        link_vb: data.link_vb,
        file_notulensi_pdf: data.file_notulensi_pdf instanceof File ? URL.createObjectURL(data.file_notulensi_pdf) : data.file_notulensi_pdf,
        content_richtext: data.content_richtext,
        jumlah_jp: data.jumlah_jp,
        gojags_ref: data.gojags_ref,
      }),
      // Konten specific fields
      ...(data.knowledge_type === 'konten' && {
        media_resource: data.media_resource instanceof File ? URL.createObjectURL(data.media_resource) : data.media_resource,
        media_type: data.media_type,
        content_richtext: data.content_richtext,
      }),
    };

    console.log('✅ DUMMY API: Created knowledge:', newKnowledge);
    return newKnowledge;
  },

  // Update knowledge item
  async updateKnowledge(id: string, data: Partial<CreateKnowledgeFormData>): Promise<Knowledge> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: updateKnowledge with id:', id, 'data:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get existing knowledge and update it
    const existingData = await this.getKnowledge();
    const knowledge = existingData.data.find(item => item.id === id);

    if (!knowledge) {
      throw new Error('Knowledge item not found');
    }

    // Update the knowledge with new data
    const updatedKnowledge: Knowledge = {
      ...knowledge,
      ...data,
      updated_at: new Date().toISOString(),
    } as Knowledge;

    console.log('✅ DUMMY API: Updated knowledge:', updatedKnowledge);
    return updatedKnowledge;
  },

  // Delete knowledge item
  async deleteKnowledge(id: string): Promise<void> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: deleteKnowledge with id:', id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('✅ DUMMY API: Deleted knowledge with id:', id);
  },

  // Like knowledge item
  async likeKnowledge(id: string): Promise<void> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: likeKnowledge with id:', id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('✅ DUMMY API: Liked knowledge with id:', id);
  },

  // Dislike knowledge item
  async dislikeKnowledge(id: string): Promise<void> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: dislikeKnowledge with id:', id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('✅ DUMMY API: Disliked knowledge with id:', id);
  },

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: incrementViewCount with id:', id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('✅ DUMMY API: Incremented view count for id:', id);
  },

  // Upload file (thumbnail, media, PDF)
  async uploadFile(file: File, type: 'thumbnail' | 'media' | 'pdf'): Promise<{ url: string }> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: uploadFile with file:', file.name, 'type:', type);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return dummy URL
    const dummyUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;

    console.log('✅ DUMMY API: Uploaded file to:', dummyUrl);
    return { url: dummyUrl };
  },
};

// Taxonomy management
export const taxonomyApi = {
  // Subjects
  async getSubjects(): Promise<Subject[]> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getSubjects');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const dummySubjects: Subject[] = [
      {
        id: '1',
        name: 'Ekonomi',
        description: 'Statistik ekonomi nasional, inflasi, IHK, PDB, dan indikator makroekonomi lainnya',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Demografi',
        description: 'Statistik kependudukan, migrasi, fertilitas, mortalitas, dan proyeksi penduduk',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Sosial',
        description: 'Statistik sosial, pendidikan, kesehatan, kemiskinan, dan kesejahteraan sosial',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        name: 'Pertanian',
        description: 'Statistik pertanian, perkebunan, peternakan, perikanan, dan ketahanan pangan',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '5',
        name: 'Industri',
        description: 'Statistik industri manufaktur, konstruksi, pertambangan, dan jasa',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '6',
        name: 'Perdagangan',
        description: 'Statistik ekspor-impor, neraca perdagangan, harga perdagangan, dan indeks perdagangan',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '7',
        name: 'Teknologi',
        description: 'Statistik teknologi informasi, komunikasi, dan inovasi digital',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '8',
        name: 'Transportasi',
        description: 'Statistik transportasi darat, laut, udara, dan infrastruktur transportasi',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '9',
        name: 'Keuangan',
        description: 'Statistik perbankan, moneter, investasi, dan pasar modal',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '10',
        name: 'Tenaga Kerja',
        description: 'Statistik ketenagakerjaan, pengangguran, upah, dan kondisi kerja',
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    return dummySubjects;
  },

  async createSubject(data: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> {
    console.log('🔄 DUMMY API: createSubject with data:', data);

    await new Promise(resolve => setTimeout(resolve, 500));

    const newSubject: Subject = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString()
    };

    console.log('✅ DUMMY API: Created subject:', newSubject);
    return newSubject;
  },

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    console.log('🔄 DUMMY API: updateSubject with id:', id, 'data:', data);

    await new Promise(resolve => setTimeout(resolve, 400));

    const updatedSubject: Subject = {
      id,
      name: data.name || 'Updated Subject',
      description: data.description || 'Updated Description',
      created_at: '2024-01-01T00:00:00Z'
    };

    console.log('✅ DUMMY API: Updated subject:', updatedSubject);
    return updatedSubject;
  },

  async deleteSubject(id: string): Promise<void> {
    console.log('🔄 DUMMY API: deleteSubject with id:', id);

    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('✅ DUMMY API: Deleted subject with id:', id);
  },

  // Penyelenggara
  async getPenyelenggara(): Promise<Penyelenggara[]> {
    console.log('🔄 DUMMY API: getPenyelenggara');

    await new Promise(resolve => setTimeout(resolve, 300));

    const dummyPenyelenggara: Penyelenggara[] = [
      {
        id: '1',
        name: 'Pusdiklat BPS',
        description: 'Pusat Pendidikan dan Pelatihan Badan Pusat Statistik',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'BPS Sumatera Barat',
        description: 'Badan Pusat Statistik Provinsi Sumatera Barat',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'BPS Jawa Tengah',
        description: 'Badan Pusat Statistik Provinsi Jawa Tengah',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        name: 'BPS Jawa Timur',
        description: 'Badan Pusat Statistik Provinsi Jawa Timur',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '5',
        name: 'BPS DKI Jakarta',
        description: 'Badan Pusat Statistik Provinsi Daerah Khusus Ibukota Jakarta',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '6',
        name: 'BPS DI Yogyakarta',
        description: 'Badan Pusat Statistik Daerah Istimewa Yogyakarta',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '7',
        name: 'BPS Bali',
        description: 'Badan Pusat Statistik Provinsi Bali',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '8',
        name: 'BPS Sumatera Utara',
        description: 'Badan Pusat Statistik Provinsi Sumatera Utara',
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    return dummyPenyelenggara;
  },

  async createPenyelenggara(data: Omit<Penyelenggara, 'id' | 'created_at'>): Promise<Penyelenggara> {
    console.log('🔄 DUMMY API: createPenyelenggara with data:', data);

    await new Promise(resolve => setTimeout(resolve, 500));

    const newPenyelenggara: Penyelenggara = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString()
    };

    console.log('✅ DUMMY API: Created penyelenggara:', newPenyelenggara);
    return newPenyelenggara;
  },

  async updatePenyelenggara(id: string, data: Partial<Penyelenggara>): Promise<Penyelenggara> {
    console.log('🔄 DUMMY API: updatePenyelenggara with id:', id, 'data:', data);

    await new Promise(resolve => setTimeout(resolve, 400));

    const updatedPenyelenggara: Penyelenggara = {
      id,
      name: data.name || 'Updated Penyelenggara',
      description: data.description || 'Updated Description',
      created_at: '2024-01-01T00:00:00Z'
    };

    console.log('✅ DUMMY API: Updated penyelenggara:', updatedPenyelenggara);
    return updatedPenyelenggara;
  },

  async deletePenyelenggara(id: string): Promise<void> {
    console.log('🔄 DUMMY API: deletePenyelenggara with id:', id);

    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('✅ DUMMY API: Deleted penyelenggara with id:', id);
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    console.log('🔄 DUMMY API: getTags');

    await new Promise(resolve => setTimeout(resolve, 300));

    const dummyTags: Tag[] = [
      { id: '1', name: 'statistik', color: '#3B82F6', created_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'ekonomi', color: '#10B981', created_at: '2024-01-01T00:00:00Z' },
      { id: '3', name: 'survei', color: '#F59E0B', created_at: '2024-01-01T00:00:00Z' },
      { id: '4', name: 'data', color: '#EF4444', created_at: '2024-01-01T00:00:00Z' },
      { id: '5', name: 'analisis', color: '#8B5CF6', created_at: '2024-01-01T00:00:00Z' },
      { id: '6', name: 'pelatihan', color: '#EC4899', created_at: '2024-01-01T00:00:00Z' },
      { id: '7', name: 'metodologi', color: '#14B8A6', created_at: '2024-01-01T00:00:00Z' },
      { id: '8', name: 'sampling', color: '#F97316', created_at: '2024-01-01T00:00:00Z' },
      { id: '9', name: 'kependudukan', color: '#06B6D4', created_at: '2024-01-01T00:00:00Z' },
      { id: '10', name: 'inflasi', color: '#84CC16', created_at: '2024-01-01T00:00:00Z' },
      { id: '11', name: 'IHK', color: '#A855F7', created_at: '2024-01-01T00:00:00Z' },
      { id: '12', name: 'susenas', color: '#0EA5E9', created_at: '2024-01-01T00:00:00Z' },
      { id: '13', name: 'teknologi', color: '#22C55E', created_at: '2024-01-01T00:00:00Z' },
      { id: '14', name: 'big data', color: '#E11D48', created_at: '2024-01-01T00:00:00Z' },
      { id: '15', name: 'machine learning', color: '#7C3AED', created_at: '2024-01-01T00:00:00Z' }
    ];

    return dummyTags;
  },

  async createTag(data: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    console.log('🔄 DUMMY API: createTag with data:', data);

    await new Promise(resolve => setTimeout(resolve, 400));

    const newTag: Tag = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString()
    };

    console.log('✅ DUMMY API: Created tag:', newTag);
    return newTag;
  },

  async updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
    console.log('🔄 DUMMY API: updateTag with id:', id, 'data:', data);

    await new Promise(resolve => setTimeout(resolve, 300));

    const updatedTag: Tag = {
      id,
      name: data.name || 'Updated Tag',
      color: data.color || '#6B7280',
      created_at: '2024-01-01T00:00:00Z'
    };

    console.log('✅ DUMMY API: Updated tag:', updatedTag);
    return updatedTag;
  },

  async deleteTag(id: string): Promise<void> {
    console.log('🔄 DUMMY API: deleteTag with id:', id);

    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('✅ DUMMY API: Deleted tag with id:', id);
  },
};

// Analytics
export const analyticsApi = {
  async getKnowledgeAnalytics(): Promise<KnowledgeAnalytics> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getKnowledgeAnalytics');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const dummyAnalytics: KnowledgeAnalytics = {
      total_knowledge: 25,
      total_webinars: 8,
      total_published: 22,
      total_likes: 342,
      total_dislikes: 15,
      total_views: 8756,
      upcoming_webinars: 3,
      top_subjects: [
        { subject: 'Ekonomi', count: 8 },
        { subject: 'Teknologi', count: 5 },
        { subject: 'Sosial', count: 4 },
        { subject: 'Demografi', count: 3 },
        { subject: 'Pertanian', count: 2 }
      ],
      popular_knowledge: [
        {
          id: '5',
          title: 'Big Data dan Machine Learning di Statistik Modern',
          description: 'Webinar mendalam tentang penerapan big data dan machine learning dalam statistik modern untuk meningkatkan akurasi dan efisiensi analisis data.',
          subject: 'Teknologi',
          like_count: 89,
          dislike_count: 5,
          view_count: 2341,
          published_at: '2024-11-05T13:00:00Z',
          knowledge_type: 'webinar',
          penyelenggara: 'Pusdiklat BPS',
          author: 'Dr. Andi Pratama',
          tags: ['big data', 'machine learning', 'teknologi'],
          thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop'
        },
        {
          id: '4',
          title: 'Panduan Pengisian Survei Sosial Ekonomi (Susenas)',
          description: 'Panduan lengkap untuk petugas lapangan dalam melakukan pengisian kuesioner Survei Sosial Ekonomi Nasional dengan standar dan prosedur yang benar.',
          subject: 'Sosial',
          like_count: 56,
          dislike_count: 4,
          view_count: 1567,
          published_at: '2024-10-20T11:00:00Z',
          knowledge_type: 'konten',
          penyelenggara: 'BPS Jawa Tengah',
          author: 'Drs. Ratna Sari',
          tags: ['susenas', 'survei sosial', 'pelatihan'],
          thumbnail: 'https://images.unsplash.com/photo-1565079973934-7155e6d4b7d8?w=800&h=450&fit=crop'
        },
        {
          id: '1',
          title: 'Pengenalan Statistik Ekonomi Indonesia',
          description: 'Webinar pengenalan konsep dasar statistik ekonomi di Indonesia, mencakup metodologi, indikator utama, dan penerapan dalam perencanaan pembangunan.',
          subject: 'Ekonomi',
          like_count: 45,
          dislike_count: 2,
          view_count: 1234,
          published_at: '2024-11-01T10:00:00Z',
          knowledge_type: 'webinar',
          penyelenggara: 'Pusdiklat BPS',
          author: 'Dr. Ahmad Wijaya',
          tags: ['statistik', 'ekonomi', 'dasar'],
          thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop'
        },
        {
          id: '2',
          title: 'Teknik Sampling dalam Survei Kependudukan',
          description: 'Panduan lengkap teknik sampling dalam survei kependudukan, mencakup berbagai metode dan best practices untuk hasil yang akurat.',
          subject: 'Demografi',
          like_count: 32,
          dislike_count: 1,
          view_count: 892,
          published_at: '2024-10-28T14:00:00Z',
          knowledge_type: 'konten',
          penyelenggara: 'BPS Sumatera Barat',
          author: 'Ir. Siti Nurhaliza',
          tags: ['sampling', 'survei', 'kependudukan'],
          thumbnail: 'https://images.unsplash.com/photo-1554224155-6af6b8037f7c?w=800&h=450&fit=crop'
        }
      ]
    };

    return dummyAnalytics;
  },
};

// Webinar Schedule
export const scheduleApi = {
  async getWebinarSchedule(): Promise<WebinarSchedule[]> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getWebinarSchedule');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const now = new Date();
    const dummySchedule: WebinarSchedule[] = [
      {
        id: '1',
        webinar_id: '1',
        title: 'Pengenalan Statistik Ekonomi Indonesia',
        tgl_zoom: '2024-11-15T10:00:00Z',
        link_zoom: 'https://zoom.us/j/123456789',
        status: new Date('2024-11-15T10:00:00Z') > now ? 'upcoming' : 'ended',
        participants_count: 45
      },
      {
        id: '2',
        webinar_id: '5',
        title: 'Big Data dan Machine Learning di Statistik Modern',
        tgl_zoom: '2024-11-20T13:00:00Z',
        link_zoom: 'https://zoom.us/j/987654321',
        status: new Date('2024-11-20T13:00:00Z') > now ? 'upcoming' : 'ended',
        participants_count: 128
      },
      {
        id: '3',
        webinar_id: '6',
        title: 'Workshop: Analisis Data dengan Python untuk Statistik',
        tgl_zoom: '2024-11-25T14:30:00Z',
        link_zoom: 'https://zoom.us/j/555666777',
        status: new Date('2024-11-25T14:30:00Z') > now ? 'upcoming' : 'ended',
        participants_count: 67
      },
      {
        id: '4',
        webinar_id: '7',
        title: 'Seminar: Tren Statistik 2025 dan Persiapan BPS',
        tgl_zoom: '2024-11-30T09:00:00Z',
        link_zoom: 'https://zoom.us/j/333444555',
        status: new Date('2024-11-30T09:00:00Z') > now ? 'upcoming' : 'ended',
        participants_count: 234
      },
      {
        id: '5',
        webinar_id: '8',
        title: 'Pelatihan: Metodologi Survei untuk Staf BPS Pemula',
        tgl_zoom: '2024-12-02T10:00:00Z',
        link_zoom: 'https://zoom.us/j/777888999',
        status: new Date('2024-12-02T10:00:00Z') > now ? 'upcoming' : 'ended',
        participants_count: 89
      },
      {
        id: '6',
        webinar_id: '9',
        title: 'Kuliah Tamu: Integrasi Big Data dalam Statistik Nasional',
        tgl_zoom: '2024-11-18T15:00:00Z',
        link_zoom: 'https://zoom.us/j/999000111',
        status: new Date('2024-11-18T15:00:00Z') > now ? 'upcoming' : 'ended',
        participants_count: 156
      },
      {
        id: '7',
        webinar_id: '10',
        title: 'Diskusi Panel: Kualitas Data dan Kepercayaan Publik',
        tgl_zoom: '2024-11-22T11:00:00Z',
        link_zoom: 'https://zoom.us/j/111222333',
        status: new Date('2024-11-22T11:00:00Z') > now ? 'upcoming' : 'ended',
        participants_count: 203
      },
      {
        id: '8',
        webinar_id: '11',
        title: 'Tutorial: Penggunaan Software SPSS untuk Analisis Statistik',
        tgl_zoom: '2024-11-12T13:30:00Z',
        link_zoom: 'https://zoom.us/j/444555666',
        status: 'ended',
        participants_count: 34
      },
      {
        id: '9',
        webinar_id: '12',
        title: 'Workshop: Visualisasi Data Statistik dengan Tableau',
        tgl_zoom: '2024-11-08T16:00:00Z',
        link_zoom: 'https://zoom.us/j/666777888',
        status: 'ended',
        participants_count: 78
      },
      {
        id: '10',
        webinar_id: '13',
        title: 'Seminar: Standar Statistik Internasional dan Implementasi di BPS',
        tgl_zoom: '2024-11-05T14:00:00Z',
        link_zoom: 'https://zoom.us/j/888999000',
        status: 'ended',
        participants_count: 145
      }
    ];

    return dummySchedule;
  },

  async updateWebinarSchedule(id: string, data: Partial<WebinarSchedule>): Promise<WebinarSchedule> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: updateWebinarSchedule with id:', id, 'data:', data);

    await new Promise(resolve => setTimeout(resolve, 300));

    const existingSchedule = await this.getWebinarSchedule();
    const webinar = existingSchedule.find(item => item.id === id);

    if (!webinar) {
      throw new Error('Webinar schedule not found');
    }

    const updatedSchedule: WebinarSchedule = {
      ...webinar,
      ...data,
    };

    console.log('✅ DUMMY API: Updated webinar schedule:', updatedSchedule);
    return updatedSchedule;
  },
};

// Settings API - Using dummy data
export const settingsApi = {
  async getKnowledgeSettings(): Promise<KnowledgeCenterSettings> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getKnowledgeSettings');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const dummySettings: KnowledgeCenterSettings = {
      rte_whitelist_tags: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
        'hr',
        'sub', 'sup'
      ],
      rte_allowed_attributes: {
        '*': ['class', 'style'],
        'a': ['href', 'target', 'title', 'rel'],
        'img': ['src', 'alt', 'width', 'height', 'title'],
        'td': ['colspan', 'rowspan'],
        'th': ['colspan', 'rowspan']
      },
      max_file_size: 100 * 1024 * 1024, // 100MB
      allowed_file_types: {
        video: ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
        pdf: ['pdf'],
        audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
        image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
      },
      thumbnail_min_width: 1280,
      thumbnail_min_height: 720,
      thumbnail_aspect_ratio: '16:9',
    };

    console.log('✅ DUMMY API: Returning settings:', dummySettings);
    return dummySettings;
  },

  async updateKnowledgeSettings(data: Partial<KnowledgeCenterSettings>): Promise<KnowledgeCenterSettings> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: updateKnowledgeSettings with data:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const currentSettings = await this.getKnowledgeSettings();
    const updatedSettings = { ...currentSettings, ...data };

    console.log('✅ DUMMY API: Updated settings:', updatedSettings);
    return updatedSettings;
  },
};

// Export all APIs
export const knowledgeCenterApi = {
  knowledge: knowledgeApi,
  taxonomy: taxonomyApi,
  analytics: analyticsApi,
  schedule: scheduleApi,
  settings: settingsApi,
};

export default knowledgeCenterApi;