/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    // 👇 NEW package name for Tailwind v4
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
