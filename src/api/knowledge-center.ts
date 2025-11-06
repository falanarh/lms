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
  MediaType,
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

// Data generation helper for consistent dummy data
const generateDummyKnowledgeData = (): Knowledge[] => {
  const subjects = [
    'Ekonomi', 'Demografi', 'Statistik', 'Keuangan', 'Tenaga Kerja',
    'Inflasi', 'Perdagangan', 'Industri', 'Pertanian', 'Teknologi',
    'Kesehatan', 'Pendidikan', 'Lingkungan', 'Transportasi', 'Komunikasi',
    'Energi', 'Pariwisata', 'Kebudayaan', 'Hukum', 'Politik'
  ];

  const penyelenggaraList = [
    'Pusdiklat BPS', 'BPS Sumatera Barat', 'BPS Jawa Tengah', 'BPS DKI Jakarta',
    'BPS Bali', 'BPS Sumatera Utara', 'BPS Jawa Timur', 'BPS Kalimantan',
    'BPS Sulawesi', 'BPS Papua'
  ];

  // Titles for different content types
  const webinarTitles = [
    'Workshop: Teknik Sampling dalam Survei Kependudukan',
    'Seminar: Big Data dan Machine Learning di BPS',
    'Pelatihan: Metodologi Survei Sosial Ekonomi',
    'Workshop: Data Visualization untuk Laporan',
    'Webinar: Quality Control dalam Pengumpulan Data',
  ];

  const videoTitles = [
    'Tutorial: Analisis Data dengan Python untuk Pemula',
    'Video Series: Excel untuk Analisis Data Statistik',
    'Screencast: Geospasial untuk Statistik Regional',
    'Tutorial: Power BI untuk Dashboard Interaktif',
    'Video Course: Digital Transformation di BPS',
  ];

  const podcastTitles = [
    'Podcast: Statistik dalam Kehidupan Sehari-hari',
    'Audio Series: Wawancara dengan Ahli Statistik Indonesia',
    'Podcast BPS: Memahami Data Ekonomi Terkini',
    'Talk Show: Karir di Bidang Statistik',
    'Diskusi: Tantangan Survei di Era Digital',
  ];

  const pdfTitles = [
    'Panduan Lengkap: Standar Statistik Internasional',
    'E-Book: Pengenalan Statistik Ekonomi Indonesia',
    'Modul: Teknik Pengolahan Data Survei',
    'Guideline: Best Practice Quality Control Data',
    'Handbook: Metodologi Sensus Penduduk',
  ];

  const articleTitles = [
    'Artikel: Tren Inflasi dan Dampaknya terhadap Ekonomi',
    'Studi Kasus: Implementasi Big Data di BPS Daerah',
    'Paper: Analisis Pertumbuhan Ekonomi Regional',
    'Laporan: Kondisi Ketenagakerjaan Indonesia 2024',
    'Review: Perkembangan Statistik Digital di ASEAN',
  ];

  // Picsum Photos IDs for variety (high quality placeholder images)
  const picsumIds = [
    1, 10, 20, 30, 40, 50, 60, 70, 80, 90,
    100, 110, 120, 130, 140, 150, 160, 170, 180, 190
  ];

  // Generate 150 knowledge items (50 webinars + 100 content)
  return Array.from({ length: 150 }, (_, index) => {
    const id = (index + 1).toString();
    const subjectIndex = index % subjects.length;
    const penyelenggaraIndex = index % penyelenggaraList.length;
    const picsumIndex = index % picsumIds.length;

    // Distribute: 1/3 webinars, 2/3 content (video, podcast, pdf, article)
    const isWebinar = index % 3 === 0;
    const knowledgeType: 'webinar' | 'konten' = isWebinar ? 'webinar' : 'konten';

    // For content, cycle through media types
    const contentIndex = Math.floor(index / 3) * 2 + (index % 3) - 1;
    const mediaTypeIndex = contentIndex % 4;
    const mediaType: MediaType = (['video', 'audio', 'pdf', 'article'] as const)[mediaTypeIndex];

    const imageId = picsumIds[picsumIndex] + index;

    // Get appropriate title based on type
    let title: string;
    if (isWebinar) {
      const webinarIndex = Math.floor(index / 3) % webinarTitles.length;
      title = `${webinarTitles[webinarIndex]} - Sesi ${Math.floor(index / (webinarTitles.length * 3)) + 1}`;
    } else {
      const contentTitleIndex = Math.floor(contentIndex / 4) + 1;
      switch(mediaType) {
        case 'video':
          title = `${videoTitles[Math.floor(contentIndex / 4) % videoTitles.length]} - Part ${contentTitleIndex}`;
          break;
        case 'audio':
          title = `${podcastTitles[Math.floor(contentIndex / 4) % podcastTitles.length]} - Episode ${contentTitleIndex}`;
          break;
        case 'pdf':
          title = `${pdfTitles[Math.floor(contentIndex / 4) % pdfTitles.length]} - Edisi ${contentTitleIndex}`;
          break;
        case 'article':
          title = `${articleTitles[Math.floor(contentIndex / 4) % articleTitles.length]} - Vol ${contentTitleIndex}`;
          break;
        default:
          title = 'Konten Pembelajaran';
      }
    }

    // Generate descriptions based on type
    const getDescription = () => {
      if (isWebinar) {
        return `Webinar interaktif yang membahas topik ${subjects[subjectIndex].toLowerCase()} dengan pendekatan praktis dan diskusi langsung. Peserta akan mendapatkan sertifikat dan materi lengkap setelah mengikuti sesi ini.`;
      }

      switch(mediaType) {
        case 'video':
          return `Video pembelajaran step-by-step dengan visualisasi yang jelas dan mudah dipahami. Cocok untuk pemula hingga tingkat menengah. Durasi: ${Math.floor(Math.random() * 40) + 10} menit. Dilengkapi dengan subtitle dan materi pendukung.`;
        case 'audio':
          return `Podcast edukatif dengan diskusi mendalam bersama praktisi dan ahli statistik. Format santai namun informatif, cocok untuk didengarkan saat bepergian. Durasi: ${Math.floor(Math.random() * 50) + 20} menit.`;
        case 'pdf':
          return `Dokumen komprehensif berisi teori, metodologi, dan studi kasus terkini. Dilengkapi dengan ilustrasi, diagram, dan referensi. Total ${Math.floor(Math.random() * 50) + 20} halaman. Format: PDF, dapat diunduh dan dicetak.`;
        case 'article':
          return `Artikel analisis mendalam tentang ${subjects[subjectIndex].toLowerCase()} dengan data dan insight terbaru. Ditulis oleh praktisi berpengalaman dengan referensi dari sumber terpercaya. Waktu baca: ${Math.floor(Math.random() * 10) + 5} menit.`;
        default:
          return 'Konten pembelajaran berkualitas untuk meningkatkan pemahaman Anda.';
      }
    };

    return {
      id,
      title,
      description: getDescription(),
      subject: subjects[subjectIndex],
      knowledge_type: knowledgeType,
      penyelenggara: penyelenggaraList[penyelenggaraIndex],
      thumbnail: `https://picsum.photos/id/${imageId}/1200/675`,
      author: `Dr. Ahmad Wijaya (${Math.floor(index / 10) + 1})`,
      like_count: Math.floor(Math.random() * 100) + 10,
      dislike_count: Math.floor(Math.random() * 10) + 1,
      view_count: Math.floor(Math.random() * 2000) + 100,
      tags: ['statistik', 'data', 'analisis', 'indonesia'].slice(0, Math.floor(Math.random() * 3) + 2),
      published_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published',
      created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      ...(isWebinar ? {
        // Generate mix of past and upcoming webinars (60% past, 40% upcoming)
        tgl_zoom: (Math.floor(index / 3) % 5) < 3
          ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() // Past: 0-60 days ago (60%)
          : new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Future: 0-30 days ahead (40%)
        link_zoom: `https://zoom.us/j/${123456789 + index}`,
        link_record: `https://youtube.com/watch?v=example${index}`,
        link_youtube: `https://youtube.com/watch?v=example${index}`,
        link_vb: `https://videobuilder.com/example${index}`,
        file_notulensi_pdf: `https://example.com/notulensi${index}.pdf`,
        content_richtext: `<p>Konten webinar tentang ${subjects[subjectIndex].toLowerCase()}. Materi komprehensif dengan studi kasus dan diskusi interaktif.</p>`,
        jumlah_jp: Math.floor(Math.random() * 16) + 4,
        gojags_ref: `GOJAGS-2024-${String(index + 1).padStart(3, '0')}`
      } : {
        media_type: mediaType,
        // Use real sample URLs for testing
        media_resource: mediaType === 'video'
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          : mediaType === 'audio'
          ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
          : mediaType === 'pdf'
          ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
          : undefined,
        content_richtext: mediaType === 'article'
          ? `
            <h2>Pendahuluan</h2>
            <p>Artikel ini membahas secara mendalam tentang ${subjects[subjectIndex].toLowerCase()} dengan pendekatan yang komprehensif dan mudah dipahami. Materi disusun berdasarkan praktik terbaik dan pengalaman dari para ahli di bidangnya.</p>

            <p>Dalam era digital dan transformasi data saat ini, pemahaman yang mendalam tentang konsep-konsep statistik menjadi semakin penting. Artikel ini dirancang untuk memberikan wawasan yang komprehensif bagi para praktisi, akademisi, dan pemangku kepentingan yang berkecimpung dalam dunia data dan statistik.</p>

            <h2>Latar Belakang</h2>
            <p>Dalam konteks statistik Indonesia, ${subjects[subjectIndex].toLowerCase()} memiliki peran yang sangat penting dalam mendukung pengambilan keputusan berbasis data. Badan Pusat Statistik (BPS) sebagai lembaga penyedia data statistik resmi terus berupaya meningkatkan kualitas dan aksesibilitas informasi statistik.</p>

            <p>Perkembangan teknologi informasi dan meningkatnya kebutuhan akan data yang akurat dan tepat waktu menuntut para pengelola data untuk terus meningkatkan kompetensi dan pemahaman mereka. Oleh karena itu, topik yang dibahas dalam artikel ini menjadi sangat relevan dengan kondisi dan kebutuhan saat ini.</p>

            <h2>Pembahasan Utama</h2>
            <p>Beberapa poin penting yang akan dibahas dalam artikel ini meliputi:</p>
            <ul>
              <li>Konsep dasar dan terminologi yang digunakan dalam ${subjects[subjectIndex].toLowerCase()}</li>
              <li>Metodologi pengumpulan dan pengolahan data yang sesuai standar internasional</li>
              <li>Penerapan praktis dalam konteks pekerjaan statistik sehari-hari</li>
              <li>Studi kasus implementasi di berbagai daerah di Indonesia</li>
              <li>Tantangan dan solusi yang dihadapi dalam praktik lapangan</li>
              <li>Best practices dan lessons learned dari implementasi sebelumnya</li>
            </ul>

            <h3>Konsep dan Definisi</h3>
            <p>Memahami konsep dasar adalah fondasi penting dalam menguasai ${subjects[subjectIndex].toLowerCase()}. Setiap istilah dan terminologi memiliki makna spesifik yang perlu dipahami dengan baik untuk menghindari kesalahan interpretasi dalam analisis dan pelaporan data.</p>

            <h3>Metodologi dan Standar</h3>
            <p>Penerapan metodologi yang tepat dan konsisten sangat penting untuk memastikan kualitas data yang dihasilkan. BPS telah mengadopsi berbagai standar internasional yang disesuaikan dengan kondisi dan kebutuhan Indonesia.</p>

            <h2>Metodologi</h2>
            <p>Pendekatan yang digunakan dalam pembahasan ini mengacu pada standar metodologi statistik yang telah ditetapkan oleh BPS. Setiap konsep dijelaskan dengan bahasa yang mudah dipahami namun tetap mempertahankan akurasi teknis yang diperlukan.</p>

            <p>Metodologi yang digunakan mencakup kombinasi antara pendekatan teoritis dan praktis, dengan penekanan pada aplikasi nyata dalam konteks pekerjaan statistik di Indonesia. Setiap langkah dijelaskan secara sistematis dengan contoh-contoh yang relevan.</p>

            <h2>Studi Kasus dan Implementasi</h2>
            <p>Untuk memberikan gambaran yang lebih konkret, artikel ini dilengkapi dengan beberapa studi kasus nyata dari implementasi di lapangan. Contoh-contoh ini diambil dari berbagai daerah dan situasi yang berbeda untuk memberikan perspektif yang luas.</p>

            <p>Setiap studi kasus dilengkapi dengan analisis mendalam tentang faktor-faktor keberhasilan, tantangan yang dihadapi, dan solusi yang diterapkan. Pembelajaran dari kasus-kasus ini dapat menjadi referensi berharga untuk implementasi di lokasi lain.</p>

            <h2>Tantangan dan Solusi</h2>
            <p>Dalam praktik lapangan, berbagai tantangan sering muncul dalam implementasi ${subjects[subjectIndex].toLowerCase()}. Artikel ini mengidentifikasi tantangan-tantangan umum yang dihadapi dan menyajikan berbagai solusi praktis yang telah terbukti efektif.</p>

            <p>Beberapa tantangan utama meliputi keterbatasan sumber daya, kompleksitas data, koordinasi antar instansi, dan adaptasi terhadap perubahan teknologi. Setiap tantangan dibahas dengan pendekatan problem-solving yang sistematis.</p>

            <h2>Kesimpulan</h2>
            <p>Pemahaman yang baik tentang ${subjects[subjectIndex].toLowerCase()} sangat penting bagi para pegawai BPS dan pemangku kepentingan lainnya. Dengan menguasai konsep dan praktik yang dijelaskan dalam artikel ini, diharapkan dapat meningkatkan kualitas kerja dan kontribusi dalam penyediaan data statistik yang akurat dan tepat waktu.</p>

            <p>Pembelajaran berkelanjutan dan adaptasi terhadap perkembangan terbaru dalam metodologi dan teknologi statistik menjadi kunci keberhasilan dalam menghadapi tantangan masa depan. Mari terus meningkatkan kompetensi dan berkontribusi dalam penyediaan data berkualitas untuk pembangunan Indonesia.</p>

            <h2>Referensi</h2>
            <p>Artikel ini disusun berdasarkan berbagai sumber terpercaya termasuk publikasi resmi BPS, jurnal statistik internasional, dan pengalaman praktis dari para ahli di bidang statistik. Untuk informasi lebih lanjut, pembaca dapat merujuk pada dokumentasi resmi BPS dan publikasi terkait.</p>
          `
          : `<p>Konten pembelajaran ${mediaType === 'video' ? 'video' : mediaType === 'audio' ? 'audio' : 'artikel'} tentang ${subjects[subjectIndex].toLowerCase()} yang informatif dan mudah dipahami.</p>`
      })
    } as Knowledge;
  });
};

