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
        samsic: {
          marine: "var(--samsic-marine)",
          "marine-80": "var(--samsic-marine-80)",
          "marine-50": "var(--samsic-marine-50)",
          "marine-30": "var(--samsic-marine-30)",
          sable: "var(--samsic-sable)",
          "sable-80": "var(--samsic-sable-80)",
          "sable-50": "var(--samsic-sable-50)",
          "sable-30": "var(--samsic-sable-30)",
          bleu: "var(--samsic-bleu)",
          "bleu-80": "var(--samsic-bleu-80)",
          "bleu-50": "var(--samsic-bleu-50)",
          "bleu-30": "var(--samsic-bleu-30)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          bg: "var(--color-danger-bg)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          bg: "var(--color-success-bg)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          bg: "var(--color-warning-bg)",
        },
        simulation: {
          DEFAULT: "var(--color-simulation)",
          bg: "var(--color-simulation-bg)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        card: "var(--card)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
