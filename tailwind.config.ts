import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        heading: "rgb(var(--heading) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          dark: "rgb(var(--muted-dark) / <alpha-value>)",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      fontSize: {
        tick: ["0.6875rem", { lineHeight: "1.4" }],
        meta: ["0.8125rem", { lineHeight: "1.4" }],
        sm: ["0.9375rem", { lineHeight: "1.6" }],
        base: ["1.125rem", { lineHeight: "1.65" }],
        lead: ["1.375rem", { lineHeight: "1.45" }],
        h3: ["1.75rem", { lineHeight: "1.3" }],
        h2: ["2.25rem", { lineHeight: "1.2" }],
        h1: ["3rem", { lineHeight: "1.1" }],
        display: ["clamp(2.5rem, 6vw, 4rem)", { lineHeight: "1.05" }],
      },
    },
  },
  plugins: [],
};
export default config;
