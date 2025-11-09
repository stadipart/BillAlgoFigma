export interface ThemeTokens {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  border: string;
  borderHover: string;
  divider: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  sidebarBg: string;
  sidebarSurface: string;
  sidebarText: string;
  sidebarTextMuted: string;
  sidebarActive: string;
  sidebarBorder: string;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  inputBg: string;
  inputBorder: string;
  ring: string;
}

export interface CompleteTheme {
  id: string;
  name: string;
  description: string;
  previewGradient: string[];
  light: ThemeTokens;
  dark: ThemeTokens;
  classicDark: ThemeTokens;
}

export type ThemeMode = "light" | "dark" | "classic-dark" | "system";
export type ThemeId = "ocean-blue" | "emerald-green" | "slate-minimal";
