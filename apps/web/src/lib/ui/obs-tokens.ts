/** Observatory design tokens — shared between Tailwind theme and TS consumers */

export const obsColors = {
  void: "#050506",
  surface: "#0C0C0F",
  elevated: "#141418",
  border: "#2A2A32",
  borderAccent: "rgba(124, 58, 237, 0.4)",
  violet: "#8B5CF6",
  violetDim: "#5B21B6",
  signal: "#A78BFA",
  danger: "#DC2626",
  warning: "#F59E0B",
  success: "#10B981",
  muted: "#71717A",
} as const;

export const obsRadii = {
  panel: "6px",
  button: "4px",
} as const;
