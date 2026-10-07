(function splitHeadings() {
  const targets = document.querySelectorAll("[data-split-text]");
  if (!targets.length) return;

  targets.forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map(
        (word, i) =>
          `<span class="split-word" style="--i:${i}">${word}</span>`
      )
      .join(" ");
    el.classList.add("split-ready");
  });

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
    { threshold: 0.4 }
  );
  targets.forEach((el) => observer.observe(el));
})();

(function statsCounter() {
  const items = document.querySelectorAll("[data-counter]");
  if (!items.length || !("IntersectionObserver" in window)) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute("data-target")) || 0;
    const valueEl = el.querySelector("[data-counter-value]");
    if (!valueEl) return;
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      valueEl.textContent = Math.round(target * eased).toString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  items.forEach((el) => observer.observe(el));
})();

(function cardTilt() {
  const pointerFine = window.matchMedia("(pointer: fine)").matches;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (!pointerFine || reducedMotion) return;

  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest && e.target.closest(".vehicle-card");
    document.querySelectorAll(".vehicle-card.is-tilting").forEach((el) => {
      if (el !== card) {
        el.classList.remove("is-tilting");
        el.style.transform = "";
      }
    });
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateX = (-y * 10).toFixed(2);
    const rotateY = (x * 12).toFixed(2);
    card.classList.add("is-tilting");
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  document.addEventListener(
    "mouseleave",
    (e) => {
      const card = e.target.closest && e.target.closest(".vehicle-card");
      if (card) {
        card.classList.remove("is-tilting");
        card.style.transform = "";
      }
    },
    true
  );
})();

(function sellForm() {
  const form = document.querySelector("[data-sell-form]");
  if (!form || !window.ICONIC_CONTACT) return;

  const toggle = form.querySelector("[data-sell-toggle]");
  let mode = "Venta directa";

  if (toggle) {
    toggle.querySelectorAll("[data-sell-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggle
          .querySelectorAll("[data-sell-mode]")
          .forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        mode = btn.getAttribute("data-sell-mode");
      });
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const lines = [
      `Hola, quiero ${mode === "Consignación" ? "consignar" : "vender"} mi auto.`,
      `Nombre: ${data.get("nombre") || ""}`,
      `Modelo: ${data.get("modelo") || ""}`,
      `Año: ${data.get("anio") || "-"}`,
      `Kilometraje: ${data.get("km") || "-"}`,
      `Modalidad: ${mode}`,
    ];
    const mensaje = data.get("mensaje");
    if (mensaje) lines.push(`Mensaje: ${mensaje}`);

    const url = `https://wa.me/${window.ICONIC_CONTACT.whatsapp}?text=${encodeURIComponent(
      lines.join("\n")
    )}`;
    window.open(url, "_blank", "noopener");

    const confirmation = form.querySelector("[data-sell-confirmation]");
    if (confirmation) {
      confirmation.classList.add("is-visible");
      form.reset();
      toggle &&
        toggle.querySelectorAll("[data-sell-mode]").forEach((b, i) => {
          b.classList.toggle("is-active", i === 0);
        });
      mode = "Venta directa";
      setTimeout(() => confirmation.classList.remove("is-visible"), 6000);
    }
  });
})();

(function mobileMenu() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!toggle || !menu) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const open = () => {
    toggle.setAttribute("aria-expanded", "true");
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    isOpen ? close() : open();
  });

  menu.querySelectorAll("[data-mobile-link]").forEach((link) => {
    link.addEventListener("click", close);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) close();
  });
})();

(function floatingWhatsapp() {
  const btn = document.querySelector("[data-whatsapp-float]");
  const hero = document.querySelector("[data-hero-scroller]");
  if (!btn || !hero) return;

  const onScroll = () => {
    const past = window.scrollY > window.innerHeight * 0.6;
    btn.classList.toggle("is-visible", past);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

(function scrollProgress() {
  const bar = document.querySelector("[data-scroll-progress]");
  if (!bar) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
  update();
})();

(function inventoryFilters() {
  const bar = document.querySelector("[data-inventory-filters]");
  const grid = document.querySelector("[data-inventory-grid]");
  if (!bar || !grid || !window.ICONIC_FILTERS) return;

  bar.innerHTML = window.ICONIC_FILTERS.map(
    (f, i) =>
      `<button type="button" class="${i === 0 ? "is-active" : ""}" data-filter-key="${f.key}">${f.label}</button>`
  ).join("");

  bar.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      bar.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const key = btn.getAttribute("data-filter-key");

      grid.querySelectorAll("[data-vehicle-card]").forEach((card) => {
        const matches = key === "todos" || card.getAttribute("data-type") === key;
        card.classList.toggle("is-hidden", !matches);
      });
    });
  });
})();

(function faqAccordion() {
  const list = document.querySelector("[data-faq-list]");
  if (!list) return;

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-faq-toggle]");
    if (!btn) return;

    const item = btn.closest("[data-faq-item]");
    const answer = item.querySelector(".faq-item__a");
    const isOpen = btn.getAttribute("aria-expanded") === "true";

    list.querySelectorAll("[data-faq-toggle]").forEach((other) => {
      if (other !== btn) {
        other.setAttribute("aria-expanded", "false");
        other.closest("[data-faq-item]").querySelector(".faq-item__a").style.maxHeight = "";
      }
    });

    btn.setAttribute("aria-expanded", String(!isOpen));
    answer.style.maxHeight = isOpen ? "" : `${answer.scrollHeight}px`;
  });
})();

(function vehicleCardClick() {
  const grid = document.querySelector("[data-inventory-grid]");
  if (!grid || !window.ICONIC_CONTACT) return;

  const inquire = (card) => {
    const title = card.getAttribute("data-title");
    const message = `Hola, vi el ${title} en el sitio y me interesa. ¿Me pueden dar más información?`;
    const url = `https://wa.me/${window.ICONIC_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  };

  grid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-vehicle-card]");
    if (card) inquire(card);
  });

  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest("[data-vehicle-card]");
    if (card) {
      e.preventDefault();
      inquire(card);
    }
  });
})();
