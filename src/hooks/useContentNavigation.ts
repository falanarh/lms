import { useState, useMemo } from "react";
import { Content } from "@/api/contents";
import { Section } from "@/api/sections";

interface UseContentNavigationProps {
  sections: Section[];
  selectedContent: Content | null;
  expandedSectionsData: Record<string, Content[]>;
  orderedContents: Content[];
  unlockedContentId: string | null;
  onContentSelect: (content: Content) => void;
  onSectionDataUpdate: (sectionId: string, contents: Content[]) => void;
}

interface UseContentNavigationReturn {
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  isNavigating: boolean;
  navigationState: NavigationState;
}

interface NavigationState {
  hasPrevious: boolean;
  hasNext: boolean;
}

const findNextContent = (
  currentContent: Content,
  orderedContents: Content[],
  unlockedContentId: string | null
): Content | null => {
  const currIndex = orderedContents.findIndex(
    (c) => c.id === currentContent.id
  );

  for (let i = currIndex + 1; i < orderedContents.length; i++) {
    const candidate = orderedContents[i];
    const finished = Boolean((candidate as any)?.userStatus?.isFinished);
    const isUnlocked = unlockedContentId
      ? candidate.id === unlockedContentId
      : false;
    if (finished || isUnlocked) return candidate || null;
  }
  return null;
};

const findPreviousContent = (
  currentContent: Content,
  orderedContents: Content[]
): Content | null => {
  const currIndex = orderedContents.findIndex(
    (c) => c.id === currentContent.id
  );

  for (let i = currIndex - 1; i >= 0; i--) {
    const candidate = orderedContents[i];
    const finished = Boolean((candidate as any)?.userStatus?.isFinished);
    if (finished) return candidate || null;
  }
  return null;
};

const getNavigationState = (
  currentContent: Content | null,
  orderedContents: Content[],
  unlockedContentId: string | null
): NavigationState => {
  if (!currentContent || !orderedContents.length) {
    return { hasPrevious: false, hasNext: false };
  }
  const next = findNextContent(
    currentContent,
    orderedContents,
    unlockedContentId
  );
  const prev = findPreviousContent(currentContent, orderedContents);
  return { hasPrevious: Boolean(prev), hasNext: Boolean(next) };
};

export const useContentNavigation = ({
  sections,
  selectedContent,
  expandedSectionsData,
  orderedContents,
  unlockedContentId,
  onContentSelect,
  onSectionDataUpdate,
}: UseContentNavigationProps): UseContentNavigationReturn => {
  const [isNavigating, setIsNavigating] = useState(false);

  const navigationState = useMemo(() => {
    return getNavigationState(
      selectedContent,
      orderedContents,
      unlockedContentId
    );
  }, [selectedContent, orderedContents, unlockedContentId]);

  const handleNext = async () => {
    if (!selectedContent || !navigationState.hasNext || isNavigating) {
      return;
    }

    setIsNavigating(true);

    try {
      const nextContent = findNextContent(
        selectedContent,
        orderedContents,
        unlockedContentId
      );

      if (nextContent) {
        onContentSelect(nextContent);
      }
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handlePrevious = () => {
    if (!selectedContent || !navigationState.hasPrevious || isNavigating) {
      return;
    }

    const previousContent = findPreviousContent(
      selectedContent,
      orderedContents
    );

    if (previousContent) {
      onContentSelect(previousContent);
    }
  };

  return {
    handleNext,
    handlePrevious,
    isNavigating,
    navigationState,
  };
};