// Knowledge CRUD operations
export const knowledgeApi = {
  // Get all knowledge items with filters and pagination
  async getKnowledge(params: KnowledgeQueryParams = {}): Promise<KnowledgeListResponse> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getKnowledge with params:', params);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate dummy knowledge data using the shared function
    const dummyKnowledge = generateDummyKnowledgeData();

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

    if (params.subject) {
      filteredData = filteredData.filter(item =>
        params.subject!.includes(item.subject)
      );
    }

    if (params.knowledge_type) {
      filteredData = filteredData.filter(item =>
        params.knowledge_type!.includes(item.knowledge_type)
      );
    }

    if (params.penyelenggara) {
      filteredData = filteredData.filter(item =>
        params.penyelenggara!.includes(item.penyelenggara)
      );
    }

    if (params.tags) {
      filteredData = filteredData.filter(item =>
        params.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Apply sorting
    if (params.sort) {
      switch (params.sort) {
        case 'newest':
          filteredData.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
          break;
        case 'oldest':
          filteredData.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
          break;
        case 'popular':
          filteredData.sort((a, b) => b.view_count - a.view_count);
          break;
        case 'likes':
          filteredData.sort((a, b) => b.like_count - a.like_count);
          break;
        case 'title':
          filteredData.sort((a, b) => a.title.localeCompare(b.title));
          break;
      }
    } else {
      // Default sort: newest first
      filteredData.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filteredData.length,
      page,
      limit,
      total_pages: Math.ceil(filteredData.length / limit),
    };
  },

  // Get knowledge by ID
  async getKnowledgeById(id: string): Promise<KnowledgeDetailResponse> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getKnowledgeById with id:', id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get the knowledge from the same data generation function
    const knowledgeData = generateDummyKnowledgeData();
    const knowledge = knowledgeData.find(item => item.id === id);

    if (!knowledge) {
      throw new Error('Knowledge item not found');
    }

    // Increment view count (in real app, this would be a separate API call)
    knowledge.view_count += 1;

    return {
      data: knowledge
    };
  },

  // Create new knowledge
  async createKnowledge(data: CreateKnowledgeFormData): Promise<Knowledge> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: createKnowledge with data:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Convert File objects to strings for storage (in real app, would upload to cloud storage)
    const processedData = {
      ...data,
      thumbnail: data.thumbnail instanceof File
        ? URL.createObjectURL(data.thumbnail)
        : data.thumbnail || 'https://images.unsplash.com/photo-1580000000000-default?w=800&h=450&fit=crop',
      media_resource: (data as any).media_resource instanceof File
        ? URL.createObjectURL((data as any).media_resource)
        : (data as any).media_resource,
      file_notulensi_pdf: (data as any).file_notulensi_pdf instanceof File
        ? URL.createObjectURL((data as any).file_notulensi_pdf)
        : (data as any).file_notulensi_pdf,
    };

    const newKnowledge: Knowledge = {
      ...processedData,
      id: Date.now().toString(),
      knowledge_type: processedData.knowledge_type || 'konten',
      subject: processedData.subject || '',
      description: processedData.description || '',
      penyelenggara: processedData.penyelenggara || '',
      author: processedData.author || '',
      tags: processedData.tags || [],
      like_count: 0,
      dislike_count: 0,
      view_count: 0,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    };

    return newKnowledge;
  },

  // Update knowledge
  async updateKnowledge(id: string, data: Partial<CreateKnowledgeFormData>): Promise<Knowledge> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: updateKnowledge with id:', id, 'data:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const knowledgeData = generateDummyKnowledgeData();
    const existingKnowledge = knowledgeData.find(item => item.id === id);

    if (!existingKnowledge) {
      throw new Error('Knowledge item not found');
    }

    // Convert File objects to strings for storage
    const processedData = {
      ...data,
      thumbnail: data.thumbnail instanceof File
        ? URL.createObjectURL(data.thumbnail)
        : data.thumbnail || existingKnowledge.thumbnail,
      media_resource: (data as any).media_resource instanceof File
        ? URL.createObjectURL((data as any).media_resource)
        : (data as any).media_resource,
      file_notulensi_pdf: (data as any).file_notulensi_pdf instanceof File
        ? URL.createObjectURL((data as any).file_notulensi_pdf)
        : (data as any).file_notulensi_pdf,
    };

    const updatedKnowledge: Knowledge = {
      ...existingKnowledge,
      ...processedData,
      updated_at: new Date().toISOString(),
    };

    return updatedKnowledge;
  },

  // Delete knowledge
  async deleteKnowledge(id: string): Promise<void> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: deleteKnowledge with id:', id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real implementation, this would make a DELETE request to the API
    return;
  },

  // Like knowledge
  async likeKnowledge(id: string): Promise<void> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: likeKnowledge with id:', id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return;
  },

  // Dislike knowledge
  async dislikeKnowledge(id: string): Promise<void> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: dislikeKnowledge with id:', id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return;
  },
};

