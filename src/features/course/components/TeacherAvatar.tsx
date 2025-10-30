import { User } from "lucide-react";
import { useState } from "react";

interface TeacherAvatarProps {
  teacherName: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TeacherAvatar({ 
  teacherName, 
  avatarUrl, 
  size = 'sm',
  className = '' 
}: TeacherAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };
  
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={`${teacherName} avatar`}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }
  
  if (teacherName && teacherName.trim()) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full bg-zinc-100 flex items-center justify-center font-medium text-zinc-600 flex-shrink-0 ${className}`}
        title={teacherName}
      >
        {getInitials(teacherName)}
      </div>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 ${className}`}>
      <User className={`${iconSizeClasses[size]} text-zinc-400`} />
    </div>
  );
}