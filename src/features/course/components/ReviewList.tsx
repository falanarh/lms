interface ReviewListProps {
  children: React.ReactNode;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ReviewList({ 
  children, 
  gap = 'md',
  className = "" 
}: ReviewListProps) {
  const gaps = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6'
  };
  
  return (
    <div className={`${gaps[gap]} ${className}`}>
      {children}
    </div>
  );
}