// Taxonomy API operations
export const taxonomyApi = {
  // Subjects
  async getSubjects(): Promise<Subject[]> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getSubjects');

    await new Promise(resolve => setTimeout(resolve, 300));

    const dummySubjects: Subject[] = [
      { id: '1', name: 'Ekonomi', description: 'Statistik ekonomi, inflasi, PDB, indeks harga', created_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'Demografi', description: 'Statistik kependudukan, kelahiran, kematian, migrasi', created_at: '2024-01-01T00:00:00Z' },
      { id: '3', name: 'Statistik', description: 'Metodologi statistik, sampling, survei', created_at: '2024-01-01T00:00:00Z' },
      { id: '4', name: 'Keuangan', description: 'Statistik perbankan, moneter, investasi, dan pasar modal', created_at: '2024-01-01T00:00:00Z' },
      { id: '5', name: 'Tenaga Kerja', description: 'Statistik ketenagakerjaan, pengangguran, upah, dan kondisi kerja', created_at: '2024-01-01T00:00:00Z' },
      { id: '6', name: 'Perdagangan', description: 'Statistik ekspor, impor, neraca perdagangan', created_at: '2024-01-01T00:00:00Z' },
      { id: '7', name: 'Industri', description: 'Statistik industri manufaktur dan jasa', created_at: '2024-01-01T00:00:00Z' },
      { id: '8', name: 'Pertanian', description: 'Statistik pertanian, perkebunan, peternakan', created_at: '2024-01-01T00:00:00Z' },
      { id: '9', name: 'Teknologi', description: 'Statistik TIK, digitalisasi, e-commerce', created_at: '2024-01-01T00:00:00Z' },
      { id: '10', name: 'Kesehatan', description: 'Statistik kesehatan, fasilitas kesehatan', created_at: '2024-01-01T00:00:00Z' }
    ];

    return dummySubjects;
  },

  async createSubject(data: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> {
    console.log('🔄 DUMMY API: createSubject with data:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newSubject: Subject = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
    };
    return newSubject;
  },

  async updateSubject(id: string, data: Partial<Omit<Subject, 'id' | 'created_at'>>): Promise<Subject> {
    console.log('🔄 DUMMY API: updateSubject with id:', id, 'data:', data);
    await new Promise(resolve => setTimeout(resolve, 400));
    const updatedSubject: Subject = {
      id,
      name: data.name || 'Unnamed Subject',
      description: data.description || '',
      created_at: '2024-01-01T00:00:00Z', // This would normally come from the existing record
    };
    return updatedSubject;
  },

  async deleteSubject(id: string): Promise<void> {
    console.log('🔄 DUMMY API: deleteSubject with id:', id);
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  },

  // Penyelenggara (Organizers)
  async getPenyelenggara(): Promise<Penyelenggara[]> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getPenyelenggara');

    await new Promise(resolve => setTimeout(resolve, 300));

    const dummyPenyelenggara: Penyelenggara[] = [
      { id: '1', name: 'Pusdiklat BPS', description: 'Pusat Pendidikan dan Pelatihan Badan Pusat Statistik', created_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'BPS Sumatera Barat', description: 'Badan Pusat Statistik Provinsi Sumatera Barat', created_at: '2024-01-01T00:00:00Z' },
      { id: '3', name: 'BPS Jawa Tengah', description: 'Badan Pusat Statistik Provinsi Jawa Tengah', created_at: '2024-01-01T00:00:00Z' },
      { id: '4', name: 'BPS DKI Jakarta', description: 'Badan Pusat Statistik Provinsi DKI Jakarta', created_at: '2024-01-01T00:00:00Z' },
      { id: '5', name: 'BPS Bali', description: 'Badan Pusat Statistik Provinsi Bali', created_at: '2024-01-01T00:00:00Z' },
      { id: '6', name: 'BPS Sumatera Utara', description: 'Badan Pusat Statistik Provinsi Sumatera Utara', created_at: '2024-01-01T00:00:00Z' },
      { id: '7', name: 'BPS Jawa Timur', description: 'Badan Pusat Statistik Provinsi Jawa Timur', created_at: '2024-01-01T00:00:00Z' },
      { id: '8', name: 'BPS Kalimantan', description: 'Badan Pusat Statistik Provinsi Kalimantan', created_at: '2024-01-01T00:00:00Z' }
    ];

    return dummyPenyelenggara;
  },

  async createPenyelenggara(data: Omit<Penyelenggara, 'id' | 'created_at'>): Promise<Penyelenggara> {
    console.log('🔄 DUMMY API: createPenyelenggara with data:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newPenyelenggara: Penyelenggara = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
    };
    return newPenyelenggara;
  },

  async updatePenyelenggara(id: string, data: Partial<Omit<Penyelenggara, 'id' | 'created_at'>>): Promise<Penyelenggara> {
    console.log('🔄 DUMMY API: updatePenyelenggara with id:', id, 'data:', data);
    await new Promise(resolve => setTimeout(resolve, 400));
    const updatedPenyelenggara: Penyelenggara = {
      id,
      name: data.name || 'Unnamed Penyelenggara',
      description: data.description || '',
      created_at: '2024-01-01T00:00:00Z',
    };
    return updatedPenyelenggara;
  },

  async deletePenyelenggara(id: string): Promise<void> {
    console.log('🔄 DUMMY API: deletePenyelenggara with id:', id);
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getTags');

    await new Promise(resolve => setTimeout(resolve, 200));

    const dummyTags: Tag[] = [
      { id: '1', name: 'statistik', color: '#3B82F6', created_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'ekonomi', color: '#10B981', created_at: '2024-01-01T00:00:00Z' },
      { id: '3', name: 'data', color: '#F59E0B', created_at: '2024-01-01T00:00:00Z' },
      { id: '4', name: 'survei', color: '#EF4444', created_at: '2024-01-01T00:00:00Z' },
      { id: '5', name: 'sampling', color: '#8B5CF6', created_at: '2024-01-01T00:00:00Z' },
      { id: '6', name: 'pelatihan', color: '#EC4899', created_at: '2024-01-01T00:00:00Z' },
      { id: '7', name: 'metodologi', color: '#14B8A6', created_at: '2024-01-01T00:00:00Z' },
      { id: '8', name: 'analisis', color: '#F97316', created_at: '2024-01-01T00:00:00Z' },
      { id: '9', name: 'indonesia', color: '#06B6D4', created_at: '2024-01-01T00:00:00Z' },
      { id: '10', name: 'digital', color: '#84CC16', created_at: '2024-01-01T00:00:00Z' }
    ];

    return dummyTags;
  },

  async createTag(data: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    console.log('🔄 DUMMY API: createTag with data:', data);
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTag: Tag = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
    };
    return newTag;
  },

  async updateTag(id: string, data: Partial<Omit<Tag, 'id' | 'created_at'>>): Promise<Tag> {
    console.log('🔄 DUMMY API: updateTag with id:', id, 'data:', data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const updatedTag: Tag = {
      id,
      name: data.name || 'Unnamed Tag',
      color: data.color || '#000000',
      created_at: '2024-01-01T00:00:00Z',
    };
    return updatedTag;
  },

  async deleteTag(id: string): Promise<void> {
    console.log('🔄 DUMMY API: deleteTag with id:', id);
    await new Promise(resolve => setTimeout(resolve, 200));
    return;
  },
};

