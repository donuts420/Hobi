/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkRoast: '#181210',
        elevated: '#241B18',
        elevatedBorder: '#2E221E',
        clayBrown: '#6B352A',
        terracotta: '#D36135',
        terracottaHover: '#BF4F25',
        softButter: '#FFF1A6',
        warmCream: '#FAF0D7',
        mutedClay: '#B3A090',
      },
      fontFamily: {
        serif: ['Vollkorn', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Courier Prime"', 'monospace'],
      },
      boxShadow: {
        'dune-sm': '0 2px 8px rgba(24, 18, 16, 0.4)',
        'dune-md': '0 8px 24px rgba(24, 18, 16, 0.6), 0 0 1px rgba(211, 97, 53, 0.2)',
        'dune-lg': '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(211, 97, 53, 0.15)',
        'terracotta-glow': '0 0 20px rgba(211, 97, 53, 0.35)',
      },
      backgroundImage: {
        'desert-gradient': 'radial-gradient(ellipse at top, #241B18 0%, #181210 70%)',
        'perforated-stub': 'radial-gradient(circle at 10px, transparent 10px, #241B18 11px)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [],
};
