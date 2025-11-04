'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale/id';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  Download,
  RefreshCw,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import Link from 'next/link';
import KnowledgeCard from '@/components/knowledge-center/KnowledgeCard';
import { useKnowledge, useUpdateKnowledge, useDeleteKnowledge } from '@/hooks/useKnowledgeCenter';
import { Knowledge, KnowledgeStatus, KnowledgeType } from '@/types/knowledge-center';

export default function ManageKnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const {
    data: knowledgeItems,
    isLoading,
    error,
    refetch,
  } = useKnowledge({
    search: searchQuery || undefined,
    limit: 50,
  });

  const { updateKnowledge, isUpdating } = useUpdateKnowledge();
  const { deleteKnowledge, isDeleting } = useDeleteKnowledge();

  // Filter knowledge items
  const filteredItems = useMemo(() => {
    if (!knowledgeItems) return [];

    return knowledgeItems.filter(item => {
      const matchesSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchesType = selectedType === 'all' || item.knowledge_type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [knowledgeItems, searchQuery, selectedStatus, selectedType]);

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'bg-gray-100 text-gray-700' },
    { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
    { value: 'published', label: 'Published', color: 'bg-green-100 text-green-700' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-700' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'konten', label: 'Konten' },
  ];

  const handleStatusChange = async (id: string, newStatus: KnowledgeStatus) => {
    try {
      await updateKnowledge({
        id,
        data: { status: newStatus }
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this knowledge item?')) {
      try {
        await deleteKnowledge(id);
      } catch (error) {
        console.error('Failed to delete knowledge:', error);
      }
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedItems.length === 0) return;

    const confirmMessage = action === 'delete'
      ? `Are you sure you want to delete ${selectedItems.length} items?`
      : `Are you sure you want to ${action} ${selectedItems.length} items?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      for (const id of selectedItems) {
        if (action === 'delete') {
          await deleteKnowledge(id);
        } else if (action === 'publish') {
          await updateKnowledge({ id, data: { status: 'published' } });
        } else if (action === 'unpublish') {
          await updateKnowledge({ id, data: { status: 'draft' } });
        }
      }
      setSelectedItems([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error(`Failed to ${action} items:`, error);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id!));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: KnowledgeStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'scheduled': return 'bg-gray-100 text-gray-700';
      case 'published': return 'bg-gray-100 text-gray-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: KnowledgeStatus) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'published': return <Eye className="w-4 h-4" />;
      case 'archived': return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Knowledge</h1>
              <p className="text-gray-600">
                Admin panel for managing all knowledge content
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <Link
                href="/knowledge-center/create"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Knowledge
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Knowledge</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredItems.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredItems.filter(item => item.status === 'published').length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredItems.filter(item => item.status === 'draft').length}
                  </p>
                </div>
                <Edit className="w-8 h-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Webinars</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredItems.filter(item => item.knowledge_type === 'webinar').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Controls */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search knowledge by title, description, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <span className="text-gray-900 font-medium">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('unpublish')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Unpublish
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-2 text-red-600 border border-gray-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Knowledge Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Knowledge
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Stats
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Published
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && (
                  [...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                    </tr>
                  ))
                )}

                {!isLoading && !error && filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id!)}
                        onChange={() => handleSelectItem(item.id!)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div>
                          <Link
                            href={`/knowledge-center/${item.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {item.title}
                          </Link>
                          <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {item.knowledge_type === 'webinar' ? 'Webinar' : 'Article'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.author}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id!, e.target.value as KnowledgeStatus)}
                          disabled={isUpdating}
                          className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getStatusColor(item.status!)}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          👍 {item.like_count}
                        </span>
                        <span className="flex items-center gap-1">
                          👎 {item.dislike_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(item.published_at || item.created_at || ''), {
                        addSuffix: true,
                        locale: id
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/knowledge-center/${item.id}`}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/knowledge-center/${item.id}/edit`}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          disabled={isDeleting}
                          className="p-1 text-gray-600 hover:text-red-600 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-6">Failed to load knowledge items</p>
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredItems.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">No knowledge found</h3>
              <p className="text-gray-600 mb-8">
                {searchQuery || selectedStatus !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first knowledge item'}
              </p>
              <Link
                href="/knowledge-center/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Knowledge
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}