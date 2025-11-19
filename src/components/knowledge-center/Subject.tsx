'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  SearchX,
} from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { useKnowledgeSubjects } from '@/hooks/useKnowledgeSubject';
import { Icon, IconName } from '../ui/icon-picker';
import { KnowledgeSubject } from '@/types/knowledge-subject';

interface SubjectProps {
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

export default function Subject({
  selectedSubject,
  onSubjectChange,
}: SubjectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [canCollapse, setCanCollapse] = useState(true);
  const [needsToggle, setNeedsToggle] = useState(false);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: subjects, isLoading } = useKnowledgeSubjects();

  // const getSubjectIconByName = (subjectName: string) => {
  //   if (subjectName === 'all') return LayoutGrid;

  //   const name = subjectName.toLowerCase();
  //   if (name.includes('statistik') || name.includes('data') || name.includes('database')) return Database;
  //   if (name.includes('ekonomi') || name.includes('business') || name.includes('finance')) return BarChart3;
  //   if (name.includes('global') || name.includes('internasional') || name.includes('dunia')) return Globe;
  //   if (name.includes('kerja') || name.includes('pekerjaan') || name.includes('karir')) return Briefcase;
  //   if (name.includes('pelatihan') || name.includes('education') || name.includes('belajar')) return GraduationCap;
  //   if (name.includes('inovasi') || name.includes('teknologi') || name.includes('riset')) return Lightbulb;
  //   if (name.includes('target') || name.includes('goal') || name.includes('sasaran')) return Target;
  //   if (name.includes('sistem') || name.includes('komputer') || name.includes('it')) return Cpu;
  //   if (name.includes('organisasi') || name.includes('instansi') || name.includes('lembaga')) return Building2;
  //   if (name.includes('wilayah') || name.includes('daerah') || name.includes('regional')) return MapPin;
  //   if (name.includes('sosial') || name.includes('masyarakat') || name.includes('people')) return Users2;
  //   return BookOpen;
  // };

// const getSubjectIcon = (subjectName: string, subjectIcon?: string) => {
//     // Use icon from API if available, fallback to name-based logic
//     if (subjectIcon && subjectIcon.trim()) {
//       // For now, use name-based logic even with icon from API
//       // In the future, you could map icon strings to Lucide icons here
//       return getSubjectIconByName(subjectName);
//     }
//     return getSubjectIconByName(subjectName);
//   };

