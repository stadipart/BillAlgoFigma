import { createContext, useContext, useEffect, useState } from "react";
import { completeThemes } from "../config/complete-themes";

type Theme = "light" | "dark" | "classic-dark" | "system";
type ResolvedTheme = "light" | "dark" | "classic-dark";
type ColorTheme = string;

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColorTheme?: ColorTheme;
};

type CustomColors = {
  primary: string;
  accent: string;
  secondary: string;
  background: string;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  colorTheme: ColorTheme;
  customColors: CustomColors | null;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  toggleTheme: () => void;
  applyCustomColors: (colors: CustomColors) => void;
  resetToDefault: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeColors(colorTheme: ColorTheme, appearance: ResolvedTheme, customColors?: CustomColors | null) {
  const root = document.documentElement;

  if (customColors) {
    root.style.setProperty("--theme-primary", customColors.primary);
    root.style.setProperty("--theme-accent", customColors.accent);
    root.style.setProperty("--theme-background", customColors.background);
    return;
  }

  const selectedTheme = completeThemes.find(t => t.id === colorTheme);
  if (!selectedTheme) return;

  const colors = selectedTheme[appearance];

  Object.entries(colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--theme-${cssKey}`, value);
  });
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorTheme = "ocean-blue",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      return stored || defaultTheme;
    }
    return defaultTheme;
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("colorTheme") || defaultColorTheme;
    }
    return defaultColorTheme;
  });

  const [customColors, setCustomColors] = useState<CustomColors | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("customColors");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (theme === "system") {
      return getSystemTheme();
    }
    return theme as ResolvedTheme;
  });

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    if (theme === "system") {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(theme as ResolvedTheme);
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "classic-dark");
    root.classList.add(resolvedTheme);
    localStorage.setItem("theme", theme);

    applyThemeColors(colorTheme, resolvedTheme, customColors);
  }, [theme, resolvedTheme, colorTheme, customColors]);

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme);
    setCustomColors(null);
    localStorage.setItem("colorTheme", newColorTheme);
    localStorage.removeItem("customColors");
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("classic-dark");
    } else {
      setTheme("light");
    }
  };

  const applyCustomColors = (colors: CustomColors) => {
    setCustomColors(colors);
    localStorage.setItem("customColors", JSON.stringify(colors));
  };

  const resetToDefault = () => {
    setCustomColors(null);
    setColorThemeState(defaultColorTheme);
    localStorage.removeItem("customColors");
    localStorage.setItem("colorTheme", defaultColorTheme);
  };

  const value = {
    theme,
    resolvedTheme,
    colorTheme,
    customColors,
    setTheme,
    setColorTheme,
    toggleTheme,
    applyCustomColors,
    resetToDefault,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
