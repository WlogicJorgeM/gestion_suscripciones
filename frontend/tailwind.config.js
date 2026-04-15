/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        davivienda: {
          red: "#ED1C24",
          "red-dark": "#C41018",
          "red-light": "#FF4D54",
          white: "#FFFFFF",
          gray: {
            50: "#F9FAFB",
            100: "#F3F4F6",
            200: "#E5E7EB",
            300: "#D1D5DB",
            500: "#6B7280",
            700: "#374151",
            900: "#111827",
          },
        },
      },
    },
  },
  plugins: [],
};