// Analytics API operations
export const analyticsApi = {
  async getKnowledgeAnalytics(): Promise<KnowledgeAnalytics> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getKnowledgeAnalytics');

    await new Promise(resolve => setTimeout(resolve, 600));

    const dummyAnalytics: KnowledgeAnalytics = {
      total_knowledge: 150,
      total_webinars: 75,
      total_published: 120,
      total_likes: 1234,
      total_dislikes: 45,
      total_views: 45678,
      upcoming_webinars: 8,
      top_subjects: [
        { subject: 'Ekonomi', count: 25 },
        { subject: 'Statistik', count: 20 },
        { subject: 'Teknologi', count: 18 },
        { subject: 'Demografi', count: 15 },
        { subject: 'Keuangan', count: 12 }
      ],
      popular_knowledge: []
    };

    return dummyAnalytics;
  },
};

// Schedule API operations
export const scheduleApi = {
  async getWebinarSchedule(): Promise<WebinarSchedule[]> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getWebinarSchedule');

    await new Promise(resolve => setTimeout(resolve, 400));

    const dummySchedule: WebinarSchedule[] = [
      {
        id: '1',
        webinar_id: '1',
        title: 'Webinar: Pengenalan Statistik Ekonomi',
        tgl_zoom: '2024-11-15T10:00:00Z',
        link_zoom: 'https://zoom.us/j/123456789',
        status: 'upcoming',
        participants_count: 0
      },
      {
        id: '2',
        webinar_id: '2',
        title: 'Workshop: Analisis Data dengan Python',
        tgl_zoom: '2024-11-18T14:00:00Z',
        link_zoom: 'https://zoom.us/j/987654321',
        status: 'upcoming',
        participants_count: 0
      },
      {
        id: '3',
        webinar_id: '3',
        title: 'Seminar: Big Data di BPS',
        tgl_zoom: '2024-11-10T09:00:00Z',
        link_zoom: 'https://zoom.us/j/555666777',
        status: 'ongoing',
        participants_count: 89
      }
    ];

    return dummySchedule;
  },

  async createWebinarSchedule(data: Omit<WebinarSchedule, 'id' | 'participants_count'>): Promise<WebinarSchedule> {
    console.log('🔄 DUMMY API: createWebinarSchedule with data:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newSchedule: WebinarSchedule = {
      id: Date.now().toString(),
      ...data,
      participants_count: 0,
    };
    return newSchedule;
  },

  async updateWebinarSchedule(id: string, data: Partial<WebinarSchedule>): Promise<WebinarSchedule> {
    console.log('🔄 DUMMY API: updateWebinarSchedule with id:', id, 'data:', data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const updatedSchedule: WebinarSchedule = {
      id,
      webinar_id: '1',
      title: 'Updated Webinar',
      tgl_zoom: '2024-11-15T10:00:00Z',
      link_zoom: 'https://zoom.us/j/123456789',
      status: 'upcoming',
      participants_count: 0,
      ...data
    };
    return updatedSchedule;
  },

  async deleteWebinarSchedule(id: string): Promise<void> {
    console.log('🔄 DUMMY API: deleteWebinarSchedule with id:', id);
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  },
};

