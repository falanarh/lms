export type CourseTabType = 
  | 'information' 
  | 'course_contents' 
  | 'summary' 
  | 'discussion_forum' 
  | 'ratings_reviews';

export interface TabConfig {
  key: CourseTabType;
  label: string;
  icon: React.ReactNode;
}
