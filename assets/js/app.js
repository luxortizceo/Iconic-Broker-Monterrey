(function renderInventory() {
  const grid = document.querySelector("[data-inventory-grid]");
  if (!grid || !window.ICONIC_INVENTORY) return;

  grid.innerHTML = window.ICONIC_INVENTORY.map(
    (v) => `
    <article class="vehicle-card" data-reveal data-vehicle-card data-type="${v.type || ""}" data-title="${v.title}" tabindex="0" role="button" aria-label="Preguntar por ${v.title} en WhatsApp">
      <div class="vehicle-card__media">
        <img src="${v.image}" alt="${v.title} en venta en Iconic Broker Monterrey" loading="lazy" decoding="async" />
        <span class="vehicle-card__badge">${v.price_label}</span>
      </div>
      <div class="vehicle-card__body">
        <h3>${v.title}</h3>
        ${v.specs ? `<span class="vehicle-card__specs">${v.specs}</span>` : ""}
        <p>${v.description}</p>
        <span class="vehicle-card__footer">
          <span class="vehicle-card__price">${v.price_label}</span>
          <span class="vehicle-card__cta">Preguntar →</span>
        </span>
      </div>
    </article>
  `
  ).join("");
})();

(function renderFaq() {
  const list = document.querySelector("[data-faq-list]");
  if (!list || !window.ICONIC_FAQ) return;

  list.innerHTML = window.ICONIC_FAQ.map(
    (item, i) => `
    <div class="faq-item" data-faq-item>
      <button class="faq-item__q" data-faq-toggle aria-expanded="false" aria-controls="faq-a-${i}">
        <span>${item.q}</span>
        <span class="faq-item__icon" aria-hidden="true">+</span>
      </button>
      <div class="faq-item__a" id="faq-a-${i}">
        <p>${item.a}</p>
      </div>
    </div>
  `
  ).join("");
})();

(function renderReviews() {
  const grid = document.querySelector("[data-reviews-grid]");
  if (!grid || !window.ICONIC_REVIEWS) return;

  grid.innerHTML = window.ICONIC_REVIEWS.items
    .map(
      (r) => `
    <article class="review-card" data-reveal>
      <span class="review-card__stars">★★★★★</span>
      <p>“${r.quote}”</p>
      <span class="review-card__author">${r.author} · Google Reviews</span>
    </article>
  `
    )
    .join("");
})();

(function wireContactCta() {
  const links = document.querySelectorAll("[data-contact-cta]");
  if (!links.length || !window.ICONIC_CONTACT) return;
  const { whatsapp, whatsappMessage } = window.ICONIC_CONTACT;
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    whatsappMessage || ""
  )}`;
  links.forEach((link) => (link.href = href));
})();

(function setYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = new Date().getFullYear();
})();

// Scroll reveals, the hero/exit scrubs, kinetic headings, card tilt and
// magnetic buttons all live in assets/js/motion.js (GSAP + ScrollTrigger) —
// kept separate from this file so rendering/data logic and the motion
// engine never fight over the same DOM nodes.
