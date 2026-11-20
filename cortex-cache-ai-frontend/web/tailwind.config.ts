import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "100%" },
        },
        "accordion-up": {
          from: { height: "100%" },
          to: { height: "0" },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      fontFamily: {
        mono: ['"Fira Code"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  variants: {
    extend: {
      animation: ['delay-75', 'delay-150'],
    }
  },
  plugins: [
    function ({ addUtilities }: unknown) {
      const newUtilities = {
        '.delay-75': {
          'animation-delay': '75ms',
        },
        '.delay-150': {
          'animation-delay': '150ms',
        },
      }
      addUtilities(newUtilities)
    },
    require("tailwindcss-animate"),
  ],
};
export default config;

