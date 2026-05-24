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

  // Newsletter form
  const newsletterForm = document.querySelector(".newsletter form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = newsletterForm.parentElement.querySelector(".form-msg");
      if (msg) msg.textContent = "Thanks for submitting!";
      newsletterForm.reset();
    });
  }

  // Contact form
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = contactForm.querySelector(".form-msg");
      if (msg) msg.textContent = "Thank you — we'll be in touch soon.";
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
