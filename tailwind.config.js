/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,ts}'],
	theme: {
		extend: {
			backgroundImage: {
				'background-primary': 'radial-gradient(circle at 50% 150%, #AE4862 0%, #773344 22%, #2C1A30 60%, #12081D 100%)',
			},
			colors: {
				my: {
					blue: '#0D3B66',
					orange: '#F87060',
					burgundy: '#601410',
					green: '#0C740A',
					glass: '#FFFFFF10',
				},
				font: {
					primary: '#D9D9D9',
					secondary: '#A5A5A5',
					disabled: '#000000',
					button: '#FFFFFF',
					authSubtitle: '#48A9A6',
				},
			},
			animation: {
				'loading-spin': 'loading-spin 2.5s ease-in-out infinite both',
			},
			keyframes: {
				'loading-spin': {
					'0%': { transform: 'rotate(45deg)' },
					'100%': { transform: 'rotate(405deg)' },
				},
			},
		},
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [],
	},
}
