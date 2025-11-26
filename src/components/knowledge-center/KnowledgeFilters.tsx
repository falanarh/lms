'use client';

import { useState } from 'react';
import { ensureArray, safeFilter } from '@/utils/array-fix-utils';
import { X, ChevronDown, Filter, Search } from 'lucide-react';
import {
  ContentType,
  type KnowledgeFilters,
  KNOWLEDGE_TYPES,
  CONTENT_TYPES,
} from '@/types/knowledge-center';
import { useKnowledgeSubjects } from '@/hooks/useKnowledgeSubject';
import { PENYELENGGARA_OPTIONS } from '@/constants/knowledge';

interface KnowledgeFiltersProps {
  filters: KnowledgeFilters;
  onFiltersChange: (filters: KnowledgeFilters) => void;
  className?: string;
}

export default function KnowledgeFilters({
  filters,
  onFiltersChange,
  className = ''
}: KnowledgeFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: subjects = [] } = useKnowledgeSubjects();
  const penyelenggara = PENYELENGGARA_OPTIONS;
  const tags: { id: string; name: string }[] = [];

  const handleFilterChange = (key: keyof KnowledgeFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleArrayFilterChange = (
    key: keyof KnowledgeFilters,
    value: string,
    isChecked: boolean
  ) => {
    const currentArray = ensureArray<string>(filters[key]);
    const newArray = isChecked
      ? [...currentArray, value]
      : safeFilter<string>(currentArray, (item) => item !== value);

    onFiltersChange({
      ...filters,
      [key]: newArray,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  });

  const knowledgeTypes: { value: typeof KNOWLEDGE_TYPES.WEBINAR | typeof KNOWLEDGE_TYPES.CONTENT; label: string }[] = [
    { value: KNOWLEDGE_TYPES.WEBINAR, label: 'Webinar' },
    { value: KNOWLEDGE_TYPES.CONTENT, label: 'Content' },
  ];

  const mediaTypes: { value: ContentType; label: string }[] = [
    { value: CONTENT_TYPES.VIDEO, label: 'Video' },
    { value: CONTENT_TYPES.FILE, label: 'File' },
    { value: CONTENT_TYPES.PODCAST, label: 'Podcast' },
    { value: CONTENT_TYPES.ARTICLE, label: 'Article' },
  ];

  const knowledgeTypeFilter = Array.isArray(filters.knowledgeType)
    ? filters.knowledgeType
    : filters.knowledgeType
    ? [filters.knowledgeType]
    : [];

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
      <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const Checkbox = ({
    id,
    label,
    checked,
    onChange,
    count
  }: {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    count?: number;
  }) => (
    <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </label>
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                <Search className="w-3 h-3" />
                "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {knowledgeTypeFilter.map(type => (
              <div
                key={type}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {knowledgeTypes.find(t => t.value === type)?.label}
                <button
                  onClick={() => handleArrayFilterChange('knowledgeType', type, false)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {filters.mediaType?.map(type => (
              <div
                key={type}
                className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
              >
                {mediaTypes.find(t => t.value === type)?.label}
                <button
                  onClick={() => handleArrayFilterChange('mediaType', type, false)}
                  className="hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {filters.subject?.map(subject => (
              <div
                key={subject}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
              >
                {subject}
                <button
                  onClick={() => handleArrayFilterChange('subject', subject, false)}
                  className="hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {filters.penyelenggara?.map(penyelenggara => (
              <div
                key={penyelenggara}
                className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
              >
                {penyelenggara}
                <button
                  onClick={() => handleArrayFilterChange('penyelenggara', penyelenggara, false)}
                  className="hover:text-orange-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {filters.tags?.map(tag => (
              <div
                key={tag}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
                <button
                  onClick={() => handleArrayFilterChange('tags', tag, false)}
                  className="hover:text-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Knowledge Type */}
          <FilterSection title="Tipe Knowledge">
            {knowledgeTypes.map(type => (
              <Checkbox
                key={type.value}
                id={`type-${type.value}`}
                label={type.label}
                checked={knowledgeTypeFilter.includes(type.value)}
                onChange={(checked) =>
                  handleArrayFilterChange('knowledgeType', type.value, checked)
                }
              />
            ))}
          </FilterSection>

          {/* Media Type */}
          <FilterSection title="Media Type">
            {mediaTypes.map(type => (
              <Checkbox
                key={type.value}
                id={`media-${type.value}`}
                label={type.label}
                checked={filters.mediaType?.includes(type.value) || false}
                onChange={(checked) =>
                  handleArrayFilterChange('mediaType', type.value, checked)
                }
              />
            ))}
          </FilterSection>

          {/* Subject */}
          {subjects.length > 0 && (
            <FilterSection title="Subject (Nomenklatur BPS)">
              {subjects.slice(0, 10).map(subject => (
                <Checkbox
                  key={subject.id}
                  id={`subject-${subject.id}`}
                  label={subject.name}
                  checked={filters.subject?.includes(subject.name) || false}
                  onChange={(checked) =>
                    handleArrayFilterChange('subject', subject.name, checked)
                  }
                />
              ))}
              {subjects.length > 10 && (
                <div className="text-xs text-gray-500 mt-2">
                  +{subjects.length - 10} more subjects available
                </div>
              )}
            </FilterSection>
          )}

          {/* Penyelenggara */}
          {penyelenggara.length > 0 && (
            <FilterSection title="Penyelenggara">
              {penyelenggara.slice(0, 8).map(org => (
                <Checkbox
                  key={org.id}
                  id={`penyelenggara-${org.id}`}
                  label={org.name}
                  checked={filters.penyelenggara?.includes(org.name) || false}
                  onChange={(checked) =>
                    handleArrayFilterChange('penyelenggara', org.name, checked)
                  }
                />
              ))}
              {penyelenggara.length > 8 && (
                <div className="text-xs text-gray-500 mt-2">
                  +{penyelenggara.length - 8} more penyelenggara available
                </div>
              )}
            </FilterSection>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <FilterSection title="Tags">
              {tags.slice(0, 12).map(tag => (
                <Checkbox
                  key={tag.id}
                  id={`tag-${tag.id}`}
                  label={`#${tag.name}`}
                  checked={filters.tags?.includes(tag.name) || false}
                  onChange={(checked) =>
                    handleArrayFilterChange('tags', tag.name, checked)
                  }
                />
              ))}
              {tags.length > 12 && (
                <div className="text-xs text-gray-500 mt-2">
                  +{tags.length - 12} more tags available
                </div>
              )}
            </FilterSection>
          )}
        </div>
      )}
    </div>
  );
}