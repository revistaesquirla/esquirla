import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon: '#0D0C0B',
        paper: '#F1EDE4',
        rojo: '#E02118',
        'rojo-oscuro': '#6B0F0A',
        cemento: '#8B8983',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        block: '6px 6px 0 0 #0D0C0B',
        'block-rojo': '6px 6px 0 0 #E02118',
        'block-sm': '3px 3px 0 0 #0D0C0B',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        rise: 'rise .5s cubic-bezier(.2,.7,.3,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
