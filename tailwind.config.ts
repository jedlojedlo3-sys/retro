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
          DEFAULT: "#11110f",
          light: "#232320",
          lighter: "#3d3d38",
        },
        paper: {
          DEFAULT: "#f4f1ea",
          light: "#faf8f5",
          dark: "#e8e3d8",
        },
        warm: "#d9d1c4",
        retro: {
          orange: "#ff5a1f",
          amber: "#e65100",
        },
        muted: {
          DEFAULT: "#6f6c65",
          light: "#8e8a82",
          dark: "#524f49",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "DM Sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Bebas Neue", "Impact", "sans-serif"],
      },
      letterSpacing: {
        widest: ".18em",
        tighter: "-.04em",
      },
    },
  },
  plugins: [],
};

export default config;
