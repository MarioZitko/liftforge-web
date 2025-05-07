const tailwindcss = require("@tailwindcss/postcss"); // ✅ fixed

module.exports = {
	plugins: [tailwindcss, require("autoprefixer")],
};
