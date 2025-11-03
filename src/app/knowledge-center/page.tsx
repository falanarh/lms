'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Calendar,
  Clock,
  TrendingUp,
  Eye,
  ThumbsUp,
  Users,
  BookOpen,
  Video,
  FileText,
  Headphones,
  Filter,
  ChevronDown,
  ChevronRight,
  Star,
  Share2,
  ExternalLink,
  Play,
  Database,
  BarChart3,
  Globe,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Target,
  Cpu,
  Building2,
  MapPin,
  Users2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import KnowledgeCard from '@/components/knowledge-center/KnowledgeCard';
import { Pagination } from '@/components/shared/Pagination/Pagination';
import { useKnowledge, useWebinarSchedule, useKnowledgeAnalytics } from '@/hooks/useKnowledgeCenter';
import { KnowledgeType, SortOption, KnowledgeQueryParams, Knowledge } from '@/types/knowledge-center';

// Sample data generator
const generateSampleKnowledgeData = (): Knowledge[] => {
  const categories = [
    'Statistik Ekonomi', 'Data Demografi', 'Teknologi Informasi', 'Metodologi Penelitian',
    'Analisis Spasial', 'Big Data Analytics', 'Machine Learning', 'Data Visualization',
    'Survey Methods', 'Quality Control', 'Sampling Techniques', 'Time Series Analysis',
    'Social Research', 'Business Intelligence', 'Data Mining', 'Predictive Analytics',
    'Database Management', 'Cloud Computing', 'Cybersecurity', 'Artificial Intelligence',
    'Project Management', 'Leadership Development', 'Communication Skills', 'Public Speaking'
  ];

  const penyelenggaraList = [
    'Pusdiklat BPS', 'BPS Pusat', 'BPS Provinsi DKI Jakarta', 'BPS Provinsi Jawa Barat',
    'BPS Provinsi Jawa Tengah', 'BPS Provinsi Jawa Timur', 'BPS Provinsi Sumatera Utara',
    'World Bank', 'UN Statistics Division', 'ASEAN Statistics', 'Asia Development Bank'
  ];

  const titles = {
    webinar: [
      'Introduction to Statistical Analysis Methods', 'Advanced Machine Learning for Data Scientists',
      'Big Data Technologies in Government Statistics', 'Effective Data Visualization Techniques',
      'Modern Survey Methodology and Best Practices', 'Time Series Forecasting for Economic Indicators',
      'GIS and Spatial Analysis for Planning', 'Cloud Computing for Statistical Offices',
      'Data Quality Management Framework', 'Artificial Intelligence in Official Statistics'
    ],
    video: [
      'Getting Started with R Programming', 'Python for Data Analysis Beginners',
      'Excel Advanced Statistical Functions', 'Tableau Dashboard Creation Tutorial',
      'SQL for Data Analysts', 'Power BI Complete Guide', 'Statistical Software Comparison',
      'Data Cleaning Best Practices', 'Introduction to SPSS', 'Advanced Excel Techniques'
    ],
    pdf: [
      'Statistical Methods Handbook 2024', 'Guidelines for Census Implementation',
      'Quality Assurance in Data Collection', 'Sampling Design Manual', 'Statistical Yearbook 2023',
      'Economic Indicators Methodology', 'Population Projection Techniques', 'Price Index Calculation Guide',
      'Labor Force Survey Methods', 'Household Budget Survey Guidelines'
    ],
    audio: [
      'Interview with Chief Statistician', 'Future of Official Statistics Podcast',
      'Data Science Career Insights', 'Statistical Innovation Stories', 'Success Stories from Field Officers'
    ]
  };

  const descriptions = {
    webinar: 'Join this comprehensive webinar to learn the latest methodologies and best practices in statistical analysis and data management.',
    video: 'Step-by-step video tutorial covering essential concepts and practical applications for data professionals.',
    pdf: 'Comprehensive guide and reference manual for implementing statistical methodologies and ensuring data quality.',
    audio: 'Expert insights and discussions on current trends and challenges in official statistics and data science.'
  };

  const sampleData: Knowledge[] = [];

  // Generate 150 items for pagination demo
  for (let i = 1; i <= 150; i++) {
    const typeOptions: KnowledgeType[] = ['webinar', 'konten'];
    const type = typeOptions[Math.floor(Math.random() * typeOptions.length)];
    const mediaType = type === 'webinar' ? null :
      ['video', 'pdf', 'audio'][Math.floor(Math.random() * 3)];

    const category = categories[Math.floor(Math.random() * categories.length)];
    const penyelenggara = penyelenggaraList[Math.floor(Math.random() * penyelenggaraList.length)];

    let title;
    let description;
    if (type === 'webinar') {
      const webinarTitles = titles.webinar;
      title = webinarTitles[Math.floor(Math.random() * webinarTitles.length)];
      description = descriptions.webinar;
    } else {
      const titleList = titles[mediaType as keyof typeof titles];
      title = titleList[Math.floor(Math.random() * titleList.length)];
      description = descriptions[mediaType as keyof typeof descriptions];
    }

    // Add variation to titles
    title = `${title} - Part ${Math.ceil(i / 15)}`;

    sampleData.push({
      id: i.toString(),
      title,
      description,
      knowledge_type: type,
      subject: category,
      penyelenggara,
      author: `Dr. ${['Anderson', 'Johnson', 'Williams', 'Brown', 'Davis'][Math.floor(Math.random() * 5)]}`,
      thumbnail: `https://picsum.photos/seed/${title.replace(/\s+/g, '-')}-${i}/400/225.jpg`,
      view_count: Math.floor(Math.random() * 5000) + 100,
      like_count: Math.floor(Math.random() * 200) + 5,
      dislike_count: Math.floor(Math.random() * 20),
      published_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      media_type: mediaType,
      tags: Math.random() > 0.5 ?
        [`statistics`, `data`, `analysis`, `research`, `methods`].slice(0, Math.floor(Math.random() * 3) + 1) :
        undefined,
      duration: type === 'video' ? `${Math.floor(Math.random() * 120) + 10} min` : undefined,
      ...(type === 'webinar' && {
        tgl_zoom: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        link_zoom: Math.random() > 0.5 ? `https://zoom.us/webinar/${i}` : undefined,
        jumlah_jp: Math.floor(Math.random() * 8) + 1
      })
    });
  }

  return sampleData;
};

