'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'button' | 'dropdown';
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  variant = 'button',
  showLabel = false
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes: { value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }[] = [
    {
      value: 'light',
      icon: <Sun className="h-4 w-4" />,
      label: 'Light'
    },
    {
      value: 'dark',
      icon: <Moon className="h-4 w-4" />,
      label: 'Dark'
    },
    {
      value: 'system',
      icon: <Monitor className="h-4 w-4" />,
      label: 'System'
    },
  ];

  if (variant === 'dropdown') {
    const currentTheme = themes.find(t => t.value === theme) || themes[0];

    return (
      <div className="relative group">
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-all duration-200",
            "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
            "text-gray-700 dark:text-gray-300",
            className
          )}
        >
          {currentTheme.icon}
          {showLabel && <span>{currentTheme.label}</span>}
        </button>

        <div className="absolute top-full left-0 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  theme === themeOption.value
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                {themeOption.icon}
                <span>{themeOption.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        // Cycle through themes: light -> dark -> system -> light
        const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
        setTheme(nextTheme);
      }}
      className={cn(
        "size-10 rounded-full flex items-center justify-center",
        "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
        "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400",
        "transition-all duration-200 hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "focus:ring-offset-white dark:focus:ring-offset-gray-900",
        className
      )}
      aria-label={`Switch theme (current: ${theme})`}
    >
      <Sun size={18} className="h-4 w-4 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
      <Moon  size={18} className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}
        </span>
      )}
    </button>
  );
}