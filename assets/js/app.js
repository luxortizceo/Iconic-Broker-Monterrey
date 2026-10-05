(function renderInventory() {
  const grid = document.querySelector("[data-inventory-grid]");
  if (!grid || !window.ICONIC_INVENTORY) return;

  grid.innerHTML = window.ICONIC_INVENTORY.map(
    (v) => `
    <article class="vehicle-card" data-reveal>
      <div class="vehicle-card__media">
        <img src="${v.image}" alt="${v.title} en venta en Iconic Broker Monterrey" loading="lazy" decoding="async" />
        <span class="vehicle-card__badge">${v.price_label}</span>
      </div>
      <div class="vehicle-card__body">
        <h3>${v.title}</h3>
        <p>${v.description}</p>
        <span class="vehicle-card__price">${v.price_label}</span>
      </div>
    </article>
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

(function scrollReveal() {
  const targets = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
})();

(function exitScroller() {
  const scroller = document.querySelector("[data-exit-scroller]");
  const sticky = scroller ? scroller.querySelector(".exit-sticky") : null;
  const video = document.querySelector("[data-exit-video]");
  if (!scroller || !sticky || !video) return;

  const openObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) sticky.classList.add("is-open");
      });
    },
    { threshold: 0.2 }
  );
  openObserver.observe(scroller);

  const playObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.35 }
  );
  playObserver.observe(sticky);
})();
