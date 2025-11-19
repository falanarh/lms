'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ewarkop-theme',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Get stored theme or use default
    const stored = localStorage.getItem(storageKey) as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    console.log('🎨 Theme Context - Initial Setup:', {
      stored,
      defaultTheme,
      systemTheme,
      storageKey
    });

    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored);
      console.log('🎨 Theme Context - Using stored theme:', stored);
    } else {
      console.log('🎨 Theme Context - Using default theme:', defaultTheme);
    }
  }, [storageKey, defaultTheme]);

  useEffect(() => {
    // Calculate resolved theme
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolved = theme === 'system' ? systemTheme : theme;

    console.log('🎨 Theme Context - Theme Update:', {
      theme,
      systemTheme,
      resolvedTheme: resolved,
      hasDarkClass: root.classList.contains('dark')
    });

    setResolvedTheme(resolved);

    // Add dark class to root if theme is dark
    root.classList.toggle('dark', resolved === 'dark');

    console.log('🎨 Theme Context - After Toggle:', {
      resolvedTheme: resolved,
      hasDarkClass: root.classList.contains('dark')
    });
  }, [theme]);

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    console.log('🎨 Theme Context - Setting up system listener:', {
      theme,
      initialSystemTheme: mediaQuery.matches ? 'dark' : 'light'
    });

    const handleChange = (e: MediaQueryListEvent) => {
      console.log('🎨 Theme Context - System Theme Changed:', {
        matches: e.matches,
        oldSystemTheme: e.matches ? 'light' : 'dark',
        newSystemTheme: e.matches ? 'dark' : 'light',
        currentTheme: theme,
        willUpdate: theme === 'system'
      });

      if (theme === 'system') {
        const systemTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
        document.documentElement.classList.toggle('dark', systemTheme === 'dark');

        console.log('🎨 Theme Context - Updated for system change:', {
          systemTheme,
          hasDarkClass: document.documentElement.classList.contains('dark')
        });
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      console.log('🎨 Theme Context - Cleaning up system listener');
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    const oldTheme = theme;
    console.log('🎨 Theme Context - Manual Theme Change:', {
      oldTheme,
      newTheme,
      systemTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      storageKey
    });

    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const value = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}