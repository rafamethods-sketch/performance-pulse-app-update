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
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        moss: "rgb(var(--color-moss) / <alpha-value>)",
        clay: "rgb(var(--color-clay) / <alpha-value>)",
        steel: "rgb(var(--color-steel) / <alpha-value>)",
        mint: "rgb(var(--color-mint) / <alpha-value>)",
        wheat: "rgb(var(--color-wheat) / <alpha-value>)",
        coral: "rgb(var(--color-coral) / <alpha-value>)",
        sky: "rgb(var(--color-sky) / <alpha-value>)",
        violet: "rgb(var(--color-violet) / <alpha-value>)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)"
      }
    }
  },
  plugins: []
};

export default config;
