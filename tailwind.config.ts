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
        sepia: "#fff9f1",
        ink: "#2c2c2c",
        wine: "#722F37",
        gold: "#b8986e",
        parchment: "#fef7ed",
        stone: "#8c8278",
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
