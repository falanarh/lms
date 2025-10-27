import React from "react";

/**
 * CourseInfoCard Component
 * 
 * A reusable card component for displaying course information with icon, label, and value.
 * Features hover effects, customizable colors, and optional status indicator.
 * 
 * @example
 * ```tsx
 * <CourseInfoCard
 *   icon={BookOpen}
 *   label="Metode"
 *   value="Self-Paced (Mandiri)"
 *   iconGradient="from-blue-500 to-blue-600"
 *   hoverColor="blue"
 *   showStatusDot
 * />
 * ```
 */

interface CourseInfoCardProps {
  /** Icon component from lucide-react */
  icon: React.ComponentType<{className?: string; strokeWidth?: number}>;
  
  /** Label text displayed above the value (e.g., "Metode", "Durasi") */
  label: string;
  
  /** Main value text displayed prominently (e.g., "Self-Paced", "10 Weeks") */
  value: string;
  
  /** Optional description text displayed below the value */
  description?: string;
  
  /** Tailwind gradient classes for icon background (e.g., "from-blue-500 to-blue-600") */
  iconGradient?: string;
  
  /** Hover effect color - determines border and shadow colors on hover */
  hoverColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';
  
  /** Show status indicator dot in top-right of icon */
  showStatusDot?: boolean;
  
  /** Status dot color */
  statusDotColor?: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
  
  /** Optional click handler */
  onClick?: () => void;
  
  /** Additional CSS classes */
  className?: string;
}

export function CourseInfoCard({
  icon: Icon,
  label,
  value,
  description,
  iconGradient = "from-blue-500 to-blue-600",
  hoverColor = "blue",
  showStatusDot = false,
  statusDotColor = "green",
  onClick,
  className = ""
}: CourseInfoCardProps) {
  
  // Hover color configurations
  const hoverColors = {
    blue: "hover:border-blue-300 hover:shadow-blue-100/50",
    green: "hover:border-green-300 hover:shadow-green-100/50",
    purple: "hover:border-purple-300 hover:shadow-purple-100/50",
    orange: "hover:border-orange-300 hover:shadow-orange-100/50",
    red: "hover:border-red-300 hover:shadow-red-100/50",
    pink: "hover:border-pink-300 hover:shadow-pink-100/50"
  };
  
  // Status dot color configurations
  const statusDotColors = {
    green: "bg-green-400",
    blue: "bg-blue-400",
    yellow: "bg-yellow-400",
    red: "bg-red-400",
    gray: "bg-gray-400"
  };
  
  return (
    <div 
      className={`group relative bg-white rounded-xl p-5 border border-gray-200 ${hoverColors[hoverColor]} hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon Container */}
        <div className="relative">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
            <Icon className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          
          {/* Status Indicator Dot */}
          {showStatusDot && (
            <div className={`absolute -top-1 -right-1 w-3 h-3 ${statusDotColors[statusDotColor]} rounded-full border-2 border-white`}></div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="font-semibold text-[13px] text-gray-500 mb-1.5 uppercase tracking-wide">
            {label}
          </div>
          <div className="font-semibold text-[16px] text-gray-900 leading-tight">
            {value}
          </div>
          {description && (
            <div className="font-normal text-[13px] text-gray-600 mt-1.5 leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * CourseInfoGrid Component
 * 
 * A grid container for displaying multiple CourseInfoCard components.
 * Automatically handles responsive layout.
 * 
 * @example
 * ```tsx
 * <CourseInfoGrid>
 *   <CourseInfoCard {...props1} />
 *   <CourseInfoCard {...props2} />
 * </CourseInfoGrid>
 * ```
 */

interface CourseInfoGridProps {
  /** Child CourseInfoCard components */
  children: React.ReactNode;
  
  /** Number of columns in different breakpoints */
  columns?: {
    mobile?: 1 | 2;
    tablet?: 2 | 3;
    desktop?: 2 | 3 | 4;
  };
  
  /** Gap between cards */
  gap?: 'sm' | 'md' | 'lg';
  
  /** Additional CSS classes */
  className?: string;
}

export function CourseInfoGrid({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = ""
}: CourseInfoGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  };
  
  const columnClasses = `grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`;
  
  return (
    <div className={`grid ${columnClasses} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}
