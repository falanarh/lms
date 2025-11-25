/**
 * API Barrel Exports
 *
 * Centralized exports for all API modules
 * Makes imports cleaner and more organized
 */

// Knowledge Center API
export {
  knowledgeCenterApi as knowledgeApi,
  fetchKnowledgeCenters,
  fetchKnowledgeCenterById,
  getKnowledgeQueryKey,
  getKnowledgeDetailQueryKey,
  getKnowledgeQueryOptions,
  getKnowledgeDetailQueryOptions,
} from './knowledge-center';

// Knowledge Subject API
export {
  knowledgeSubjectApi,
  fetchKnowledgeSubjects,
  fetchKnowledgeSubjectById,
  createKnowledgeSubject,
  updateKnowledgeSubject,
  deleteKnowledgeSubject,
  fetchKnowledgeSubjectsWithPagination,
  searchKnowledgeSubjects,
  createKnowledgeSubjectsBatch,
  deleteKnowledgeSubjectsBatch,
  getKnowledgeSubjectsQueryOptions,
  getKnowledgeSubjectDetailQueryOptions,
  KNOWLEDGE_SUBJECTS_QUERY_KEY,
  KNOWLEDGE_SUBJECT_DETAIL_QUERY_KEY,
} from './knowledge-subject';

// API Configuration
export { API_CONFIG, API_ENDPOINTS, API_BASE_URL } from '../config/api';

// Re-export everything for convenience
export * from './knowledge-center';
export * from './knowledge-subject';