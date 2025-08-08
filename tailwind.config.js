/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}',
      './src/**/*.{ts,tsx}',
    ],
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        // Neurodivergent-friendly typography
        fontFamily: {
          'dyslexia': ['OpenDyslexic', 'Comic Sans MS', 'cursive'],
          'sans': ['Inter', 'system-ui', 'sans-serif'],
          'readable': ['Lexend', 'system-ui', 'sans-serif'],
        },
        fontSize: {
          // Minimum 16px for accessibility
          'xs': ['16px', { lineHeight: '1.6', letterSpacing: '0.025em' }],
          'sm': ['18px', { lineHeight: '1.6', letterSpacing: '0.025em' }],
          'base': ['20px', { lineHeight: '1.7', letterSpacing: '0.025em' }],
          'lg': ['22px', { lineHeight: '1.7', letterSpacing: '0.025em' }],
          'xl': ['24px', { lineHeight: '1.7', letterSpacing: '0.025em' }],
          '2xl': ['28px', { lineHeight: '1.7', letterSpacing: '0.025em' }],
          '3xl': ['32px', { lineHeight: '1.7', letterSpacing: '0.025em' }],
        },
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
          // Neurodivergent-specific colors
          'adhd': {
            'bg': '#000000',
            'text': '#FFFFFF',
            'accent': '#00FF88',
            'secondary': '#FF6B6B',
          },
          'autism': {
            'calm': '#E8F4FD',
            'blue': '#4A90E2',
            'green': '#7ED321',
            'neutral': '#F8F9FA',
            'soft': '#EDF2F7',
          },
          'dyslexia': {
            'cream': '#FDF6E3',
            'beige': '#F7F3E9',
            'yellow': '#FFF2CC',
          },
          // High contrast pairs
          'contrast': {
            'high': '#000000',
            'low': '#FFFFFF',
            'blue': '#0066CC',
            'red': '#CC0000',
          },
          // Calming colors for emotional regulation
          'calm': {
            'mint': '#E6F7F1',
            'lavender': '#F0E6FF',
            'sage': '#E8F5E8',
            'sky': '#E6F3FF',
          }
        },
        spacing: {
          // Generous spacing for motor accessibility
          '18': '4.5rem',
          '88': '22rem',
          '128': '32rem',
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
          // Larger touch targets
          'touch': '12px',
        },
        keyframes: {
          "accordion-down": {
            from: { height: "0" },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: "0" },
          },
          // Gentle animations for neurodivergent users
          "gentle-bounce": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-5px)" },
          },
          "soft-pulse": {
            "0%, 100%": { opacity: "1" },
            "50%": { opacity: "0.8" },
          },
          "calm-fade": {
            "0%": { opacity: "0", transform: "translateY(10px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "gentle-bounce": "gentle-bounce 2s infinite",
          "soft-pulse": "soft-pulse 3s infinite",
          "calm-fade": "calm-fade 0.5s ease-out",
        },
        // Accessibility-focused shadows
        boxShadow: {
          'focus': '0 0 0 3px hsl(var(--ring))',
          'focus-visible': '0 0 0 2px #4A90E2',
          'gentle': '0 2px 8px rgba(0, 0, 0, 0.1)',
          'calm': '0 4px 12px rgba(74, 144, 226, 0.15)',
        },
        // Touch target sizes
        minWidth: {
          'touch': '44px',
        },
        minHeight: {
          'touch': '44px',
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  }