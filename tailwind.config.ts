import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F7F4",
        surface: "#FFFFFF",
        ink: { DEFAULT: "#15181D", 2: "#4A5160", 3: "#8A91A0" },
        line: "#E5E8E3",
        sage: { DEFAULT: "#1E7A68", soft: "#E3F1EC" },
        amber: { DEFAULT: "#D9962B", soft: "#FBF1DF" },
        sky: { DEFAULT: "#3F63D9", soft: "#E6EBFB" },
        rose: { DEFAULT: "#C9484D", soft: "#FBE7E7" },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      borderRadius: { xl: "1.25rem", "2xl": "1.75rem" },
      boxShadow: {
        card: "0 1px 2px rgba(21,24,29,0.04), 0 8px 24px -12px rgba(21,24,29,0.10)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
