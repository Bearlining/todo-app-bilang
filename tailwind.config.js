/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'var(--color-pink-500)',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'var(--color-mint-200)',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				// 马卡龙色板 - 使用CSS变量实现主题切换
				pink: {
					50: 'var(--color-pink-50)',
					100: 'var(--color-pink-100)',
					200: 'var(--color-pink-200)',
					300: 'var(--color-pink-300)',
					400: 'var(--color-pink-400)',
					500: 'var(--color-pink-500)',
				},
				peach: {
					50: 'var(--color-peach-50)',
					100: 'var(--color-peach-100)',
					200: 'var(--color-peach-200)',
					300: 'var(--color-peach-300)',
					400: 'var(--color-peach-400)',
				},
				mint: {
					50: 'var(--color-mint-50)',
					100: 'var(--color-mint-100)',
					200: 'var(--color-mint-200)',
					300: 'var(--color-mint-300)',
					400: 'var(--color-mint-400)',
				},
				sky: {
					50: 'var(--color-sky-50)',
					100: 'var(--color-sky-100)',
					200: 'var(--color-sky-200)',
					300: 'var(--color-sky-300)',
					400: 'var(--color-sky-400)',
				},
				lavender: {
					50: 'var(--color-lavender-50)',
					100: 'var(--color-lavender-100)',
					200: 'var(--color-lavender-200)',
					300: 'var(--color-lavender-300)',
					400: 'var(--color-lavender-400)',
				},
				cream: {
					50: 'var(--color-cream-50)',
					100: 'var(--color-cream-100)',
					200: 'var(--color-cream-200)',
					300: 'var(--color-cream-300)',
					400: 'var(--color-cream-400)',
				},
				berry: {
					50: 'var(--color-berry-50)',
					100: 'var(--color-berry-100)',
					200: 'var(--color-berry-200)',
					300: 'var(--color-berry-300)',
					400: 'var(--color-berry-400)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'pulse-soft': {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0.6 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
