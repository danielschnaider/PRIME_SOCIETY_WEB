/**
 * PRIME Society — i18n engine
 * Supports: en (English USA), es (Spanish Spain), pt (Portuguese Brazil)
 *
 * Usage:
 *   <element data-i18n="dot.path.key">Fallback text</element>
 *   <element data-i18n-html="dot.path.key">Fallback HTML</element>
 *   <input data-i18n-placeholder="dot.path.key" placeholder="Fallback">
 *   <element data-i18n-aria="dot.path.key" aria-label="Fallback">
 */

const PRIME_I18N = (() => {
  const LANGS = ["en", "es", "pt"];
  const DEFAULT_LANG = "en";
  const STORAGE_KEY = "prime_lang";

  let _translations = {};
  let _currentLang = DEFAULT_LANG;

  /** Detect preferred language from browser / storage */
  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGS.includes(stored)) return stored;
    const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    if (nav.startsWith("pt")) return "pt";
    if (nav.startsWith("es")) return "es";
    return "en";
  }

  /** Resolve a dot-path key against the translations object */
  function resolve(key) {
    return key.split(".").reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : null), _translations);
  }

  /** Apply translations to the entire document */
  function applyTranslations() {
    // Plain text
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = resolve(el.getAttribute("data-i18n"));
      if (val !== null) el.textContent = val;
    });
    // HTML content (allows <strong>, <em>, <a> inside translations)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const val = resolve(el.getAttribute("data-i18n-html"));
      if (val !== null) el.innerHTML = val;
    });
    // Placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const val = resolve(el.getAttribute("data-i18n-placeholder"));
      if (val !== null) el.placeholder = val;
    });
    // aria-label
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const val = resolve(el.getAttribute("data-i18n-aria"));
      if (val !== null) el.setAttribute("aria-label", val);
    });
    // Update <html lang>
    document.documentElement.lang = _currentLang === "pt" ? "pt-BR" : _currentLang === "es" ? "es-ES" : "en-US";
    // Update switcher active state
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === _currentLang);
    });
  }

  /** Load a language JSON and apply */
  async function setLang(lang) {
    if (!LANGS.includes(lang)) lang = DEFAULT_LANG;
    try {
      const res = await fetch(`assets/js/i18n/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      _translations = await res.json();
      _currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations();
    } catch (e) {
      console.warn("[i18n] Failed to load", lang, e);
      if (lang !== DEFAULT_LANG) setLang(DEFAULT_LANG);
    }
  }

  /** Inject the language switcher into the header nav */
  function injectSwitcher() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const switcher = document.createElement("div");
    switcher.className = "lang-switcher";
    switcher.setAttribute("aria-label", "Language selector");
    LANGS.forEach((lang) => {
      const btn = document.createElement("button");
      btn.className = "lang-btn";
      btn.dataset.lang = lang;
      btn.textContent = lang.toUpperCase();
      btn.setAttribute("aria-label", { en: "English", es: "Español", pt: "Português" }[lang]);
      btn.addEventListener("click", () => setLang(lang));
      switcher.appendChild(btn);
    });
    nav.appendChild(switcher);
  }

  /** Public init */
  async function init() {
    injectSwitcher();
    await setLang(detectLang());
  }

  return { init, setLang, t: resolve };
})();

document.addEventListener("DOMContentLoaded", () => PRIME_I18N.init());
