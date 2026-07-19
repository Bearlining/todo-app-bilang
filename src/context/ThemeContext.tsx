import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeName, initTheme, applyTheme, themes } from '../lib/theme';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themeNames: { key: ThemeName; nameKey: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('default');

  useEffect(() => {
    // Initialize theme from localStorage or use default
    const savedTheme = localStorage.getItem('todo-theme') as ThemeName;
    const initialTheme = savedTheme || 'default';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const handleSetTheme = (newTheme: ThemeName) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // 用 nameKey 而非 name,让消费者用 t() 翻译
  const themeNames = Object.keys(themes).map((key) => ({
    key: key as ThemeName,
    nameKey: themes[key as ThemeName].nameKey,
  }));

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, themeNames }}>
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
