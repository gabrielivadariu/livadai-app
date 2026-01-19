import { MD3DarkTheme as PaperDarkTheme } from "react-native-paper";

export const livadaiColors = {
  background: "#f4f6fb",
  card: "#ffffff",
  border: "#e5e7eb",
  primaryText: "#111827",
  secondaryText: "#6b7280",
  primary: "#00bcd4", // turquoise
  accent: "#16a34a", // vibrant green
  gradient: ["#00bcd4", "#16a34a"],
};

export const livadaiTheme = {
  ...PaperDarkTheme,
  dark: false,
  colors: {
    ...PaperDarkTheme.colors,
    background: livadaiColors.background,
    surface: livadaiColors.card,
    primary: livadaiColors.primary,
    secondary: livadaiColors.accent,
    onSurfaceVariant: livadaiColors.secondaryText,
    text: livadaiColors.primaryText,
    placeholder: livadaiColors.secondaryText,
    border: livadaiColors.border,
    card: livadaiColors.card,
  },
};
