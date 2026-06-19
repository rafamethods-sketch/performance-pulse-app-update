import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        panel: "#f3f7fb",
        line: "#d8e0ea",
        moss: "#0f8b6d",
        clay: "#ef5d3d",
        steel: "#2563eb",
        mint: "#d8f7e8",
        wheat: "#fff1b8",
        coral: "#ff6b5f",
        sky: "#dcecff",
        violet: "#ece4ff"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(21, 21, 21, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
