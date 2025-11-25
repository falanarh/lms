import { useState, useMemo } from "react";
import { Content } from "@/api/contents";
import { Section } from "@/api/sections";

interface UseContentNavigationProps {
  sections: Section[];
  selectedContent: Content | null;
  expandedSectionsData: Record<string, Content[]>;
  onContentSelect: (content: Content) => void;
  onSectionDataUpdate: (sectionId: string, contents: Content[]) => void;
}

interface UseContentNavigationReturn {
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  isNavigating: boolean;
  navigationState: NavigationState;
}

interface NavigationPosition {
  sectionIndex: number;
  contentIndex: number;
  currentSectionContents: Content[];
}

interface NavigationState {
  hasPrevious: boolean;
  hasNext: boolean;
}

const findCurrentPosition = (
  currentContent: Content,
  sections: Section[],
  expandedSectionsData: Record<string, Content[]>
): NavigationPosition | null => {
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionContents = expandedSectionsData[section.id] || [];
    const contentIndex = sectionContents.findIndex(c => c.id === currentContent.id);
    if (contentIndex !== -1) {
      return {
        sectionIndex: i,
        contentIndex,
        currentSectionContents: sectionContents,
      };
    }
  }
  return null;
};

const findNextContent = (
  currentContent: Content,
  sections: Section[],
  expandedSectionsData: Record<string, Content[]>
): Content | null => {
  const currentPosition = findCurrentPosition(currentContent, sections, expandedSectionsData);
  if (!currentPosition) return null;

  const { sectionIndex, contentIndex, currentSectionContents } = currentPosition;

  if (contentIndex < currentSectionContents.length - 1) {
    return currentSectionContents[contentIndex + 1] || null;
  }

  const nextSectionIndex = sectionIndex + 1;
  if (nextSectionIndex >= sections.length) return null;

  const nextSection = sections[nextSectionIndex];
  const nextSectionContents = expandedSectionsData[nextSection.id] || [];
  return nextSectionContents[0] || null;
};

const findPreviousContent = (
  currentContent: Content,
  sections: Section[],
  expandedSectionsData: Record<string, Content[]>
): Content | null => {
  const currentPosition = findCurrentPosition(currentContent, sections, expandedSectionsData);
  if (!currentPosition) return null;

  const { sectionIndex, contentIndex, currentSectionContents } = currentPosition;
  if (contentIndex > 0) {
    return currentSectionContents[contentIndex - 1] || null;
  }

  const prevSectionIndex = sectionIndex - 1;
  if (prevSectionIndex < 0) return null;

  const prevSection = sections[prevSectionIndex];
  const prevSectionContents = expandedSectionsData[prevSection.id] || [];
  return prevSectionContents[prevSectionContents.length - 1] || null;
};

const getNavigationState = (
  currentContent: Content | null,
  sections: Section[],
  expandedSectionsData: Record<string, Content[]>
): NavigationState => {
  if (!currentContent || !sections.length) {
    return { hasPrevious: false, hasNext: false };
  }
  const currentPosition = findCurrentPosition(currentContent, sections, expandedSectionsData);
  if (!currentPosition) {
    return { hasPrevious: false, hasNext: false };
  }
  const { sectionIndex, contentIndex, currentSectionContents } = currentPosition;
  const hasPrevious = !(sectionIndex === 0 && contentIndex === 0);
  const hasNextInSection = contentIndex < currentSectionContents.length - 1;
  const hasNextSection = sectionIndex < sections.length - 1;
  return { hasPrevious, hasNext: hasNextInSection || hasNextSection };
};

export const useContentNavigation = ({
  sections,
  selectedContent,
  expandedSectionsData,
  onContentSelect,
  onSectionDataUpdate,
}: UseContentNavigationProps): UseContentNavigationReturn => {
  const [isNavigating, setIsNavigating] = useState(false);

  // Calculate navigation state
  const navigationState = useMemo(() => {
    return getNavigationState(selectedContent, sections, expandedSectionsData);
  }, [selectedContent, sections, expandedSectionsData]);

  const handleNext = async () => {
    if (!selectedContent || !navigationState.hasNext || isNavigating) {
      return;
    }

    setIsNavigating(true);

    try {
      const nextContent = findNextContent(
        selectedContent,
        sections,
        expandedSectionsData
      );

      if (nextContent) {
        onContentSelect(nextContent);
      }
    } catch (error) {
      console.error('Navigation error:', error);
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
      sections,
      expandedSectionsData
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
