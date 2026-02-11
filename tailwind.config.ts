import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", "[data-theme=\"dark\"]"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: "#8c3a3e",
        gold: "#b8a07e",
        cream: "#f5f0eb",
        charcoal: "#1a1a1a",
        sage: "#7a8c72",
        noir: "#1a1a1a",
        offwhite: "#f5f0eb",
        "dark-surface": "#2a2a2a",
        "dark-gold": "#c4a882",
        "dark-red": "#c53030",
      },
      fontFamily: {
        caveat: ["Caveat", "cursive"],
        playfair: ["Playfair Display", "serif"],
        sans: ["Source Sans Pro", "sans-serif"],
      },
      letterSpacing: {
        luxury: "0.25em",
        wider: "0.15em",
      },
      transitionDuration: {
        "600": "600ms",
        "700": "700ms",
      },
    },
  },
  plugins: [],
};
export default config;
