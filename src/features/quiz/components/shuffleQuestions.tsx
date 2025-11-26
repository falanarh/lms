import { Switch } from "@/components/ui/Switch/Switch";
import { useUpdateQuiz } from "@/hooks/useQuiz";
import { useState } from "react";
import { createToastState } from "@/utils/toastUtils";
import { Toast } from "@/components/ui/Toast/Toast";

interface ShuffleQuestionsToggleProps {
  quizId: string;
  currentShuffleState?: boolean;
}

const ShuffleQuestionsToggle = ({
  quizId,
  currentShuffleState,
}: ShuffleQuestionsToggleProps) => {
  const [shuffleQuestions, setShuffleQuestions] = useState(
    currentShuffleState ?? false,
  );
  const toastState = createToastState();

  const updateQuizMutation = useUpdateQuiz({
    onSuccess: () => {
      toastState.showSuccess("Pengaturan acak soal berhasil diperbarui");
    },
    onError: (error: any) => {
      // Revert to original state on error
      setShuffleQuestions(!shuffleQuestions);
      toastState.showError(
        error?.response?.data?.message ||
          "Gagal memperbarui pengaturan acak soal. Silakan coba lagi.",
      );
    },
  });

  const handleToggle = () => {
    const newShuffleState = !shuffleQuestions;
    setShuffleQuestions(newShuffleState);

    updateQuizMutation.mutate({
      id: quizId,
      data: { shuffleQuestions: newShuffleState },
    });
  };

  return (
    <>
      <div className="bg-blue-50 rounded-lg p-4 shadow-sm mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-blue-700">
              Pengaturan Soal
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              Tentukan bagaimana urutan soal ditampilkan.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label
              htmlFor="shuffle-toggle"
              className="text-sm font-medium text-blue-700"
            >
              Acak Soal
            </label>

            <Switch
              checked={shuffleQuestions}
              onChange={handleToggle}
              disabled={updateQuizMutation.isPending}
              className={`data-[state=checked]:bg-blue-500 ${
                updateQuizMutation.isPending
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastState.toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
          <Toast
            variant={toastState.toast.variant}
            message={toastState.toast.message}
            onClose={toastState.dismissToast}
            autoDismiss
            duration={4000}
            dismissible
          />
        </div>
      )}
    </>
  );
};

export default ShuffleQuestionsToggle;