  const subjectOptions = useMemo(() => {
    // Get unique subjects from API data
    const uniqueSubjects = (subjects || [])
      .filter((subject) => subject?.name?.trim())
      .reduce((acc, subject) => {
        const existing = acc.find(s => s.name.toLowerCase() === subject.name.toLowerCase());
        if (!existing) {
          acc.push(subject);
        }
        return acc;
      }, [] as KnowledgeSubject[])
      .sort((a, b) => a.name.localeCompare(b.name));

    return [
      { value: 'all', label: 'All Subjects', icon: <Icon name='layout-grid' /> },
      ...uniqueSubjects.map((subject) => ({
        value: subject.name,
        label: subject.name,
        icon: <Icon name={(subject.icon as IconName)} />,
        originalSubject: subject,
      })),
    ];
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    return subjectOptions.filter((subject) =>
      subject.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subjectOptions, searchTerm]);

  const checkLayout = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      setNeedsToggle(false);
      setCanCollapse(true);
      return;
    }

    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button')
    );

    if (!buttons.length) {
      setNeedsToggle(false);
      setCanCollapse(true);
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    const rowTops: number[] = [];

    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect();
      const top = Math.round(rect.top - containerTop);

      const existingIndex = rowTops.findIndex(
        (value) => Math.abs(value - top) <= 2
      );

      if (existingIndex === -1) {
        rowTops.push(top);
      }
    });

    rowTops.sort((a, b) => a - b);

    const requiresToggle = rowTops.length > 2;
    setNeedsToggle(requiresToggle);

    if (!requiresToggle) {
      setCanCollapse(true);
      return;
    }

    const selectedButton = selectedButtonRef.current;
    if (!selectedButton) {
      setCanCollapse(true);
      return;
    }

    const selectedTop = Math.round(
      selectedButton.getBoundingClientRect().top - containerTop
    );

    const selectedRowIndex = rowTops.findIndex(
      (value) => Math.abs(value - selectedTop) <= 2
    );

    setCanCollapse(selectedRowIndex <= 1 || selectedRowIndex === -1);
  }, [filteredSubjects, selectedSubject]);

  useEffect(() => {
    let frame = requestAnimationFrame(checkLayout);
    const container = containerRef.current;

    if (!container) {
      return () => cancelAnimationFrame(frame);
    }

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(checkLayout);
      });
      resizeObserver.observe(container);
    } else {
      const handleResize = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(checkLayout);
      };
      window.addEventListener('resize', handleResize);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
    };
  }, [checkLayout]);

  useEffect(() => {
    if (!needsToggle && isExpanded) {
      setIsExpanded(false);
    }
  }, [needsToggle, isExpanded]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value) {
      setIsExpanded(true);
    }
  };

  const onToggleExpand = () => {
    if (isExpanded) {
      setIsExpanded(false);
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      });
      return;
    }

    if (!canCollapse) {
      return;
    }

    setIsExpanded(true);
  };

  const handleSubjectChange = (subjectValue: string) => {
    onSubjectChange(subjectValue);
  };

  const baseButtonClasses =
    'flex items-center gap-2 py-2 px-5 rounded-lg text-sm font-medium transition-all duration-200 border-2';

  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 p-8 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/20 to-blue-200/20 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-700 group-hover:scale-150 group-hover:opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/20 to-blue-100/20 rounded-full blur-3xl -ml-24 -mb-24 transition-all duration-700 group-hover:scale-125"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 opacity-60"></div>

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h3 className="text-base font-bold text-gray-800 tracking-tight">
              Browse by Subject
            </h3>
          </div>

          {selectedSubject !== 'all' && (
            <button
              onClick={() => onSubjectChange('all')}
              className="group/clear flex items-center gap-1.5 px-4 py-2 text-sm text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 font-medium transition-all duration-300 rounded-lg border border-blue-200 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-200"
            >
              <span>Clear filter</span>
            </button>
          )}
        </div>

        <div className="mb-7">
          <Input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={onSearchChange}
            leftIcon={<Search className="w-5 h-5" />}
            size="md"
            disabled={isLoading && subjectOptions.length === 1}
          />
        </div>

        <div
          ref={containerRef}
          className={
            needsToggle
              ? `transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded || !canCollapse ? 'max-h-[30rem] overflow-y-auto' : 'max-h-24'
                }`
              : 'transition-all duration-300 ease-in-out max-h-[30rem] overflow-y-auto'
          }
        >
          <div className="flex flex-wrap gap-3 justify-center py-1">
            {filteredSubjects.map((subject) => {
              const isActive = selectedSubject === subject.value;
              const activeClasses =
                'border-blue-300 ring-2 ring-blue-600 text-blue-600 bg-blue-50';
              const inactiveClasses =
                'text-gray-600 border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white';

              return (
                <button
                  key={subject.value}
                  ref={isActive ? selectedButtonRef : null}
                  onClick={() => handleSubjectChange(subject.value)}
                  className={`${baseButtonClasses} ${
                    isActive ? activeClasses : inactiveClasses
                  }`}
                >
                  {subject.icon}
                  <span>{subject.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {needsToggle && filteredSubjects.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-200/50 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500"></div>
            <button
              onClick={onToggleExpand}
              className={`group/toggle flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-semibold transition-all duration-300 rounded-xl ${
                isExpanded && !canCollapse
                  ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                  : 'text-blue-600 hover:text-blue-700 bg-gradient-to-r from-blue-50/50 to-blue-50/70 hover:from-blue-100 hover:to-blue-100 border border-blue-200/50 hover:border-blue-300 hover:shadow-md'
              }`}
              disabled={isExpanded && !canCollapse}
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="w-4 h-4 transition-transform duration-300 group-hover/toggle:-translate-y-1" />
                </>
              ) : (
                <>
                  <span>Show All Subjects ({subjectOptions.length})</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover/toggle:translate-y-1" />
                </>
              )}
            </button>
          </div>
        )}

        {!isLoading && filteredSubjects.length === 0 && (
          <div className="text-center text-gray-500 py-12 px-4">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full blur-xl opacity-40"></div>
              <SearchX className="relative w-14 h-14 mx-auto text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">No Subjects Found</p>
            <p className="text-sm text-gray-500">Try a different search term.</p>
          </div>
        )}

        {isLoading && subjectOptions.length === 1 && (
          <div className="text-center text-gray-500 py-12 px-4">
            <p className="font-semibold text-gray-700 mb-1">Loading subjects...</p>
            <p className="text-sm text-gray-500">Please wait a moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
