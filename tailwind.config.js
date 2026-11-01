/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#000000',
          1: '#080808',
          2: '#202020',
        },
        paper: {
          DEFAULT: '#FFFFFF',
          2: '#F5F5F5',
        },
        // #A0A0A0 is for text on black (8:1 contrast). On white it only reaches
        // 2.6:1, so secondary text on light sections uses the darker tone.
        mute: {
          DEFAULT: '#A0A0A0',
          dark: '#5E5E5E',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-geist-sans)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Fluid display sizes, Apple-style tight tracking on big type.
        hero: ['clamp(3.25rem, 9.6vw, 9.75rem)', { lineHeight: '0.9', letterSpacing: '-0.055em' }],
        display: ['clamp(2.5rem, 6.4vw, 6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.045em' }],
        headline: ['clamp(1.75rem, 3.4vw, 3.25rem)', { lineHeight: '1.05', letterSpacing: '-0.035em' }],
        title: ['clamp(1.25rem, 1.9vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        lead: ['clamp(1.0625rem, 1.35vw, 1.3125rem)', { lineHeight: '1.55', letterSpacing: '-0.011em' }],
        label: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.16em' }],
      },
      maxWidth: {
        shell: '88rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
