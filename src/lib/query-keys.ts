/**
 * Centralized Query Key Factory for Knowledge Center
 *
 * Mengikuti pola pada dokumentasi refactor Knowledge Center:
 * - Satu sumber kebenaran untuk semua query key
 * - Memudahkan invalidation yang terarah
 * - Memberikan autocomplete yang konsisten
 */

import type { KnowledgeQueryParams } from '@/types/knowledge-center';

export const knowledgeKeys = {
  // Base key
  all: ['knowledge-centers'] as const,

  // List queries
  lists: () => [...knowledgeKeys.all, 'list'] as const,
  list: (filters: KnowledgeQueryParams = {}) =>
    [...knowledgeKeys.lists(), { ...filters }] as const,

  // Detail queries
  details: () => [...knowledgeKeys.all, 'detail'] as const,
  detail: (id: string) => [...knowledgeKeys.details(), id] as const,

  // Search queries
  searches: () => [...knowledgeKeys.all, 'search'] as const,
  search: (query: string) => [...knowledgeKeys.searches(), query] as const,

  // Stats & analytics queries
  stats: () => [...knowledgeKeys.all, 'stats'] as const,
  overviewStats: () => [...knowledgeKeys.all, 'overview-stats'] as const,
  lastActivities: () => [...knowledgeKeys.all, 'last-activities'] as const,

  // Related queries
  related: (id: string) => [...knowledgeKeys.all, 'related', id] as const,
} as const;

export const subjectKeys = {
  all: ['knowledge-subjects'] as const,
  lists: () => [...subjectKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...subjectKeys.lists(), { ...(filters || {}) }] as const,
  details: () => [...subjectKeys.all, 'detail'] as const,
  detail: (id: string) => [...subjectKeys.details(), id] as const,
} as const;

export const analyticsKeys = {
  all: ['knowledge-analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  report: (params: unknown) => [...analyticsKeys.all, 'report', params] as const,
} as const;
