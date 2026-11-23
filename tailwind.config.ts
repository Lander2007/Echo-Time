import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'swiss-sans': ['var(--font-inter)', 'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        'swiss-mono': ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'monospace'],
        'echo-monument': ['var(--font-anton)', 'Anton', 'Inter', 'Impact', 'sans-serif'],
      },
      colors: {
        theme: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        accent: {
          DEFAULT: 'var(--accent)',
          text: 'var(--accent-text)',
          ink: 'var(--accent-ink)',
        },
        pop: {
          DEFAULT: 'var(--pop)',
          ink: 'var(--pop-ink)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
