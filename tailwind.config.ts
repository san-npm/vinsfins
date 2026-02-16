import type { Config } from "tailwindcss";

const config: Config = {
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
        dark: "#141614",
        "dark-light": "#1c1e1c",
        "dark-card": "#232523",
        cream: "#f0e6d3",
        "cream-muted": "#c4b8a5",
        sepia: "#141614",
        ink: "#f0e6d3",
        wine: "#8b3a3a",
        gold: "#c4a265",
        parchment: "#1c1e1c",
        stone: "#9a9389",
      },
      fontFamily: {
        script: ["Monsieur La Doulaise", "cursive"],
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
