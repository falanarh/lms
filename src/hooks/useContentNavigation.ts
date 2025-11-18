import { useState, useMemo } from "react";
import { Content } from "@/api/contents";
import { Section } from "@/api/sections";
import { 
  findNextContent, 
  findPreviousContent, 
  getNavigationState,
  NavigationState 
} from "@/utils/navigationHelpers";

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
      const nextContent = await findNextContent(
        selectedContent,
        sections,
        expandedSectionsData,
        onSectionDataUpdate
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
