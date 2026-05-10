/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            boxShadow: {
                'neu': '6px 6px 12px #b8b9be, -6px -6px 12px #ffffff',
                'neu-inset': 'inset 4px 4px 8px #b8b9be, inset -4px -4px 8px #ffffff',
                'neu-sm': '3px 3px 6px #b8b9be, -3px -3px 6px #ffffff',
            },
            colors: {
                'neu-base': '#e0e5ec',
                'accent': '#a78bfa',
            }
        },
    },
    plugins: [],
}