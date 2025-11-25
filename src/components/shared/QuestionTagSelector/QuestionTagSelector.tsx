"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button/Button";
import {
  Search,
  Plus,
  Check,
  X,
  Tag,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useCreateQuestionTag, useQuestionTags } from "@/hooks/useQuestionTags";
import { QuestionTags } from "@/api/questionTag";

interface QuestionTagSelectorProps {
  selectedTagId?: string;
  onTagSelect: (tagId: string, tagName: string) => void;
  disabled?: boolean;
}

export const QuestionTagSelector = ({
  selectedTagId,
  onTagSelect,
  disabled = false,
}: QuestionTagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const perPage = 20;

  // Fetch tags with search and pagination
  const {
    data: tagsResponse,
    isLoading,
    isFetching,
  } = useQuestionTags({
    search: debouncedSearch,
    page,
    perPage,
  });

  const tags = tagsResponse?.data || [];
  const pageMeta = tagsResponse?.pageMeta;

  // Create tag mutation
  const createTagMutation = useCreateQuestionTag({
    mutationConfig: {
      onSuccess: (newTag) => {
        onTagSelect(newTag.id, newTag.name);
        setSearchQuery("");
        setDebouncedSearch("");
        setPage(1);
        setIsOpen(false);
      },
      onError: (error: any) => {
        console.error("Error creating tag:", error);
        alert(`Gagal membuat tag: ${error.message || "Unknown error"}`);
      },
    },
  });

  // Get selected tag (need to fetch if not in current list)
  const selectedTag = tags.find((tag) => tag.id === selectedTagId);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Reset page when opening dropdown
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setSearchQuery("");
      setDebouncedSearch("");
    }
  }, [isOpen]);

  const handleCreateNewTag = () => {
    if (searchQuery.trim()) {
      createTagMutation.mutate({
        name: searchQuery.trim(),
        detail: `Tag untuk kategori ${searchQuery.trim()}`,
      });
    }
  };

  const handleSelectTag = (tag: QuestionTags) => {
    onTagSelect(tag.id, tag.name);
    setIsOpen(false);
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);
  };

  const handleClearTag = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTagSelect("", "");
  };

  const handleLoadMore = () => {
    if (pageMeta?.hasNext) {
      setPage((prev) => prev + 1);
    }
  };

  // Check if search query matches existing tag
  const exactMatch = tags.some(
    (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase(),
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tag Pertanyaan
      </label>

      {/* Selected Tag Display / Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800
          flex items-center justify-between cursor-pointer
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-500"}
          ${isOpen ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-20" : "border-gray-300 dark:border-gray-600"}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {selectedTag ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 truncate">
                {selectedTag.name}
              </span>
              {!disabled && (
                <button
                  onClick={handleClearTag}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                  type="button"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pilih atau buat tag...
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari atau buat tag baru..."
                className="pl-10 w-full"
                autoFocus
              />
            </div>
          </div>

          {/* Tags List */}
          <div className="overflow-y-auto flex-1">
            {isLoading && page === 1 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : tags.length > 0 ? (
              <div className="py-1">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleSelectTag(tag)}
                    type="button"
                    className={`
                      w-full px-4 py-2.5 text-left text-sm
                      flex items-center justify-between
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors
                      ${tag.id === selectedTagId ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {tag.name}
                        </div>
                        {tag.detail && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {tag.detail}
                          </div>
                        )}
                      </div>
                    </div>
                    {tag.id === selectedTagId && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}

                {/* Load More Button */}
                {pageMeta?.hasNext && (
                  <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isFetching}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      type="button"
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Load More (
                          {pageMeta.totalResultCount - pageMeta.showingTo}{" "}
                          remaining)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : searchQuery.trim() ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">
                  Tidak ada tag yang ditemukan
                </p>
                <p className="text-xs mt-1">
                  Coba kata kunci lain atau buat tag baru
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Mulai mengetik untuk mencari tag</p>
                <p className="text-xs mt-1">
                  Contoh: Sains, Prakom, Matematika
                </p>
              </div>
            )}
          </div>

          {/* Create New Tag Button */}
          {searchQuery.trim() && !exactMatch && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <Button
                onClick={handleCreateNewTag}
                disabled={createTagMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                type="button"
              >
                {createTagMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Membuat tag...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Buat tag baru "{searchQuery.trim()}"
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results Info */}
          {pageMeta && tags.length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              Menampilkan {pageMeta.showingFrom}-{pageMeta.showingTo} dari{" "}
              {pageMeta.totalResultCount} tag
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Pilih kategori untuk pertanyaan ini (contoh: Sains, Prakom, Matematika)
      </p>
    </div>
  );
};
