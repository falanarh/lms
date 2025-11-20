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

  // Build ordered list (sections by sequence, contents by sequence)
  const ordered: Content[] = [];
  const orderedSections = [...sections].sort((a: any, b: any) => (a?.sequence ?? 0) - (b?.sequence ?? 0));
  orderedSections.forEach((sec: any) => {
    const contents = ((expandedSectionsData[sec.id] || []) as Content[]).slice().sort((a: any, b: any) => (a?.sequence ?? 0) - (b?.sequence ?? 0));
    contents.forEach((c) => ordered.push(c));
  });

  const unlockedId = (() => {
    for (const c of ordered) {
      const finished = Boolean((c as any)?.userStatus?.isFinished);
      if (!finished) return c.id;
    }
    return null;
  })();

  const currIndex = ordered.findIndex((c) => c.id === currentContent.id);
  for (let i = currIndex + 1; i < ordered.length; i++) {
    const candidate = ordered[i];
    const finished = Boolean((candidate as any)?.userStatus?.isFinished);
    const isUnlocked = unlockedId ? candidate.id === unlockedId : false;
    if (finished || isUnlocked) return candidate || null;
  }
  return null;
};

const findPreviousContent = (
  currentContent: Content,
  sections: Section[],
  expandedSectionsData: Record<string, Content[]>
): Content | null => {
  // Build ordered list
  const ordered: Content[] = [];
  const orderedSections = [...sections].sort((a: any, b: any) => (a?.sequence ?? 0) - (b?.sequence ?? 0));
  orderedSections.forEach((sec: any) => {
    const contents = ((expandedSectionsData[sec.id] || []) as Content[]).slice().sort((a: any, b: any) => (a?.sequence ?? 0) - (b?.sequence ?? 0));
    contents.forEach((c) => ordered.push(c));
  });

  const currIndex = ordered.findIndex((c) => c.id === currentContent.id);
  for (let i = currIndex - 1; i >= 0; i--) {
    const candidate = ordered[i];
    const finished = Boolean((candidate as any)?.userStatus?.isFinished);
    if (finished) return candidate || null;
  }
  return null;
};

const getNavigationState = (
  currentContent: Content | null,
  sections: Section[],
  expandedSectionsData: Record<string, Content[]>
): NavigationState => {
  if (!currentContent || !sections.length) {
    return { hasPrevious: false, hasNext: false };
  }
  const next = findNextContent(currentContent, sections, expandedSectionsData);
  const prev = findPreviousContent(currentContent, sections, expandedSectionsData);
  return { hasPrevious: Boolean(prev), hasNext: Boolean(next) };
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
