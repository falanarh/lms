import React from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
}

/**
 * LoadMoreButton - Modern, minimalis button untuk infinite scroll
 *
 * Features:
 * - Compact dan minimalis design
 * - Smooth micro-interactions
 * - Color scheme integration
 * - Responsive sizing
 * - Elegant loading states
 */
export function LoadMoreButton({
  onLoadMore,
  loading,
  hasMore,
  disabled = false,
  className = '',
  children = 'Tampilkan lebih banyak',
  variant = 'primary',
  size = 'md',
  align = 'center',
}: LoadMoreButtonProps) {
  const isDisabled = disabled || loading || !hasMore;

  // Alignment classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // End state - compact text
  if (!hasMore && !loading) {
    return (
      <div className={`py-8 ${alignmentClasses[align]}`}>
        <p className="text-xs text-[var(--color-foreground-muted)] tracking-wide uppercase font-medium">
          Akhir dari daftar
        </p>
      </div>
    );
  }

  // Size configurations
  const sizeClasses = {
    sm: variant === 'minimal' ? 'text-xs py-1' : 'px-4 py-2 text-xs',
    md: variant === 'minimal' ? 'text-sm py-1.5' : 'px-6 py-2.5 text-sm',
    lg: variant === 'minimal' ? 'text-sm py-2' : 'px-8 py-3 text-sm',
  };

  // Variant configurations
  const variantClasses = {
    primary: `
      bg-[var(--color-primary,#2563eb)]
      text-white
      hover:bg-[var(--color-primary-600,#1d4ed8)]
      focus:ring-2
      focus:ring-[var(--color-primary-50,rgba(37,99,235,0.1))]
      focus:ring-offset-2
      shadow-sm
      hover:shadow-md
      transition-all
      duration-200
    `,
    secondary: `
      bg-white
      text-[var(--color-primary,#2563eb)]
      border border-[var(--color-primary-200,rgba(37,99,235,0.2))]
      hover:bg-[var(--color-primary-50,rgba(37,99,235,0.04))]
      hover:border-[var(--color-primary-300,rgba(37,99,235,0.3))]
      focus:ring-2
      focus:ring-[var(--color-primary-50,rgba(37,99,235,0.1))]
      focus:ring-offset-2
      transition-all
      duration-200
    `,
    minimal: `
      text-[var(--color-primary,#2563eb)]
      hover:text-[var(--color-primary-600,#1d4ed8)]
      hover:bg-[var(--color-primary-50,rgba(37,99,235,0.04))]
      focus:outline-none
      focus:text-[var(--color-primary-600,#1d4ed8)]
      focus:bg-[var(--color-primary-50,rgba(37,99,235,0.04))]
      transition-all
      duration-200
      ml-8
      shadow-none
      border-none
      bg-transparent
    `,
  };

  const buttonClasses = `
    inline-flex items-center justify-center
    font-medium
    ${variant === 'minimal' ? 'rounded-none' : 'rounded-full'}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <div className={`pt-2 pb-4 ${alignmentClasses[align]}`}>
      <button
        onClick={onLoadMore}
        disabled={isDisabled}
        className={buttonClasses}
        aria-label={loading ? 'Memuat lebih banyak' : children as string}
      >
        {loading ? (
          <>
            <span className="mr-2">Memuat...</span>
            <Loader2
              className="w-3.5 h-3.5 animate-spin"
              aria-hidden="true"
            />
          </>
        ) : (
          <>
            <span className="mr-1.5">{children}</span>
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>
    </div>
  );
}

/**
 * CompactLoadMoreButton - Variant yang lebih minimalis
 * untuk integrasi yang lebih seamless dengan content
 */
export function CompactLoadMoreButton(props: Omit<LoadMoreButtonProps, 'size'>) {
  return (
    <LoadMoreButton
      {...props}
      size="sm"
      variant="minimal"
      children="Lihat lebih banyak"
    />
  );
}

export default LoadMoreButton;