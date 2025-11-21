"use client";

import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import { Pagination } from '@/components/shared/Pagination/Pagination';
import { Modal } from '@/components/ui/Modal/Modal';
import { useCategoryLogTypes, useLogTypes, useCreateCategoryLogType, useCreateLogType } from '@/hooks/useLogActivity';
import { createCategoryLogTypeSchema, createLogTypeSchema, formatZodError } from '@/lib/validation/schemas';
import { ErrorMessage } from '@/lib/validation/form-utils';

import { Toast } from '@/components/ui/Toast/Toast';
import { useToast } from '@/hooks/useToast';

export default function LogMasterDataManagement() {
  const toastState = useToast();

  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoryError,
    refetch: refetchCategories,
  } = useCategoryLogTypes();

  const {
    data: logTypes,
    isLoading: isLoadingLogTypes,
    error: logTypeError,
    refetch: refetchLogTypes,
  } = useLogTypes();

  const [categorySearch, setCategorySearch] = useState('');
  const [logTypeSearch, setLogTypeSearch] = useState('');

  const [categoryFormErrors, setCategoryFormErrors] = useState<Record<string, string>>({});
  const [logTypeFormErrors, setLogTypeFormErrors] = useState<Record<string, string>>({});

  const createCategoryMutation = useCreateCategoryLogType();
  const createLogTypeMutation = useCreateLogType();

  // Shared items-per-page options (matching main log table style)
  const itemsPerPageOptions = [
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '25', label: '25' },
    { value: '50', label: '50' },
    { value: '100', label: '100' },
  ];

  // Pagination state for Category Log Type
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryItemsPerPage, setCategoryItemsPerPage] = useState(5);

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Pagination state for Log Type
  const [logTypePage, setLogTypePage] = useState(1);
  const [logTypeItemsPerPage, setLogTypeItemsPerPage] = useState(5);

  const [isCreatingLogType, setIsCreatingLogType] = useState(false);
  const [logTypeName, setLogTypeName] = useState('');
  const [logTypeDescription, setLogTypeDescription] = useState('');
  const [logTypeCategoryId, setLogTypeCategoryId] = useState('');

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const query = categorySearch.toLowerCase();
    return categories.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query)
      );
    });
  }, [categories, categorySearch]);

  const filteredLogTypes = useMemo(() => {
    if (!logTypeSearch.trim()) return logTypes;
    const query = logTypeSearch.toLowerCase();
    return logTypes.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description || '').toLowerCase().includes(query)
      );
    });
  }, [logTypes, logTypeSearch]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => {
      map.set(c.id, c.name);
    });
    return map;
  }, [categories]);

  // Derived pagination data for Category Log Type
  const categoryTotal = filteredCategories.length;
  const categoryTotalPages = categoryTotal > 0 ? Math.max(1, Math.ceil(categoryTotal / categoryItemsPerPage)) : 1;
  const safeCategoryPage = Math.min(categoryPage, categoryTotalPages);
  const categoryStartIndex = (safeCategoryPage - 1) * categoryItemsPerPage;
  const categoryEndIndex = categoryStartIndex + categoryItemsPerPage;
  const paginatedCategories = filteredCategories.slice(categoryStartIndex, categoryEndIndex);
  const categoryShowingFrom = categoryTotal > 0 ? categoryStartIndex + 1 : 0;
  const categoryShowingTo = categoryTotal > 0 ? Math.min(categoryEndIndex, categoryTotal) : 0;

  // Derived pagination data for Log Type
  const logTypeTotal = filteredLogTypes.length;
  const logTypeTotalPages = logTypeTotal > 0 ? Math.max(1, Math.ceil(logTypeTotal / logTypeItemsPerPage)) : 1;
  const safeLogTypePage = Math.min(logTypePage, logTypeTotalPages);
  const logTypeStartIndex = (safeLogTypePage - 1) * logTypeItemsPerPage;
  const logTypeEndIndex = logTypeStartIndex + logTypeItemsPerPage;
  const paginatedLogTypes = filteredLogTypes.slice(logTypeStartIndex, logTypeEndIndex);
  const logTypeShowingFrom = logTypeTotal > 0 ? logTypeStartIndex + 1 : 0;
  const logTypeShowingTo = logTypeTotal > 0 ? Math.min(logTypeEndIndex, logTypeTotal) : 0;

  // Pagination handlers
  const handleCategoryPageChange = (page: number) => {
    setCategoryPage(page);
  };

  const handleCategoryItemsPerPageChange = (value: string) => {
    const next = parseInt(value, 10);
    if (!Number.isNaN(next)) {
      setCategoryItemsPerPage(next);
      setCategoryPage(1);
    }
  };

  const handleLogTypePageChange = (page: number) => {
    setLogTypePage(page);
  };

  const handleLogTypeItemsPerPageChange = (value: string) => {
    const next = parseInt(value, 10);
    if (!Number.isNaN(next)) {
      setLogTypeItemsPerPage(next);
      setLogTypePage(1);
    }
  };

  const handleCreateCategory = () => {
    setIsCreatingCategory(true);
  };

  const handleCreateLogType = () => {
    setIsCreatingLogType(true);
  };

  const handleEditCategory = () => {
    window.alert('Edit Category Log Type belum terhubung ke API.');
  };

  const handleEditLogType = () => {
    window.alert('Edit Log Type belum terhubung ke API.');
  };

  const handleDeleteCategory = () => {
    window.alert('Delete Category Log Type belum terhubung ke API.');
  };

  const handleDeleteLogType = () => {
    window.alert('Delete Log Type belum terhubung ke API.');
  };

  const handleSubmitCreateCategory = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationResult = createCategoryLogTypeSchema.safeParse({
      name: categoryName,
      description: categoryDescription,
    });

    if (!validationResult.success) {
      setCategoryFormErrors(formatZodError(validationResult.error));
      return;
    }

    setCategoryFormErrors({});

    try {
      await createCategoryMutation.mutateAsync({
        name: categoryName.trim(),
        description: categoryDescription.trim() || undefined,
      });

      setCategoryName('');
      setCategoryDescription('');
      setIsCreatingCategory(false);
      setCategoryPage(1);
      toastState.showSuccess('Berhasil membuat Category Log Type');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal membuat Category Log Type';
      toastState.showError(message);
    }
  };

  const handleSubmitCreateLogType = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationResult = createLogTypeSchema.safeParse({
      name: logTypeName,
      description: logTypeDescription,
      idCategoryLogType: logTypeCategoryId,
    });

    if (!validationResult.success) {
      setLogTypeFormErrors(formatZodError(validationResult.error));
      return;
    }

    setLogTypeFormErrors({});

    try {
      await createLogTypeMutation.mutateAsync({
        name: logTypeName.trim(),
        description: logTypeDescription.trim() || undefined,
        idCategoryLogType: logTypeCategoryId || undefined,
      });

      setLogTypeName('');
      setLogTypeDescription('');
      setLogTypeCategoryId('');
      setIsCreatingLogType(false);
      setLogTypePage(1);
      toastState.showSuccess('Berhasil membuat Log Type');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal membuat Log Type';
      toastState.showError(message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-zinc-900">Log Master Data</h2>
        <p className="text-sm text-zinc-600">
          Kelola master data Category Log Type dan Log Type yang digunakan pada Log Activity.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Category Log Type</h3>
              <p className="text-sm text-gray-600">Daftar kategori utama untuk log activity.</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  refetchCategories();
                }}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh
              </Button>
              <Button
                size="sm"
                className="flex items-center gap-1"
                onClick={handleCreateCategory}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Tambah Kategori
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full md:max-w-xs">
              <Input
                type="text"
                placeholder="Cari kategori..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                size="sm"
              />
            </div>
          </div>

          {isLoadingCategories && (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 border border-gray-100 rounded-md p-3"
                >
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoadingCategories && categoryError && (
            <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md p-4 space-y-2">
              <p>Gagal memuat Category Log Type.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchCategories()}
                className="flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Coba lagi
              </Button>
            </div>
          )}

          {!isLoadingCategories && !categoryError && filteredCategories.length === 0 && (
            <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center space-y-2">
              <p className="text-sm font-medium text-gray-900">Belum ada Category Log Type.</p>
              <p className="text-xs text-gray-500">
                Tambahkan kategori baru untuk mengelompokkan jenis-jenis log activity.
              </p>
              <Button
                size="sm"
                className="mt-2 flex items-center gap-1 mx-auto"
                onClick={handleCreateCategory}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Tambah Kategori
              </Button>
            </div>
          )}

          {!isLoadingCategories && !categoryError && filteredCategories.length > 0 && (
            <>
              <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
                {paginatedCategories.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      {item.description && (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditCategory}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteCategory}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination with Showing Info (matching main log table layout) */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  {/* Showing X to Y from Z Category Log Types - Left */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Showing{' '}
                      <span className="font-semibold text-gray-900">{categoryShowingFrom}</span>{' '}
                      to{' '}
                      <span className="font-semibold text-gray-900">{categoryShowingTo}</span>{' '}
                      from{' '}
                      <span className="font-semibold text-gray-900">{categoryTotal}</span>{' '}
                      Category Log Types
                    </p>
                  </div>

                  {/* Pagination - Center */}
                  <div className="flex-1 flex justify-center">
                    {categoryTotalPages > 1 && (
                      <Pagination
                        alignment="center"
                        currentPage={safeCategoryPage}
                        totalPages={categoryTotalPages}
                        onPageChange={handleCategoryPageChange}
                        className="max-w-xs"
                      />
                    )}
                  </div>

                  {/* Items Per Page Selector - Right */}
                  <div className="flex-1 flex justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show:</span>
                      <Dropdown
                        value={categoryItemsPerPage.toString()}
                        onChange={handleCategoryItemsPerPageChange}
                        items={itemsPerPageOptions}
                        className="w-24"
                        searchable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Log Type</h3>
              <p className="text-sm text-gray-600">Daftar jenis log activity detail.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  refetchLogTypes();
                }}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh
              </Button>
              <Button
                size="sm"
                className="flex items-center gap-1"
                onClick={handleCreateLogType}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Tambah Log Type
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full md:max-w-xs">
              <Input
                type="text"
                placeholder="Cari log type..."
                value={logTypeSearch}
                onChange={(e) => setLogTypeSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                size="sm"
              />
            </div>
          </div>

          {isLoadingLogTypes && (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 border border-gray-100 rounded-md p-3"
                >
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoadingLogTypes && logTypeError && (
            <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md p-4 space-y-2">
              <p>Gagal memuat Log Type.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchLogTypes()}
                className="flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Coba lagi
              </Button>
            </div>
          )}

          {!isLoadingLogTypes && !logTypeError && filteredLogTypes.length === 0 && (
            <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center space-y-2">
              <p className="text-sm font-medium text-gray-900">Belum ada Log Type.</p>
              <p className="text-xs text-gray-500">
                Tambahkan log type baru untuk mendeskripsikan aktivitas secara lebih spesifik.
              </p>
              <Button
                size="sm"
                className="mt-2 flex items-center gap-1 mx-auto"
                onClick={handleCreateLogType}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Tambah Log Type
              </Button>
            </div>
          )}

          {!isLoadingLogTypes && !logTypeError && filteredLogTypes.length > 0 && (
            <>
              <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
                {paginatedLogTypes.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        {item.idCategoryLogType && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {categoryMap.get(item.idCategoryLogType) || 'Tanpa kategori'}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditLogType}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDeleteLogType}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination with Showing Info (matching main log table layout) */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  {/* Showing X to Y from Z Log Types - Left */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Showing{' '}
                      <span className="font-semibold text-gray-900">{logTypeShowingFrom}</span>{' '}
                      to{' '}
                      <span className="font-semibold text-gray-900">{logTypeShowingTo}</span>{' '}
                      from{' '}
                      <span className="font-semibold text-gray-900">{logTypeTotal}</span>{' '}
                      Log Types
                    </p>
                  </div>

                  {/* Pagination - Center */}
                  <div className="flex-1 flex justify-center">
                    {logTypeTotalPages > 1 && (
                      <Pagination
                        alignment="center"
                        currentPage={safeLogTypePage}
                        totalPages={logTypeTotalPages}
                        onPageChange={handleLogTypePageChange}
                        className="max-w-xs"
                      />
                    )}
                  </div>

                  {/* Items Per Page Selector - Right */}
                  <div className="flex-1 flex justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Show:</span>
                      <Dropdown
                        value={logTypeItemsPerPage.toString()}
                        onChange={handleLogTypeItemsPerPageChange}
                        items={itemsPerPageOptions}
                        className="w-24"
                        searchable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal: Create Category Log Type */}
      <Modal
        isOpen={isCreatingCategory}
        onClose={() => {
          if (!createCategoryMutation.isPending) {
            setIsCreatingCategory(false);
            setCategoryName('');
            setCategoryDescription('');
            setCategoryFormErrors({});
          }
        }}
        title="Tambah Category Log Type"
        size="sm"
      >
        <form onSubmit={handleSubmitCreateCategory} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Nama kategori *"
              value={categoryName}
              onChange={(e) => {
                const value = e.target.value;
                setCategoryName(value);
                if (categoryFormErrors.name) {
                  setCategoryFormErrors((prev) => {
                    const { name, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              size="sm"
              isInvalid={!!categoryFormErrors.name}
            />
            <ErrorMessage
              errors={categoryFormErrors.name ? [categoryFormErrors.name] : undefined}
            />
            <Input
              type="text"
              placeholder="Deskripsi (opsional)"
              value={categoryDescription}
              onChange={(e) => {
                const value = e.target.value;
                setCategoryDescription(value);
                if (categoryFormErrors.description) {
                  setCategoryFormErrors((prev) => {
                    const { description, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              size="sm"
              isInvalid={!!categoryFormErrors.description}
            />
            <ErrorMessage
              errors={categoryFormErrors.description ? [categoryFormErrors.description] : undefined}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!createCategoryMutation.isPending) {
                  setIsCreatingCategory(false);
                  setCategoryName('');
                  setCategoryDescription('');
                  setCategoryFormErrors({});
                }
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createCategoryMutation.isPending}
              isLoading={createCategoryMutation.isPending}
              className="flex items-center gap-1"
            >
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Log Type */}
      <Modal
        isOpen={isCreatingLogType}
        onClose={() => {
          if (!createLogTypeMutation.isPending) {
            setIsCreatingLogType(false);
            setLogTypeName('');
            setLogTypeDescription('');
            setLogTypeCategoryId('');
            setLogTypeFormErrors({});
          }
        }}
        title="Tambah Log Type"
        size="sm"
      >
        <form onSubmit={handleSubmitCreateLogType} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Nama log type *"
              value={logTypeName}
              onChange={(e) => {
                const value = e.target.value;
                setLogTypeName(value);
                if (logTypeFormErrors.name) {
                  setLogTypeFormErrors((prev) => {
                    const { name, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              size="sm"
              isInvalid={!!logTypeFormErrors.name}
            />
            <ErrorMessage
              errors={logTypeFormErrors.name ? [logTypeFormErrors.name] : undefined}
            />
            <Input
              type="text"
              placeholder="Deskripsi (opsional)"
              value={logTypeDescription}
              onChange={(e) => {
                const value = e.target.value;
                setLogTypeDescription(value);
                if (logTypeFormErrors.description) {
                  setLogTypeFormErrors((prev) => {
                    const { description, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              size="sm"
              isInvalid={!!logTypeFormErrors.description}
            />
            <ErrorMessage
              errors={logTypeFormErrors.description ? [logTypeFormErrors.description] : undefined}
            />
            <div>
              <Dropdown
                value={logTypeCategoryId}
                onChange={(value: string) => {
                  setLogTypeCategoryId(value);
                  if (logTypeFormErrors.idCategoryLogType) {
                    setLogTypeFormErrors((prev) => {
                      const { idCategoryLogType, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                items={[
                  { value: '', label: 'Tanpa kategori' },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                className="w-full"
                searchable={false}
              />
              <ErrorMessage
                errors={logTypeFormErrors.idCategoryLogType ? [logTypeFormErrors.idCategoryLogType] : undefined}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!createLogTypeMutation.isPending) {
                  setIsCreatingLogType(false);
                  setLogTypeName('');
                  setLogTypeDescription('');
                  setLogTypeCategoryId('');
                  setLogTypeFormErrors({});
                }
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createLogTypeMutation.isPending}
              isLoading={createLogTypeMutation.isPending}
              className="flex items-center gap-1"
            >
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Notifications */}
      {toastState.toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            variant={toastState.toast.variant}
            message={toastState.toast.message}
            onClose={toastState.dismissToast}
            autoDismiss
            duration={5000}
          />
        </div>
      )}
    </div>
  );
}
