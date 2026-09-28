import { useEffect, useMemo, useState } from "react";
import { AccessibilityContext } from "./AcessibilidadeContext";
import type { AccessibilityContextValue, AccessibilityPreferences } from "./AcessibilidadeContext";

const STORAGE_KEY = "consattentia-accessibility";

const defaults: AccessibilityPreferences = {
  colorFilter: "none",
  textScale: 100,
  wideLetters: false,
  highContrast: false,
  dyslexiaFriendly: false,
  reducedMotion: false,
  vlibras: false,
};

function loadPreferences(): AccessibilityPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(loadPreferences);

  useEffect(() => {
    document.documentElement.style.fontSize = `${preferences.textScale}%`;
    return () => {
      document.documentElement.style.removeProperty("font-size");
    };
  }, [preferences.textScale]);

  const value = useMemo<AccessibilityContextValue>(() => ({
    preferences,
    updatePreferences: (updates) => {
      setPreferences((current) => {
        const next = { ...current, ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    resetPreferences: () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      setPreferences(defaults);
    },
  }), [preferences]);

  const accessibilityClasses = [
    "accessibilityRoot",
    preferences.colorFilter !== "none" ? `accessibility-${preferences.colorFilter}` : "",
    preferences.wideLetters ? "accessibility-wide-letters" : "",
    preferences.highContrast ? "accessibility-high-contrast" : "",
    preferences.dyslexiaFriendly ? "accessibility-dyslexia-friendly" : "",
    preferences.reducedMotion ? "accessibility-reduced-motion" : "",
  ].filter(Boolean).join(" ");

  return (
    <AccessibilityContext.Provider value={value}>
      <div className={accessibilityClasses}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}