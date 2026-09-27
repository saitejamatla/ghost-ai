import { dark } from "@clerk/ui/themes";

// Clerk's dark theme, with variables mapped onto the Ghost AI palette in globals.css.
export const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorPrimaryForeground: "var(--bg-base)",
    colorBackground: "var(--bg-surface)",
    colorForeground: "var(--text-primary)",
    colorMuted: "var(--bg-subtle)",
    colorMutedForeground: "var(--text-muted)",
    colorInput: "var(--bg-elevated)",
    colorInputForeground: "var(--text-primary)",
    // Clerk renders borders at ~10% alpha of this color, so it needs a light base to stay visible.
    colorBorder: "var(--text-secondary)",
    colorRing: "var(--accent-primary)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
    colorWarning: "var(--state-warning)",
    colorNeutral: "var(--text-primary)",
    fontFamily: "var(--font-geist-sans)",
    borderRadius: "var(--radius)",
  },
};
