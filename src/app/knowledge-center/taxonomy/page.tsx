'use client';

import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Upload,
  Download,
  Tag,
  Building,
  BookOpen,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  useSubjectManagement,
  usePenyelenggaraManagement,
  useTagManagement,
  useSubjects,
  usePenyelenggara,
  useTags,
} from '@/hooks/useKnowledgeCenter';
import { Subject, Penyelenggara, Tag as TagType } from '@/types/knowledge-center';

export default function TaxonomyManagerPage() {
  const [activeTab, setActiveTab] = useState<'subjects' | 'penyelenggara' | 'tags'>('subjects');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // State management hooks
  const { subjects } = useSubjects();
  const { penyelenggara } = usePenyelenggara();
  const { tags } = useTags();

  const {
    createSubject,
    updateSubject,
    deleteSubject,
    isCreating: isCreatingSubject,
    isUpdating: isUpdatingSubject,
    isDeleting: isDeletingSubject,
  } = useSubjectManagement();

  const {
    createPenyelenggara,
    updatePenyelenggara,
    deletePenyelenggara,
    isCreating: isCreatingPenyelenggara,
    isUpdating: isUpdatingPenyelenggara,
    isDeleting: isDeletingPenyelenggara,
  } = usePenyelenggaraManagement();

  const {
    createTag,
    updateTag,
    deleteTag,
    isCreating: isCreatingTag,
    isUpdating: isUpdatingTag,
    isDeleting: isDeletingTag,
  } = useTagManagement();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });

  const tabs = [
    { id: 'subjects', label: 'Subjects', icon: BookOpen, count: subjects?.length || 0 },
    { id: 'penyelenggara', label: 'Penyelenggara', icon: Building, count: penyelenggara?.length || 0 },
    { id: 'tags', label: 'Tags', icon: Tag, count: tags?.length || 0 },
  ];

  const filteredItems = () => {
    let items: any[] = [];
    switch (activeTab) {
      case 'subjects':
        items = subjects || [];
        break;
      case 'penyelenggara':
        items = penyelenggara || [];
        break;
      case 'tags':
        items = tags || [];
        break;
    }

    if (!searchQuery) return items;

    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', color: '#3B82F6' });
    setShowCreateModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      color: item.color || '#3B82F6',
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        // Update existing item
        switch (activeTab) {
          case 'subjects':
            await updateSubject({ id: editingItem.id, data: formData });
            break;
          case 'penyelenggara':
            await updatePenyelenggara({ id: editingItem.id, data: formData });
            break;
          case 'tags':
            await updateTag({ id: editingItem.id, data: formData });
            break;
        }
      } else {
        // Create new item
        switch (activeTab) {
          case 'subjects':
            await createSubject(formData);
            break;
          case 'penyelenggara':
            await createPenyelenggara(formData);
            break;
          case 'tags':
            await createTag(formData);
            break;
        }
      }

      setShowCreateModal(false);
      setFormData({ name: '', description: '', color: '#3B82F6' });
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (activeTab) {
        case 'subjects':
          await deleteSubject(id);
          break;
        case 'penyelenggara':
          await deletePenyelenggara(id);
          break;
        case 'tags':
          await deleteTag(id);
          break;
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleImportCSV = () => {
    // Implement CSV import functionality
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Process CSV file
        console.log('Import CSV:', file);
      }
    };
    input.click();
  };

  const handleExportCSV = () => {
    // Implement CSV export functionality
    const items = filteredItems();
    const csvContent = items.map(item =>
      `${item.name},${item.description || ''}`
    ).join('\n');

    const blob = new Blob([`Name,Description\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = isCreatingSubject || isCreatingPenyelenggara || isCreatingTag ||
                   isUpdatingSubject || isUpdatingPenyelenggara || isUpdatingTag ||
                   isDeletingSubject || isDeletingPenyelenggara || isDeletingTag;

  const renderCreateModal = () => {
    if (!showCreateModal) return null;

    const isTag = activeTab === 'tags';

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white border border-gray-200 rounded-lg w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Create ${activeTab.slice(0, -1)}`}
            </h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#2563eb)] focus:border-[var(--color-primary,#2563eb)] transition-all"
                placeholder={`Enter ${activeTab.slice(0, -1)} name`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#2563eb)] focus:border-[var(--color-primary,#2563eb)] transition-all"
                placeholder={`Enter ${activeTab.slice(0, -1)} description`}
              />
            </div>

            {isTag && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#2563eb)] focus:border-[var(--color-primary,#2563eb)] transition-all"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim()}
                className="px-4 py-2 bg-[var(--color-primary,#2563eb)] text-white rounded-lg hover:bg-[var(--color-primary-hover,#1d4ed8)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
              >
                {isLoading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    const items = filteredItems();

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                  Description
                </th>
                {activeTab === 'tags' && (
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                    Color
                  </th>
                )}
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {activeTab === 'tags' && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {item.description || '-'}
                    </span>
                  </td>
                  {activeTab === 'tags' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600">{item.color}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-gray-600 hover:text-[var(--color-primary,#2563eb)] transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-600 hover:text-red-500 transition-colors"
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

        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'subjects' && <BookOpen className="w-8 h-8 text-gray-400" />}
              {activeTab === 'penyelenggara' && <Building className="w-8 h-8 text-gray-400" />}
              {activeTab === 'tags' && <Tag className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} found</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first {activeTab.slice(0, -1)}.
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary,#2563eb)] text-white rounded-lg hover:bg-[var(--color-primary-hover,#1d4ed8)] transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create {activeTab.slice(0, -1)}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Taxonomy Manager</h1>
              <p className="text-gray-600">
                Manage subjects, organizations, and tags for knowledge organization
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleImportCSV}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-[var(--color-primary-50,rgba(37,99,235,0.08))] hover:border-[var(--color-primary,#2563eb)] transition-all"
              >
                <Upload className="w-4 h-4 text-gray-600" />
                Import CSV
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-[var(--color-primary-50,rgba(37,99,235,0.08))] hover:border-[var(--color-primary,#2563eb)] transition-all"
              >
                <Download className="w-4 h-4 text-gray-600" />
                Export CSV
              </button>

              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary,#2563eb)] text-white rounded-lg hover:bg-[var(--color-primary-hover,#1d4ed8)] transition-colors shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create {activeTab.slice(0, -1)}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-8 bg-gray-100 p-1 rounded-lg w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-[var(--color-primary,#2563eb)] hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`${
                    activeTab === tab.id
                      ? 'bg-[var(--color-primary,#2563eb)] text-white'
                      : 'bg-gray-200 text-gray-700'
                  } px-2 py-0.5 rounded-full text-xs transition-colors`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#2563eb)] focus:border-[var(--color-primary,#2563eb)] transition-all"
            />
          </div>
        </div>

        {/* Info Banner */}
        {activeTab === 'subjects' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">About Subjects</h3>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  Subjects represent the official BPS nomenclature for knowledge categorization.
                  These should align with the standard economic and statistical classifications used by BPS.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'penyelenggara' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">About Organizations</h3>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  Organizations represent the institutions that organize knowledge content,
                  such as Pusdiklat, BPS regional offices, and other training providers.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">About Tags</h3>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  Tags provide flexible categorization and help users discover relevant content.
                  Use descriptive tags that complement the formal subject classification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {renderTable()}
      </main>

      {/* Create/Edit Modal */}
      {renderCreateModal()}
    </div>
  );
}