// Simplified Knowledge Card Component
function SimplifiedKnowledgeCard({ knowledge }: { knowledge: Knowledge }) {
  const [imageError, setImageError] = useState(false);

  const getMediaIcon = () => {
    if (knowledge.knowledge_type === 'webinar') {
      return <Calendar className="w-4 h-4" />;
    }
    const mediaType = (knowledge as any).media_type;
    switch (mediaType) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getMediaColor = () => {
    if (knowledge.knowledge_type === 'webinar') {
      return 'bg-purple-100 text-purple-700';
    }
    const mediaType = (knowledge as any).media_type;
    switch (mediaType) {
      case 'video': return 'bg-red-100 text-red-700';
      case 'pdf': return 'bg-blue-100 text-blue-700';
      case 'audio': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Generate varied category badge colors
  const getCategoryBadgeStyle = (category: string) => {
    const categoryColors = [
      'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
      'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
      'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
      'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
      'bg-gradient-to-r from-green-500 to-green-600 text-white',
      'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      'bg-gradient-to-r from-red-500 to-red-600 text-white',
      'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
      'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white',
      'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
      'bg-gradient-to-r from-rose-500 to-rose-600 text-white',
      'bg-gradient-to-r from-violet-500 to-violet-600 text-white',
      'bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white',
      'bg-gradient-to-r from-sky-500 to-sky-600 text-white',
      'bg-gradient-to-r from-lime-500 to-lime-600 text-white',
      'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
      'bg-gradient-to-r from-slate-500 to-slate-600 text-white',
      'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
      'bg-gradient-to-r from-zinc-500 to-zinc-600 text-white',
      'bg-gradient-to-r from-neutral-500 to-neutral-600 text-white',
      'bg-gradient-to-r from-stone-500 to-stone-600 text-white'
    ];

    // Use category name to consistently pick the same color for the same category
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hash % categoryColors.length;
    return categoryColors[colorIndex];
  };

  const getMediaTypeLabel = () => {
    if (knowledge.knowledge_type === 'webinar') return 'Webinar';
    const mediaType = (knowledge as any).media_type;
    switch (mediaType) {
      case 'video': return 'Video';
      case 'pdf': return 'PDF';
      case 'audio': return 'Podcast';
      default: return 'Article';
    }
  };

  return (
    <Link href={`/knowledge-center/${knowledge.id}`} className="block group h-full">
      <article className="h-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[var(--color-primary,#2563eb)] transition-all duration-200 flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-100 flex-shrink-0">
          {!imageError && knowledge.thumbnail ? (
            <img
              src={knowledge.thumbnail}
              alt={knowledge.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-gray-400">
                <BookOpen className="w-8 h-8" />
              </div>
            </div>
          )}

          {/* Type badge overlay */}
          <div className="absolute top-2 left-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getMediaColor()} bg-white/90 backdrop-blur-sm`}>
              {getMediaIcon()}
              <span>{getMediaTypeLabel()}</span>
            </div>
          </div>

          {/* Subject badge overlay */}
          {knowledge.subject && (
            <div className="absolute top-2 right-2">
              <div className={`px-2 py-1 rounded-md text-xs font-medium text-white shadow-lg ${getCategoryBadgeStyle(knowledge.subject)}`}>
                {knowledge.subject}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-[var(--color-primary,#2563eb)] transition-colors leading-snug">
            {knowledge.title}
          </h3>

          {/* Provider */}
          <div className="text-sm text-gray-600 mb-3">
            {knowledge.penyelenggara}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{knowledge.view_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              <span>{knowledge.like_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(knowledge.created_at).toLocaleDateString('id-ID', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function KnowledgeHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<KnowledgeType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Generate sample data
  const allKnowledgeData = useMemo(() => generateSampleKnowledgeData(), []);

  // Filter and sort data based on current filters
  const filteredAndSortedData = useMemo(() => {
    let filtered = allKnowledgeData;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.knowledge_type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.subject === selectedCategory);
    }

    // Sort data
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'most_liked':
        filtered.sort((a, b) => b.like_count - a.like_count);
        break;
      case 'most_viewed':
        filtered.sort((a, b) => b.view_count - a.view_count);
        break;
      case 'upcoming_webinar':
        filtered.sort((a, b) => {
          const aDate = a.knowledge_type === 'webinar' ? new Date((a as any).tgl_zoom || 0) : new Date(0);
          const bDate = b.knowledge_type === 'webinar' ? new Date((b as any).tgl_zoom || 0) : new Date(0);
          return bDate.getTime() - aDate.getTime();
        });
        break;
      case 'trending':
        filtered.sort((a, b) => (b.view_count + b.like_count * 10) - (a.view_count + a.like_count * 10));
        break;
    }

    return filtered;
  }, [allKnowledgeData, searchQuery, selectedType, selectedCategory, sortBy]);

  // Pagination
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredAndSortedData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedCategory, sortBy]);

  const {
    data: knowledgeItems,
    isLoading,
    error,
    total,
  } = useKnowledge({
    search: searchQuery || undefined,
    knowledge_type: selectedType !== 'all' ? [selectedType] : undefined,
    subject: selectedCategory !== 'all' ? [selectedCategory] : undefined,
    sort: sortBy,
    limit: 12,
  });

  const { schedule: upcomingWebinars } = useWebinarSchedule();
  const { analytics } = useKnowledgeAnalytics();

  // Create sample analytics based on our data
  const sampleAnalytics = useMemo(() => ({
    total_knowledge: allKnowledgeData.length,
    total_webinars: allKnowledgeData.filter(item => item.knowledge_type === 'webinar').length,
    total_views: allKnowledgeData.reduce((sum, item) => sum + item.view_count, 0),
    total_likes: allKnowledgeData.reduce((sum, item) => sum + item.like_count, 0),
    top_subjects: allKnowledgeData.reduce((acc, item) => {
      const subject = item.subject;
      const existing = acc.find(s => s.subject === subject);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ subject, count: 1 });
      }
      return acc;
    }, [] as { subject: string; count: number }[])
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }), [allKnowledgeData]);

  // Filter upcoming webinars from sample data (next 7 days only)
  const upcomingWebinarsList = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return allKnowledgeData
      .filter(item =>
        item.knowledge_type === 'webinar' &&
        (item as any).tgl_zoom &&
        new Date((item as any).tgl_zoom) > now &&
        new Date((item as any).tgl_zoom) <= sevenDaysFromNow
      )
      .slice(0, 3);
  }, [allKnowledgeData]);

  // Get popular content (by views) from sample data
  const popularItems = useMemo(() => {
    return [...allKnowledgeData]
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 4);
  }, [allKnowledgeData]);

  // Get recent content from sample data
  const recentItems = useMemo(() => {
    return [...allKnowledgeData]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);
  }, [allKnowledgeData]);

  // Get unique categories/subjects from sample data
  const categories = useMemo(() => {
    const subjects = [...new Set(allKnowledgeData.map(item => item.subject).filter(Boolean))];
    return subjects.slice(0, 8); // Limit to 8 categories
  }, [allKnowledgeData]);

  // Get icon for category based on name
  const getCategoryIcon = (category: string) => {
    const name = category.toLowerCase();
    if (name.includes('statistik') || name.includes('data') || name.includes('database')) return Database;
    if (name.includes('ekonomi') || name.includes('business') || name.includes('finance')) return BarChart3;
    if (name.includes('global') || name.includes('internasional') || name.includes('dunia')) return Globe;
    if (name.includes('kerja') || name.includes('pekerjaan') || name.includes('karir')) return Briefcase;
    if (name.includes('pelatihan') || name.includes('education') || name.includes('belajar')) return GraduationCap;
    if (name.includes('inovasi') || name.includes('teknologi') || name.includes('riset')) return Lightbulb;
    if (name.includes('target') || name.includes('goal') || name.includes('sasaran')) return Target;
    if (name.includes('sistem') || name.includes('komputer') || name.includes('it')) return Cpu;
    if (name.includes('organisasi') || name.includes('instansi') || name.includes('lembaga')) return Building2;
    if (name.includes('wilayah') || name.includes('daerah') || name.includes('regional')) return MapPin;
    if (name.includes('sosial') || name.includes('masyarakat') || name.includes('people')) return Users2;
    return BookOpen; // Default icon
  };

  
  const sortOptions = [
    { value: 'newest', label: 'Recently Added' },
    { value: 'most_liked', label: 'Most Popular' },
    { value: 'most_viewed', label: 'Most Viewed' },
    { value: 'upcoming_webinar', label: 'Upcoming Events' },
    { value: 'trending', label: 'Trending Now' },
  ];

  const isLoadingData = false; // Using sample data, no loading needed

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Full Screen Search */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50,rgba(37,99,235,0.08))] via-transparent to-[var(--color-primary-50,rgba(37,99,235,0.05))] opacity-60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Knowledge Center
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Pusat pembelajaran dan berbagi pengetahuan untuk Pusdiklat BPS
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{sampleAnalytics.total_knowledge}+ Resources</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{sampleAnalytics.total_views.toLocaleString()}+ Views</span>
              </div>
            </div>
          </div>

          {/* Main Search Component - Full Width */}
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-6">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Cari ilmu pengetahuan, subjek, atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-6 text-xl border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-50,rgba(37,99,235,0.15))] focus:border-[var(--color-primary,#2563eb)] transition-all duration-200 shadow-sm"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>


            {/* Popular Searches */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>Populer:</span>
              <button className="text-[var(--color-primary,#2563eb)] hover:text-[var(--color-primary-hover,#1d4ed8)] transition-colors">Statistik</button>
              <span className="text-gray-300">•</span>
              <button className="text-[var(--color-primary,#2563eb)] hover:text-[var(--color-primary-hover,#1d4ed8)] transition-colors">Machine Learning</button>
              <span className="text-gray-300">•</span>
              <button className="text-[var(--color-primary,#2563eb)] hover:text-[var(--color-primary-hover,#1d4ed8)] transition-colors">Web Development</button>
              <span className="text-gray-300">•</span>
              <button className="text-[var(--color-primary,#2563eb)] hover:text-[var(--color-primary-hover,#1d4ed8)] transition-colors">Data Science</button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
            <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
              <div className="text-3xl font-bold text-gray-900 mb-2">{sampleAnalytics.total_knowledge}</div>
              <div className="text-sm text-gray-600">Total Konten</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
              <div className="text-3xl font-bold text-gray-900 mb-2">{sampleAnalytics.total_webinars}</div>
              <div className="text-sm text-gray-600">Webinar</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
              <div className="text-3xl font-bold text-gray-900 mb-2">{(sampleAnalytics.total_views / 1000).toFixed(1)}k</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
              <div className="text-3xl font-bold text-gray-900 mb-2">{sampleAnalytics.total_likes}</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-lg font-semibold text-gray-900">Explore</h2>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/knowledge-center" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Beranda
                </Link>
                <Link href="/knowledge-center/schedule" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Jadwal
                </Link>
                <Link href="/knowledge-center/explore" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Jelajahi
                </Link>
              </nav>
            </div>
            <Link
                href="/knowledge-center/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary,#2563eb)] text-white rounded-lg hover:bg-[var(--color-primary-hover,#1d4ed8)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create
              </Link>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Modern Categories Only */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-24">
              {/* Modern Categories Sidebar */}
              {categories.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 px-2">Kategori</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                        selectedCategory === 'all'
                          ? 'bg-[var(--color-primary,#2563eb)] text-white shadow-sm transform scale-[1.02]'
                          : 'text-gray-700 hover:bg-[var(--color-primary-50,rgba(37,99,235,0.08))] hover:text-[var(--color-primary,#2563eb)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md transition-colors ${
                          selectedCategory === 'all'
                            ? 'bg-white/20'
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Semua Kategori</div>
                          <div className={`text-xs mt-0.5 ${
                            selectedCategory === 'all' ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {knowledgeItems?.length || 0} konten
                          </div>
                        </div>
                      </div>
                    </button>
                    {categories.map((category) => {
                      const count = knowledgeItems?.filter(item => item.subject === category).length || 0;
                      const Icon = getCategoryIcon(category);
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                            selectedCategory === category
                              ? 'bg-[var(--color-primary,#2563eb)] text-white shadow-sm transform scale-[1.02]'
                              : 'text-gray-700 hover:bg-[var(--color-primary-50,rgba(37,99,235,0.08))] hover:text-[var(--color-primary,#2563eb)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-md transition-colors ${
                              selectedCategory === category
                                ? 'bg-white/20'
                                : 'bg-gray-100 group-hover:bg-gray-200'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm line-clamp-1">{category}</div>
                              <div className={`text-xs mt-0.5 ${
                                selectedCategory === category ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {count} konten
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Filter and Sort Bar */}
            <section className="mb-8">
              <div className="flex flex-col gap-4">
                {/* Results Count */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {searchQuery ? `Hasil untuk "${searchQuery}"` : 'Semua Konten'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filteredAndSortedData.length} {filteredAndSortedData.length === 1 ? 'item' : 'items'} ditemukan
                  </p>
                </div>

                {/* Modern Horizontal Filters */}
                <div className="flex flex-col gap-4">
                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-500">Sort:</span>
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value as SortOption)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2 ${
                            sortBy === option.value
                              ? 'bg-gradient-to-r from-[var(--color-primary,#2563eb)] to-[var(--color-primary-hover,#1d4ed8)] text-white border-[var(--color-primary,#2563eb)] shadow-lg transform scale-105'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--color-primary-50,rgba(37,99,235,0.3))] hover:text-[var(--color-primary,#2563eb)] hover:shadow-md'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex items-center gap-4 text-sm">
                    {searchQuery && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        <span className="text-gray-700 font-medium">
                          Searching: "{searchQuery}"
                        </span>
                      </div>
                    )}
                    {(selectedCategory !== 'all' || selectedType !== 'all') && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-700 font-medium">
                          {selectedCategory !== 'all' && selectedType !== 'all'
                            ? `${selectedCategory} • ${selectedType}`
                            : selectedCategory !== 'all'
                              ? selectedCategory
                              : selectedType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

  
        {/* Loading State */}
        {isLoadingData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Failed to load knowledge items. Please try again.</p>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Knowledge Grid */}
        {currentItems && currentItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((item) => (
                <SimplifiedKnowledgeCard key={item.id} knowledge={item} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  siblingCount={1}
                  boundaryCount={1}
                  size="md"
                  alignment="center"
                />
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoadingData && currentItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms or filters'
                : 'No knowledge items available'}
            </p>
            <Link
              href="/knowledge-center/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary,#2563eb)] text-white rounded-lg hover:bg-[var(--color-primary-hover,#1d4ed8)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Knowledge
            </Link>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  );
}