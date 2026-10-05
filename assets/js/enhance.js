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
