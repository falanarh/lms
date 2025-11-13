import { Course } from '../types';

export const COURSE_CATEGORIES = [
  'All Categories',
  'Programming',
  'Web Development',
  'Mobile Development',
  'Database',
  'Data Science'
];

export const SORT_OPTIONS = [
  { value: 'title-asc', label: 'A to Z' },
  { value: 'title-desc', label: 'Z to A' },
  { value: 'rating-desc', label: 'Highest Rating' },
  { value: 'students-desc', label: 'Most Popular' }
];

export const DUMMY_COURSES: Course[] = [
  {
    id: '1',
    title: 'Complete React Development Course',
    categories: 'Programming',
    rating: 4.8,
    teacher: 'John Doe',
    teacherAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    totalStudents: 1250,
    image: 'https://dummyimage.com/600x400/000/fff&text=Course',
    description: 'Learn modern React development with hooks, context, and best practices for building scalable applications.'
  },
  {
    id: '2',
    title: 'Advanced JavaScript Fundamentals',
    categories: 'Programming',
    rating: 4.7,
    teacher: 'Jane Smith',
    teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    totalStudents: 980,
    image: 'https://dummyimage.com/600x400/000/fff&text=Course',
    description: 'Master advanced JavaScript concepts including closures, prototypes, async programming, and ES6+ features.'
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass',
    categories: 'Design',
    rating: 4.9,
    teacher: 'Mike Johnson',
    teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    totalStudents: 1500,
    image: 'https://dummyimage.com/600x400/000/fff&text=Course',
    description: 'Complete guide to user interface and user experience design with hands-on projects and real-world examples.'
  },
  {
    id: '4',
    title: 'Digital Marketing Strategy',
    categories: 'Marketing',
    rating: 4.6,
    teacher: 'Sarah Wilson',
    teacherAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    totalStudents: 750,
    image: 'https://dummyimage.com/600x400/000/fff&text=Course',
    description: 'Comprehensive digital marketing course covering SEO, social media, content marketing, and analytics.'
  },
  {
    id: '5',
    title: 'Data Science with Python',
    categories: 'Data Science',
    rating: 4.8,
    teacher: 'David Brown',
    teacherAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    totalStudents: 1100,
    image: 'https://dummyimage.com/600x400/000/fff&text=Course',
    description: 'Learn data analysis, visualization, and machine learning using Python, pandas, and scikit-learn.'
  },
  {
    id: '6',
    title: 'Business Analytics Fundamentals',
    categories: 'Business',
    rating: 4.5,
    teacher: 'Lisa Davis',
    teacherAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    totalStudents: 650,
    image: 'https://dummyimage.com/600x400/000/fff&text=Course',
    description: 'Essential business analytics skills including data interpretation, reporting, and strategic decision making.'
  },
  {
    id: '7',
    title: 'Modern Web Design Principles',
    categories: 'Design',
    rating: 4.7,
    teacher: 'Alex Chen',
    teacherAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
    totalStudents: 890,
    image: 'https://dummyimage.com/600x400/000/fff&text=Course',
    description: 'Contemporary web design techniques focusing on responsive design, typography, and user-centered approach.'
  },
  {
    id: '8',
    title: 'Node.js Backend Development',
    categories: 'Programming',
    rating: 4.6,
    teacher: 'Robert Taylor',
    teacherAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    totalStudents: 720,
    image: 'https://dummyimage.com/600x400/000/fff&text=Course',
    description: 'Build robust backend applications with Node.js, Express, databases, and API development best practices.'
  }
];