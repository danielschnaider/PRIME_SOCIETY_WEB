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

  /**
   * Get a translated string via the i18n engine if available,
   * otherwise return the fallback text.
   */
  function t(key, fallback) {
    if (typeof PRIME_I18N !== "undefined" && typeof PRIME_I18N.t === "function") {
      const val = PRIME_I18N.t(key);
      return val !== null ? val : fallback;
    }
    return fallback;
  }

  // Newsletter forms (there may be more than one per page, e.g. contact page)
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
});
