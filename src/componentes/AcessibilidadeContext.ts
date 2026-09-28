import { createContext, useContext } from "react";

export type AccessibilityPreferences = {
  colorFilter: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  textScale: number;
  wideLetters: boolean;
  highContrast: boolean;
  dyslexiaFriendly: boolean;
  reducedMotion: boolean;
  vlibras: boolean;
};

export type AccessibilityContextValue = {
  preferences: AccessibilityPreferences;
  updatePreferences: (updates: Partial<AccessibilityPreferences>) => void;
  resetPreferences: () => void;
};

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility deve ser usado dentro de AccessibilityProvider.");
  return context;
}