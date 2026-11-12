
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  useEffect,
} from "react";

const ThemeLanguageContext = createContext(null);

const LANGUAGE_EVENT = "tourism-language-change";
const THEME_EVENT = "tourism-theme-change";

// ========================================
// Read Saved Settings
// ========================================

function getSavedLanguage() {
  try {
    const saved = localStorage.getItem("language");

    return saved === "bn" || saved === "en" ? saved : "en";
  } catch {
    return "en";
  }
}

function getSavedTheme() {
  try {
    return localStorage.getItem("theme") === "dark";
  } catch {
    return false;
  }
}

// ========================================
// External Store Subscriptions
// ========================================

function subscribeToLanguage(callback) {
  window.addEventListener(LANGUAGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(LANGUAGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function subscribeToTheme(callback) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function subscribeToHydration() {
  return () => {};
}

// ========================================
// Theme & Language Provider
// ========================================

export function ThemeLanguageProvider({ children }) {
  // Server and first hydration render use the same defaults.
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getSavedLanguage,
    () => "en"
  );

  const darkMode = useSyncExternalStore(
    subscribeToTheme,
    getSavedTheme,
    () => false
  );

  // Becomes true after hydration without an effect-based setState.
  const settingsLoaded = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  // ========================================
  // Update HTML Document Language
  // ========================================

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // ========================================
  // Apply Global Theme
  // ========================================

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    document.documentElement.style.colorScheme = darkMode
      ? "dark"
      : "light";
  }, [darkMode]);

  // ========================================
  // Language Setter
  // ========================================

  const setLanguage = useCallback((value) => {
    const current = getSavedLanguage();

    const next =
      typeof value === "function" ? value(current) : value;

    if (next !== "en" && next !== "bn") {
      return;
    }

    try {
      localStorage.setItem("language", next);
    } catch {
      // In-memory storage may be unavailable.
    }

    window.dispatchEvent(new Event(LANGUAGE_EVENT));
  }, []);

  // ========================================
  // Theme Setter
  // ========================================

  const setDarkMode = useCallback((value) => {
    const current = getSavedTheme();

    const next =
      typeof value === "function" ? value(current) : value;

    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // In-memory storage may be unavailable.
    }

    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  // ========================================
  // Context Value
  // ========================================

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      darkMode,
      setDarkMode,
      settingsLoaded,
    }),
    [
      language,
      setLanguage,
      darkMode,
      setDarkMode,
      settingsLoaded,
    ]
  );

  return (
    <ThemeLanguageContext.Provider value={contextValue}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

// ========================================
// Custom Hook
// ========================================

export function useAppSettings() {
  const context = useContext(ThemeLanguageContext);

  if (!context) {
    throw new Error(
      "useAppSettings must be used inside ThemeLanguageProvider"
    );
  }

  return context;
}
