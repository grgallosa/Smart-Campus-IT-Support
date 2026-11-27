import { useEffect, useState } from "react";

/** Re-renders every `ms` so SLA countdowns stay live. */
export function useNow(ms = 1000) {
  const [n, setN] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setN(Date.now()), ms); return () => clearInterval(i); }, [ms]);
  return n;
}

/** useState persisted in localStorage (safe if storage is blocked). */
export function useLocal(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s === null ? init : JSON.parse(s); } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }, [key, v]);
  return [v, setV];
}

/** Light/dark theme: stored choice, else the OS preference. Toggles the `dark` class on <html>. */
export function useTheme() {
  const [t, setT] = useLocal("cit-theme", null);
  const dark = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  return [dark, () => setT(dark ? "light" : "dark")];
}
