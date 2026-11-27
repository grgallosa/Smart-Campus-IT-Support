/** Design tokens live in src/index.css as CSS variables (light + .dark). */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", sbg: "var(--sbg)", sf: "var(--sf)", b2: "var(--b2)",
        tx: "var(--tx)", mu: "var(--mu)", mt: "var(--mt)", bd: "var(--bd)", bd2: "var(--bd2)",
        ac: "var(--ac)", ach: "var(--ach)", acx: "var(--acx)", acs: "var(--acs)", btt: "var(--btt)",
        ok: "var(--okt)", wr: "var(--wrt)", er: "var(--ert)",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
