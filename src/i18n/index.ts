import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { translations, TranslationKey, type Translations } from './zh';
import { enTranslations } from './en';

export type Language = 'zh' | 'en';

const STORAGE_KEY = 'todo-app-language';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
export { I18nContext };

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'zh';
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === 'zh' || stored === 'en') return stored;
  } catch {
    // localStorage 不可用,降级用浏览器语言
  }
  const browserLang = navigator.language?.toLowerCase() || '';
  if (browserLang.startsWith('zh')) return 'zh';
  return 'en';
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? `{${k}}` : String(v);
  });
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // 同步 html lang 属性 + localStorage
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const dict: Translations = language === 'zh' ? translations : enTranslations;
      const raw = dict[key];
      if (raw === undefined) {
        // 关键设计:未找到 key 直接返回 key 本身,方便一眼看出漏译
        if (import.meta.env.DEV) {
          console.warn(`[i18n] Missing translation for key "${key}" in language "${language}"`);
        }
        return key;
      }
      return interpolate(raw, vars);
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return ctx;
}

/**
 * 开发期自检:确保中英两份词典的 key 集合完全一致。
 * 在 main.tsx 开发模式下自动调用,key 不匹配时控制台报错。
 */
export function assertTranslationsComplete(): void {
  const zhKeys = new Set(Object.keys(translations));
  const enKeys = new Set(Object.keys(enTranslations));
  const missingInEn: string[] = [];
  const extraInEn: string[] = [];

  zhKeys.forEach((k) => {
    if (!enKeys.has(k)) missingInEn.push(k);
  });
  enKeys.forEach((k) => {
    if (!zhKeys.has(k)) extraInEn.push(k);
  });

  if (missingInEn.length || extraInEn.length) {
    console.error(
      `[i18n] Translation mismatch detected.\n` +
        `  Missing in en: ${missingInEn.length} keys -> ${JSON.stringify(missingInEn)}\n` +
        `  Extra in en:  ${extraInEn.length} keys -> ${JSON.stringify(extraInEn)}`
    );
  } else {
    console.info(`[i18n] ✓ All ${zhKeys.size} translation keys are in sync.`);
  }
}
