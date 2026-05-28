// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  // i18n-aware form messages
  function t(key, fallback) {
    if (typeof PRIME_I18N !== "undefined" && typeof PRIME_I18N.t === "function") {
      const val = PRIME_I18N.t(key);
      return val !== null ? val : fallback;
    }
    return fallback;
  }

  // Newsletter forms
  document.querySelectorAll(".newsletter form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = form.parentElement.querySelector(".form-msg");
      if (msg) {
        const key = msg.dataset.newsletterThanks || "home.newsletter_thanks";
        msg.textContent = t(key, "Thank you for subscribing!");
      }
      form.reset();
    });
  });

  // Contact form
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = contactForm.querySelector(".form-msg");
      if (msg) {
        const key = msg.dataset.contactThanks || "contact.f_thanks";
        msg.textContent = t(key, "Thank you — we'll be in touch soon.");
      }
      contactForm.reset();
    });
  }

  // Donate amount selector
  const donateBtns = document.querySelectorAll(".donate-options button");
  donateBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      donateBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // KPI counters — animate numbers up when the strip enters viewport
  function formatKpi(val) {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
    if (val >= 1000) return (val / 1000).toFixed(val >= 100000 ? 0 : 1) + "K";
    return val.toLocaleString();
  }

  const kpiItems = document.querySelectorAll(".kpi-item[data-kpi]");
  if (kpiItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.kpi, 10);
        const numEl = el.querySelector(".kpi-num");
        if (!numEl || el.dataset.animated) return;
        el.dataset.animated = "1";
        observer.unobserve(el);
        let start = 0;
        const duration = 1600;
        const step = 16;
        const increment = target / (duration / step);
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) { start = target; clearInterval(timer); }
          numEl.textContent = el.dataset.prefix || "";
          numEl.textContent += formatKpi(Math.floor(start));
          if (el.dataset.suffix) numEl.textContent += el.dataset.suffix;
        }, step);
      });
    }, { threshold: 0.4 });
    kpiItems.forEach((el) => observer.observe(el));
  }

  // Scroll-reveal: add .revealed class when elements enter viewport
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => revealObserver.observe(el));
  }
});
