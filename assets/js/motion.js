/*
  NODDO MOTION ENGINE
  ---------------------------------------------------------------
  Single source of truth for every animated property on the page.
  Nothing outside this file touches opacity/transform/filter/clip-path
  on the elements below — that split is what keeps GSAP and CSS from
  fighting each other. If gsap/ScrollTrigger failed to load, every
  target stays at its plain CSS default (visible, untransformed).
*/
(function NoddoMotionEngine() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pointerFine = window.matchMedia("(pointer: fine)").matches;

  /* ---------- 1. Section reveals ---------- */
  function initReveals() {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (reduceMotion) return;
      gsap.set(el, { opacity: 0, y: 32 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: function () {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
        },
      });
    });

    document.querySelectorAll("[data-reveal-stagger]").forEach(function (el) {
      var children = Array.prototype.slice.call(el.children);
      if (!children.length || reduceMotion) return;
      gsap.set(children, { opacity: 0, y: 28 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: function () {
          gsap.to(children, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
          });
        },
      });
    });
  }

  /* ---------- 2. Kinetic headline reveals ---------- */
  function initSplitText() {
    document.querySelectorAll("[data-split-text]").forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words
        .map(function (w) {
          return '<span class="split-word">' + w + "</span>";
        })
        .join(" ");
      var spans = el.querySelectorAll(".split-word");

      if (reduceMotion) return;
      gsap.set(spans, { opacity: 0, y: "0.5em", filter: "blur(6px)" });
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: function () {
          gsap.to(spans, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.045,
          });
        },
      });
    });
  }

  /* ---------- 3. Hero scroll-scrub ---------- */
  function initHero() {
    var scroller = document.querySelector("[data-hero-scroller]");
    var video = document.querySelector("[data-hero-video]");
    var copy = document.querySelector("[data-hero-copy]");
    var hint = document.querySelector("[data-hero-hint]");
    if (!scroller || !video) return;

    if (reduceMotion) {
      video.setAttribute("autoplay", "");
      video.setAttribute("loop", "");
      video.play().catch(function () {});
      if (copy) gsap.set(copy, { opacity: 1, y: 0 });
      return;
    }

    var videoDuration = 0;
    var videoPrimed = false;
    video.addEventListener("loadedmetadata", function () {
      videoDuration = video.duration || 0;
    });

    // Mobile browsers (iOS Safari especially) won't decode/paint a frame
    // from a plain currentTime seek until the video has actually been
    // played at least once. Kick off a silent play+pause to "prime" the
    // decoder, then hand full control back to the scroll scrub below.
    function primeVideo() {
      if (videoPrimed) return;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(function () {
            video.pause();
            videoPrimed = true;
          })
          .catch(function () {});
      } else {
        video.pause();
        videoPrimed = true;
      }
    }
    primeVideo();
    video.addEventListener("loadeddata", primeVideo);
    document.addEventListener("touchstart", primeVideo, { once: true, passive: true });

    var proxy = { p: 0 };
    gsap
      .timeline({
        scrollTrigger: {
          trigger: scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      })
      .to(proxy, {
        p: 1,
        ease: "none",
        onUpdate: function () {
          var progress = proxy.p;
          if (videoDuration > 0 && !video.seeking) {
            if (!videoPrimed) primeVideo();
            video.currentTime = progress * videoDuration;
          }
          if (copy) {
            var fadeStart = 0.78;
            var fp = Math.min(1, Math.max(0, (progress - fadeStart) / (1 - fadeStart)));
            copy.style.opacity = String(fp);
            copy.style.transform = "translateY(" + 24 * (1 - fp) + "px)";
          }
          if (hint) hint.style.opacity = progress > 0.05 ? "0" : "1";
        },
      });
  }

  /* ---------- 4. Exit-scroller cinematic curtain ---------- */
  function initExitScroller() {
    var scroller = document.querySelector("[data-exit-scroller]");
    var sticky = scroller ? scroller.querySelector(".exit-sticky") : null;
    var video = document.querySelector("[data-exit-video]");
    if (!scroller || !sticky || !video) return;

    if (reduceMotion) {
      sticky.style.clipPath = "inset(0% round 0px)";
      video.setAttribute("autoplay", "");
      video.play().catch(function () {});
      return;
    }

    var proxy = { p: 0 };
    gsap
      .timeline({
        scrollTrigger: {
          trigger: scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      })
      .to(proxy, {
        p: 1,
        ease: "none",
        onUpdate: function () {
          var inset = 18 * (1 - proxy.p);
          sticky.style.clipPath = "inset(" + inset + "% round 0px)";
        },
      });

    ScrollTrigger.create({
      trigger: sticky,
      start: "top 65%",
      end: "bottom 35%",
      onToggle: function (self) {
        if (self.isActive) video.play().catch(function () {});
        else video.pause();
      },
    });
  }

  /* ---------- 5. Stats counters ---------- */
  function initCounters() {
    document.querySelectorAll("[data-counter]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-target")) || 0;
      var valueEl = el.querySelector("[data-counter-value]");
      if (!valueEl) return;

      if (reduceMotion) {
        valueEl.textContent = String(target);
        return;
      }

      var proxy = { n: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: function () {
          gsap.to(proxy, {
            n: target,
            duration: 1.4,
            ease: "power3.out",
            onUpdate: function () {
              valueEl.textContent = String(Math.round(proxy.n));
            },
          });
        },
      });
    });
  }

  /* ---------- 6. Vehicle card tilt (GSAP quickTo) ---------- */
  function initCardTilt() {
    if (!pointerFine || reduceMotion) return;

    gsap.set(".vehicle-card", { transformPerspective: 900 });

    document.querySelectorAll(".vehicle-card").forEach(function (card) {
      var qx = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
      var qy = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
      var qz = gsap.quickTo(card, "y", { duration: 0.5, ease: "power3" });

      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        qx(x * 12);
        qy(-y * 10);
        qz(-6);
        card.classList.add("is-tilting");
      });

      card.addEventListener("mouseleave", function () {
        qx(0);
        qy(0);
        qz(0);
        card.classList.remove("is-tilting");
      });
    });
  }

  /* ---------- 7. Magnetic buttons ---------- */
  function initMagneticButtons() {
    if (!pointerFine || reduceMotion) return;

    document.querySelectorAll("a.cta, button.cta, .whatsapp-float").forEach(function (btn) {
      var qx = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3" });
      var qy = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3" });

      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - (rect.left + rect.width / 2);
        var relY = e.clientY - (rect.top + rect.height / 2);
        qx(relX * 0.25);
        qy(relY * 0.3);
      });

      btn.addEventListener("mouseleave", function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- 8. Cursor accent ---------- */
  function initCursorDot() {
    if (!pointerFine || reduceMotion) return;

    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    document.body.appendChild(dot);

    var qx = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3" });
    var qy = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3" });

    window.addEventListener("mousemove", function (e) {
      dot.classList.add("is-active");
      qx(e.clientX);
      qy(e.clientY);
    });

    var hoverSelector = "a, button, [data-vehicle-card], input, textarea";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(hoverSelector)) {
        gsap.to(dot, { scale: 2.6, duration: 0.25, ease: "power2.out" });
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(hoverSelector)) {
        gsap.to(dot, { scale: 1, duration: 0.25, ease: "power2.out" });
      }
    });

    document.documentElement.addEventListener("mouseleave", function () {
      dot.classList.remove("is-active");
    });
  }

  /* ---------- 9. Subtle parallax (Llegadas recientes) ---------- */
  function initParallax() {
    if (reduceMotion) return;
    var exp = document.querySelector(".experience");
    if (!exp) return;

    gsap.fromTo(
      exp,
      { backgroundPosition: "50% 15%" },
      {
        backgroundPosition: "50% 85%",
        ease: "none",
        scrollTrigger: {
          trigger: exp,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }

  initReveals();
  initSplitText();
  initHero();
  initExitScroller();
  initCounters();
  initCardTilt();
  initMagneticButtons();
  initCursorDot();
  initParallax();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      ScrollTrigger.refresh();
    });
  }
})();
