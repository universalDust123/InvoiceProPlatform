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
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        surface: {
          0:   '#050509',
          1:   '#0a0a12',
          2:   '#0f0f1a',
          3:   '#151523',
        },
      },
      boxShadow: {
        'glow-xs':  '0 0 10px rgba(99,102,241,0.2)',
        'glow-sm':  '0 0 20px rgba(99,102,241,0.3)',
        'glow':     '0 0 0 1px rgba(99,102,241,0.4), 0 0 30px rgba(99,102,241,0.35), 0 0 60px rgba(99,102,241,0.15)',
        'glow-lg':  '0 0 0 1px rgba(99,102,241,0.5), 0 0 50px rgba(99,102,241,0.5), 0 0 100px rgba(99,102,241,0.2)',
        'card':     '0 1px 0 rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.45)',
        'card-hover': '0 1px 0 rgba(255,255,255,0.08), 0 30px 60px rgba(0,0,0,0.55)',
        'inset-top': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'glow-pulse':  'glow-pulse 3s ease-in-out infinite',
        'fade-up':     'fade-up 0.5s ease-out',
        'fade-in':     'fade-in 0.4s ease-out',
        'slide-right': 'slide-right 0.35s ease-out',
        'float':       'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 0 1px rgba(99,102,241,0.35), 0 0 25px rgba(99,102,241,0.25), 0 0 50px rgba(99,102,241,0.12)',
          },
          '50%': {
            boxShadow: '0 0 0 1px rgba(99,102,241,0.55), 0 0 40px rgba(99,102,241,0.45), 0 0 80px rgba(99,102,241,0.22)',
          },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-right': {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;