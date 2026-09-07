import { createContext, useContext, type ReactNode } from 'react';
import { colors as lightColors } from './colors';
import { resolveColors, type ColorTokens, type ThemeMode } from './palettes';

type ThemeContextValue = {
  colors: ColorTokens;
  isDark: boolean;
};

const fallback: ThemeContextValue = {
  colors: lightColors,
  isDark: false,
};

const ThemeContext = createContext<ThemeContextValue>(fallback);

export function ThemeProvider({
  mode,
  themeColor,
  systemDark,
  children,
}: {
  mode: ThemeMode;
  themeColor: string;
  systemDark: boolean;
  children: ReactNode;
}) {
  const isDark = mode === 'dark' || (mode === 'system' && systemDark);
  const colors = resolveColors({ mode, themeColor, systemDark });
  return <ThemeContext.Provider value={{ colors, isDark }}>{children}</ThemeContext.Provider>;
}

export function useColors(): ColorTokens {
  return useContext(ThemeContext).colors;
}

export function useIsDark(): boolean {
  return useContext(ThemeContext).isDark;
}
