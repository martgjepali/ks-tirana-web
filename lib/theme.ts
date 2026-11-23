export const THEME_KEY = "theme";

/**
 * Runs in <head> before first paint: saved choice, else the system setting.
 * Plain module (not "use client") so the server layout receives the string itself.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/**
 * Shows the intro splash once per browser session (first page view only).
 * Sets <html data-splash="show">; CSS hides the splash otherwise.
 */
export const SPLASH_SCRIPT = `(function(){try{if(!sessionStorage.getItem("ks-splash")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){sessionStorage.setItem("ks-splash","1");document.documentElement.setAttribute("data-splash","show")}}catch(e){}})()`;
