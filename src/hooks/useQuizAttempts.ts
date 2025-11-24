import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import {
  getQuizDetailByContent,
  startQuizAttempt,
  getQuestionWithAnswer,
  saveQuizAnswer,
  updateQuizAnswer,
  submitQuizAttempt,
  getQuizAttemptById,
  getQuizAttemptForReview,
  type QuizDetailResponse,
  type QuizStartResponse,
  type QuestionDetail,
  type QuizAttemptDetail,
  type QuizAttemptSummary,
  type SaveAnswerRequest,
} from "@/api/quiz-attempts";

export const getQuizDetailQueryKey = (idContent: string) => [
  "quiz-detail",
  idContent,
];

export const getQuestionDetailQueryKey = (idQuestion: string) => [
  "question-detail",
  idQuestion,
];

export const getQuizAttemptHistoryQueryKey = (
  idUser: string,
  idContent: string
) => ["quiz-attempt-history", idUser, idContent];

export const getQuizAttemptByIdQueryKey = (idAttempt: string) => [
  "quiz-attempt",
  idAttempt,
];

export const getQuizAttemptForReviewQueryKey = (
  idUser: string,
  idContent: string,
  idAttempt: string
) => ["quiz-attempt-review", idUser, idContent, idAttempt];

export const getQuizDetailQueryOptions = (idContent: string) =>
  queryOptions({
    queryKey: getQuizDetailQueryKey(idContent),
    queryFn: () => getQuizDetailByContent(idContent),
    enabled: !!idContent,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const getQuestionDetailQueryOptions = (idQuestion: string) =>
  queryOptions({
    queryKey: getQuestionDetailQueryKey(idQuestion),
    queryFn: () => getQuestionWithAnswer(idQuestion),
    enabled: !!idQuestion,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

export const getQuizAttemptByIdQueryOptions = (idAttempt: string) =>
  queryOptions({
    queryKey: getQuizAttemptByIdQueryKey(idAttempt),
    queryFn: () => getQuizAttemptById(idAttempt),
    enabled: !!idAttempt,
    staleTime: 10 * 1000,
  });

export const getQuizAttemptForReviewQueryOptions = (
  idUser: string,
  idContent: string,
  idAttempt: string
) =>
  queryOptions({
    queryKey: getQuizAttemptForReviewQueryKey(idUser, idContent, idAttempt),
    queryFn: () => getQuizAttemptForReview(idUser, idContent, idAttempt),
    enabled: !!idUser && !!idContent && !!idAttempt,
    staleTime: 5 * 60 * 1000,
  });

export const useQuizDetail = (idContent: string, config: any = {}) => {
  return useQuery({
    ...getQuizDetailQueryOptions(idContent),
    ...config,
  });
};

/**
 * Hook to get question detail with answer
 */
export const useQuestionDetail = (idQuestion: string, config: any = {}) => {
  return useQuery({
    ...getQuestionDetailQueryOptions(idQuestion),
    ...config,
  });
};

/**
 * Hook to get quiz attempt by ID
 */
export const useQuizAttemptById = (idAttempt: string, config: any = {}) => {
  return useQuery({
    ...getQuizAttemptByIdQueryOptions(idAttempt),
    ...config,
  });
};

/**
 * Hook to get quiz attempt for review
 */
export const useQuizAttemptForReview = (
  idUser: string,
  idContent: string,
  idAttempt: string,
  config: any = {}
) => {
  return useQuery({
    ...getQuizAttemptForReviewQueryOptions(idUser, idContent, idAttempt),
    ...config,
  });
};

/**
 * Hook to start a quiz attempt
 */
export const useStartQuizAttempt = (config: any = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      idUser,
      idContent,
    }: {
      idUser: string;
      idContent: string;
    }) => startQuizAttempt(idUser, idContent),
    onSuccess: (data, variables) => {
      // Invalidate attempt history after starting new attempt
      queryClient.invalidateQueries({
        queryKey: getQuizAttemptHistoryQueryKey(
          variables.idUser,
          variables.idContent
        ),
      });
    },
    ...config,
  });
};

/**
 * Hook to save quiz answer (POST - first time)
 */
export const useSaveQuizAnswer = (config: any = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveAnswerRequest) => saveQuizAnswer(payload),
    onSuccess: (data: QuizAttemptDetail) => {
      // Update cache agar tampilan frontend ter-update
      queryClient.setQueryData(getQuizAttemptByIdQueryKey(data.id), data);
    },
    ...config,
  });
};

/**
 * Hook to update quiz answer (PATCH - update existing)
 */
export const useUpdateQuizAnswer = (config: any = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveAnswerRequest) => updateQuizAnswer(payload),
    onSuccess: (data: QuizAttemptDetail) => {
      // Update cache agar tampilan frontend ter-update
      queryClient.setQueryData(getQuizAttemptByIdQueryKey(data.id), data);
    },
    ...config,
  });
};

/**
 * Hook to submit quiz attempt
 */
export const useSubmitQuizAttempt = (config: any = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idAttempt: string) => submitQuizAttempt(idAttempt),
    onSuccess: (data: QuizAttemptDetail) => {
      // Update the attempt detail cache
      queryClient.setQueryData(getQuizAttemptByIdQueryKey(data.id), data);
      // Invalidate attempt history
      queryClient.invalidateQueries({
        queryKey: getQuizAttemptHistoryQueryKey(data.idUser, data.idContent),
      });
    },
    ...config,
  });
};

/**
 * Combined hook to handle answer changes (auto-detects POST vs PATCH)
 * This hook will automatically choose between save and update based on
 * whether the question has been answered before
 */
export const useHandleQuizAnswer = (config: any = {}) => {
  const saveMutation = useSaveQuizAnswer(config);
  const updateMutation = useUpdateQuizAnswer(config);

  return {
    saveOrUpdate: async (
      payload: SaveAnswerRequest,
      isUpdate: boolean = false
    ) => {
      if (isUpdate) {
        return updateMutation.mutateAsync(payload);
      } else {
        return saveMutation.mutateAsync(payload);
      }
    },
    isLoading: saveMutation.isPending || updateMutation.isPending,
    error: saveMutation.error || updateMutation.error,
  };
};
