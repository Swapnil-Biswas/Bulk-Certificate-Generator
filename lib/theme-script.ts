/**
 * Inline script for <head>: applies the saved theme before first paint so there is no
 * light-to-dark flash. Mirrors the effect in components/theme-provider.tsx.
 */
export const themeInitScript = `try{var t=localStorage.getItem("theme");var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.add(d?"dark":"light");r.style.colorScheme=d?"dark":"light"}catch(e){}`;
