'use client';

import * as React from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>('light');
  const [mounted, setMounted] = React.useState(false);
  const STORAGE_KEY = 'theme';
  const PREFERENCE_KEY = 'theme_preference_set';

  React.useEffect(() => {
    setMounted(true);
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const preferenceWasSet = window.localStorage.getItem(PREFERENCE_KEY) === 'true';
    const initialTheme =
      preferenceWasSet && (saved === 'dark' || saved === 'light') ? (saved as Theme) : 'light';

    setTheme(initialTheme);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem(STORAGE_KEY, theme);
    try {
      // Also persist theme in a cookie so SSR or other contexts can read it
      // Max-Age ~ 1 year
      document.cookie = `theme=${theme};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    } catch { }
  }, [theme, mounted]);

  const applyTheme = React.useCallback((nextTheme: Theme) => {
    window.localStorage.setItem(PREFERENCE_KEY, 'true');
    setTheme(nextTheme);
  }, []);

  const toggleTheme = React.useCallback(() => {
    window.localStorage.setItem(PREFERENCE_KEY, 'true');
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme: applyTheme, toggleTheme, mounted };
}
