/** Colores brand-* apuntan a variables CSS temáticas (ver src/index.css).
 *  Formato `rgb(var(--x) / <alpha-value>)` para soportar modificadores de
 *  opacidad de Tailwind (ej. bg-brand-accent/10, bg-brand-red/40). */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:           'rgb(var(--bg-ink-rgb) / <alpha-value>)',
          panel:        'var(--bg-panel)',
          surface:      'rgb(var(--bg-elev-rgb) / <alpha-value>)',
          border:       'var(--hairline)',
          'border-md':  'var(--hairline-strong)',
          text:         'rgb(var(--text-rgb) / <alpha-value>)',
          muted:        'var(--color-muted)',
          faint:        'var(--color-faint)',
          accent:       'rgb(var(--accent-rgb) / <alpha-value>)',
          'accent-ink': 'var(--accent-ink)',
          red:          'rgb(var(--danger-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", 'system-ui', 'sans-serif'],
        mono:    ["'Space Mono'", 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
};
