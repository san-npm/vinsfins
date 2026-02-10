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
        burgundy: "#722F37",
        gold: "#C9A96E",
        cream: "#FFF9F1",
        charcoal: "#2C2C2C",
        sage: "#8B9E7E",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        sans: ["Source Sans Pro", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