// Settings API operations
export const settingsApi = {
  async getKnowledgeSettings(): Promise<KnowledgeCenterSettings> {
    // DUMMY DATA - Replace with actual API call when backend is ready
    console.log('🔄 DUMMY API: getKnowledgeSettings');

    await new Promise(resolve => setTimeout(resolve, 300));

    const dummySettings: KnowledgeCenterSettings = {
      rte_whitelist_tags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'div', 'span'],
      rte_allowed_attributes: {
        'a': ['href', 'target'],
        'img': ['src', 'alt', 'width', 'height'],
        'div': ['class'],
        'span': ['class']
      },
      max_file_size: 104857600, // 100MB in bytes
      allowed_file_types: {
        video: ['mp4', 'webm', 'avi'],
        pdf: ['pdf'],
        audio: ['mp3', 'wav', 'ogg'],
        image: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      },
      thumbnail_min_width: 800,
      thumbnail_min_height: 450,
      thumbnail_aspect_ratio: '16:9'
    };

    return dummySettings;
  },

  async updateKnowledgeSettings(data: Partial<KnowledgeCenterSettings>): Promise<KnowledgeCenterSettings> {
    console.log('🔄 DUMMY API: updateKnowledgeSettings with data:', data);
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedSettings: KnowledgeCenterSettings = {
      rte_whitelist_tags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'div', 'span'],
      rte_allowed_attributes: {
        'a': ['href', 'target'],
        'img': ['src', 'alt', 'width', 'height'],
        'div': ['class'],
        'span': ['class']
      },
      max_file_size: 104857600,
      allowed_file_types: {
        video: ['mp4', 'webm', 'avi'],
        pdf: ['pdf'],
        audio: ['mp3', 'wav', 'ogg'],
        image: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      },
      thumbnail_min_width: 800,
      thumbnail_min_height: 450,
      thumbnail_aspect_ratio: '16:9',
      ...data
    };

    return updatedSettings;
  },
};