/* =====================================================================
   PRIME Society — Prototype i18n engine
   Trilingual: English (en) · Portuguese-Brazil (pt) · Spanish-Latam (es)
   Lightweight runtime: reads localStorage, fetches JSON, swaps text.
   Exposes window.PRIME_I18N = { setLang, getLang, t }
   ===================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'prime-lang';
  var DEFAULT_LANG = 'en';
  var SUPPORTED = ['en', 'pt', 'es'];
  // Native language names — these never get translated.
  var LANG_NAMES = { en: 'English', pt: 'Português', es: 'Español' };

  var state = {
    lang: DEFAULT_LANG,
    dict: {},
    cache: {} // lang -> dict
  };

  function readStoredLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v && SUPPORTED.indexOf(v) !== -1) return v;
    } catch (e) { /* localStorage may be unavailable */ }
    return DEFAULT_LANG;
  }

  function writeStoredLang(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }
  }

  // Look up "a.b.c" inside a nested dict object.
  function lookup(dict, keyPath) {
    if (!keyPath) return undefined;
    var parts = keyPath.split('.');
    var cur = dict;
    for (var i = 0; i < parts.length; i++) {
      if (cur && typeof cur === 'object' && parts[i] in cur) {
        cur = cur[parts[i]];
      } else {
        return undefined;
      }
    }
    return cur;
  }

  function t(keyPath) {
    var v = lookup(state.dict, keyPath);
    return (typeof v === 'string') ? v : keyPath;
  }

  // Apply translations to every element with a data-i18n* attribute.
  function applyTranslations(root) {
    root = root || document;

    // textContent translations
    var els = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var v = lookup(state.dict, el.getAttribute('data-i18n'));
      if (typeof v === 'string') el.textContent = v;
    }

    // innerHTML translations (for <em>, <strong>, etc.)
    var htmlEls = root.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlEls.length; j++) {
      var hel = htmlEls[j];
      var hv = lookup(state.dict, hel.getAttribute('data-i18n-html'));
      if (typeof hv === 'string') hel.innerHTML = hv;
    }

    // placeholder
    var phEls = root.querySelectorAll('[data-i18n-placeholder]');
    for (var k = 0; k < phEls.length; k++) {
      var pel = phEls[k];
      var pv = lookup(state.dict, pel.getAttribute('data-i18n-placeholder'));
      if (typeof pv === 'string') pel.setAttribute('placeholder', pv);
    }

    // aria-label
    var arEls = root.querySelectorAll('[data-i18n-aria]');
    for (var m = 0; m < arEls.length; m++) {
      var ael = arEls[m];
      var av = lookup(state.dict, ael.getAttribute('data-i18n-aria'));
      if (typeof av === 'string') ael.setAttribute('aria-label', av);
    }

    // title attribute (optional)
    var ttEls = root.querySelectorAll('[data-i18n-title]');
    for (var n = 0; n < ttEls.length; n++) {
      var tel = ttEls[n];
      var tv = lookup(state.dict, tel.getAttribute('data-i18n-title'));
      if (typeof tv === 'string') tel.setAttribute('title', tv);
    }
  }

  // Resolve the URL of the i18n folder, relative to this script.
  function i18nDirUrl() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i].getAttribute('src') || '';
      if (s && s.indexOf('i18n.js') !== -1) {
        // Strip filename, append i18n/
        return s.replace(/[^/]*$/, '') + 'i18n/';
      }
    }
    return 'i18n/';
  }

  function fetchDict(lang) {
    if (state.cache[lang]) return Promise.resolve(state.cache[lang]);
    var url = i18nDirUrl() + lang + '.json';
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('i18n fetch ' + lang + ' failed: ' + r.status);
        return r.json();
      })
      .then(function (data) {
        state.cache[lang] = data;
        return data;
      });
  }

  function updateSwitcherActive() {
    // Active state on the dropdown option buttons
    var btns = document.querySelectorAll('[data-lang-switch]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var active = (b.getAttribute('data-lang-switch') === state.lang);
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    // Update the trigger label to show the current native language name
    var labels = document.querySelectorAll('.lang-current');
    var nativeName = LANG_NAMES[state.lang] || LANG_NAMES[DEFAULT_LANG];
    for (var j = 0; j < labels.length; j++) {
      labels[j].textContent = nativeName;
    }
  }

  function closeAllDropdowns() {
    var switches = document.querySelectorAll('.lang-switch.open');
    for (var i = 0; i < switches.length; i++) {
      switches[i].classList.remove('open');
      var trig = switches[i].querySelector('.lang-trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
    }
  }

  function wireDropdown() {
    // Toggle on trigger click
    document.addEventListener('click', function (ev) {
      var trigger = ev.target.closest && ev.target.closest('.lang-trigger');
      if (trigger) {
        ev.stopPropagation();
        var sw = trigger.closest('.lang-switch');
        if (!sw) return;
        var isOpen = sw.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) {
          sw.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
        return;
      }
      // Click on option closes the dropdown (after selection)
      var opt = ev.target.closest && ev.target.closest('[data-lang-switch]');
      if (opt) {
        // Selection itself is handled by wireSwitcher; we just close here
        setTimeout(closeAllDropdowns, 0);
        return;
      }
      // Click outside an open switch — close all
      var insideSwitch = ev.target.closest && ev.target.closest('.lang-switch');
      if (!insideSwitch) closeAllDropdowns();
    });
    // Close on ESC
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        var anyOpen = document.querySelector('.lang-switch.open');
        if (anyOpen) {
          closeAllDropdowns();
          var trig = anyOpen.querySelector('.lang-trigger');
          if (trig) trig.focus();
        }
      }
    });
  }

  function hideLoadingOverlay() {
    document.documentElement.classList.remove('i18n-loading');
  }

  function setLang(code, opts) {
    opts = opts || {};
    if (SUPPORTED.indexOf(code) === -1) code = DEFAULT_LANG;
    return fetchDict(code).then(function (dict) {
      state.lang = code;
      state.dict = dict;
      document.documentElement.lang = code;
      writeStoredLang(code);
      applyTranslations();
      updateSwitcherActive();
      hideLoadingOverlay();
      if (!opts.silent && typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('prime:langchange', { detail: { lang: code } }));
        } catch (e) { /* ignore */ }
      }
      return dict;
    }).catch(function (err) {
      // Fallback to English on failure (unless already trying en).
      hideLoadingOverlay();
      if (code !== DEFAULT_LANG) {
        return setLang(DEFAULT_LANG, opts);
      }
      // Even on full failure, reveal the page (untranslated).
      console && console.warn && console.warn('[PRIME i18n]', err);
    });
  }

  function getLang() { return state.lang; }

  function wireSwitcher() {
    // Delegate clicks for any [data-lang-switch="xx"] button (in header or elsewhere).
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      while (t && t !== document.body) {
        if (t.hasAttribute && t.hasAttribute('data-lang-switch')) {
          var code = t.getAttribute('data-lang-switch');
          ev.preventDefault();
          setLang(code);
          return;
        }
        t = t.parentNode;
      }
    });
  }

  // --- Bootstrap ---
  state.lang = readStoredLang();
  document.documentElement.lang = state.lang;

  // Fallback safety: even if fetch fails or hangs, reveal page after 2s.
  setTimeout(hideLoadingOverlay, 2000);

  function start() {
    wireSwitcher();
    wireDropdown();
    setLang(state.lang, { silent: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.PRIME_I18N = {
    setLang: setLang,
    getLang: getLang,
    t: t,
    apply: applyTranslations
  };
})();
