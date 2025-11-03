// Knowledge Center Types
// Based on prompt_templates/knowledge-center-specs.md

export type KnowledgeType = 'webinar' | 'konten';

export type MediaType = 'video' | 'pdf' | 'audio';

export type KnowledgeStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type SortOption = 'newest' | 'most_liked' | 'most_viewed' | 'upcoming_webinar';

export interface KnowledgeCommon {
  id?: string;
  title: string;
  description: string;
  subject: string; // nomenklatur BPS
  knowledge_type: KnowledgeType;
  penyelenggara: string; // pusdiklat, bps sumbar, bps jakarta, ...
  thumbnail: string; // url/blob
  author: string; // user ref
  like_count: number;
  dislike_count: number;
  view_count: number;
  tags: string[];
  published_at?: string; // ISO datetime
  status?: KnowledgeStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Webinar extends KnowledgeCommon {
  tgl_zoom?: string;
  link_zoom?: string;
  link_record?: string;
  link_youtube?: string;
  link_vb?: string;
  file_notulensi_pdf?: string; // URL to single PDF
  content_richtext?: string; // sanitized HTML
  jumlah_jp?: number;
  gojags_ref?: string;
}

export interface Konten extends KnowledgeCommon {
  media_resource?: string; // single: video|pdf|audio
  media_type?: MediaType;
  content_richtext?: string; // sanitized HTML
}

export type Knowledge = Webinar | Konten;

// Taxonomy types
export interface Subject {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Penyelenggara {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

// Filter types
export interface KnowledgeFilters {
  subject?: string[];
  penyelenggara?: string[];
  knowledge_type?: KnowledgeType[];
  media_type?: MediaType[];
  tags?: string[];
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface KnowledgeQueryParams extends KnowledgeFilters, PaginationParams {
  sort?: SortOption;
}

// API Response types
export interface KnowledgeListResponse {
  data: Knowledge[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface KnowledgeDetailResponse {
  data: Knowledge;
}

// Analytics types
export interface KnowledgeAnalytics {
  total_knowledge: number;
  total_webinars: number;
  total_published: number;
  total_likes: number;
  total_dislikes: number;
  total_views: number;
  upcoming_webinars: number;
  top_subjects: Array<{
    subject: string;
    count: number;
  }>;
  popular_knowledge: Knowledge[];
}

// Create Knowledge types
export type CreateKnowledgeStep = 1 | 2 | 3 | 4;

export interface CreateKnowledgeFormData {
  // Step 1
  knowledge_type?: KnowledgeType;

  // Step 2 - Common fields
  title: string;
  description: string;
  subject: string;
  penyelenggara: string;
  thumbnail?: File | string;
  author: string;
  tags: string[];
  published_at?: string;
  status: KnowledgeStatus;

  // Step 3A - Webinar specific
  tgl_zoom?: string;
  link_zoom?: string;
  link_record?: string;
  link_youtube?: string;
  link_vb?: string;
  file_notulensi_pdf?: File;
  content_richtext?: string;
  jumlah_jp?: number;
  gojags_ref?: string;

  // Step 3B - Konten specific
  media_resource?: File;
  media_type?: MediaType;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Component props types
export interface KnowledgeCardProps {
  knowledge: Knowledge;
  showActions?: boolean;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onShare?: (knowledge: Knowledge) => void;
  className?: string;
}

export interface MediaViewerProps {
  src: string;
  type: MediaType;
  title?: string;
  className?: string;
}

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Schedule types
export interface WebinarSchedule {
  id: string;
  webinar_id: string;
  title: string;
  tgl_zoom: string;
  link_zoom?: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  participants_count?: number;
}

// Settings types
export interface KnowledgeCenterSettings {
  rte_whitelist_tags: string[];
  rte_allowed_attributes: Record<string, string[]>;
  max_file_size: number; // in bytes
  allowed_file_types: {
    video: string[];
    pdf: string[];
    audio: string[];
    image: string[];
  };
  thumbnail_min_width: number;
  thumbnail_min_height: number;
  thumbnail_aspect_ratio: string;
}