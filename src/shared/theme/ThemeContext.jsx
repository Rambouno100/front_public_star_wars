import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const STORAGE_KEY = 'gm-theme';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // Sin preferencia guardada: claro por defecto.
  return 'light';
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try { window.localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next === 'light' ? 'light' : 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(t => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
