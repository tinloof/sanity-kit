const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./intro-template/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		...defaultTheme,
		// Overriding fontFamily to use @next/font loaded families
		fontFamily: {
			mono: "var(--font-mono)",
			sans: "var(--font-sans)",
			serif: "var(--font-serif)",
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
