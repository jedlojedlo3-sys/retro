import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          light: "#1a1a1a",
          lighter: "#2d2d2d",
        },
        paper: {
          DEFAULT: "#fafafa",
          light: "#ffffff",
          dark: "#f0f0f0",
        },
        warm: "#e8e4df",
        retro: {
          orange: "#ff4d1a",
          amber: "#e63900",
        },
        muted: {
          DEFAULT: "#737373",
          light: "#a3a3a3",
          dark: "#525252",
        },
        surface: {
          DEFAULT: "#f5f5f5",
          elevated: "#ffffff",
          hover: "#efefef",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Bebas Neue", "Impact", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        widest: ".2em",
        tighter: "-.03em",
        tight: "-.015em",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 10px 30px -5px rgb(0 0 0 / 0.12), 0 4px 10px -3px rgb(0 0 0 / 0.08)",
        "modal": "0 25px 60px -12px rgb(0 0 0 / 0.35)",
        "nav": "0 1px 0 0 rgb(0 0 0 / 0.06)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
