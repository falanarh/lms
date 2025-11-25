import { Course } from '../types';

export const COURSE_CATEGORIES = [
  'All Categories',
  'Programming',
  'Web Development',
];

export const SORT_OPTIONS = [
  { value: 'none', label: 'Sort (none)' },
  { value: 'title-asc', label: 'A to Z' },
  { value: 'title-desc', label: 'Z to A' },
  { value: 'rating-desc', label: 'Highest Rating' },
  { value: 'students-desc', label: 'Most Popular' }
];