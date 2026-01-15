// postcss.config.js
module.exports = {
  plugins: {
    // Run Tailwind first, so it can transform @tailwind directives
    "@tailwindcss/postcss": {},
    // Then add vendor prefixes
    autoprefixer: {},
  },
};
