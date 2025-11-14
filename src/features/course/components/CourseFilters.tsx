import { Search, X, ChevronDown, Check } from 'lucide-react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { Fragment } from 'react';
import { COURSE_CATEGORIES, SORT_OPTIONS } from '../constant/course';
import { ViewModeToggle } from './ViewModeToggle';
import { ViewModeValue } from '../types';

interface CourseFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: ViewModeValue;
  onViewModeChange: (mode: ViewModeValue) => void;
}

export function CourseFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: CourseFiltersProps) {
  const selectedSortOption =
    SORT_OPTIONS.find((option) => option.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="min-w-[200px]">
          <Listbox value={selectedCategory} onChange={onCategoryChange}>
            <div className="relative">
              <ListboxButton className="relative w-full py-3 pl-4 pr-10 text-left bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <span className="block truncate">{selectedCategory}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown
                    className="h-5 w-5 text-zinc-400 dark:text-zinc-500"
                    aria-hidden="true"
                  />
                </span>
              </ListboxButton>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-zinc-800 py-1 text-base shadow-lg ring-1 ring-black dark:ring-zinc-600 ring-opacity-5 focus:outline-none">
                  {COURSE_CATEGORIES.map((category) => (
                    <ListboxOption
                      key={category}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' : 'text-zinc-900 dark:text-zinc-100'
                        }`
                      }
                      value={category}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                          >
                            {category}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                              <Check className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </div>
          </Listbox>
        </div>

        <div className="min-w-[180px]">
          <Listbox value={sortBy} onChange={onSortChange}>
            <div className="relative">
              <ListboxButton className="relative w-full py-3 pl-4 pr-10 text-left bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 rounded-lg cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <span className="block truncate">
                  {selectedSortOption.label}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown
                    className="h-5 w-5 text-zinc-400 dark:text-zinc-500"
                    aria-hidden="true"
                  />
                </span>
              </ListboxButton>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-zinc-800 py-1 text-base shadow-lg ring-1 ring-black dark:ring-zinc-600 ring-opacity-5 focus:outline-none">
                  {SORT_OPTIONS.map((option) => (
                    <ListboxOption
                      key={option.value}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' : 'text-zinc-900 dark:text-zinc-100'
                        }`
                      }
                      value={option.value}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                          >
                            {option.label}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                              <Check className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Transition>
            </div>
          </Listbox>
        </div>

        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </div>
    </div>
  );
}
