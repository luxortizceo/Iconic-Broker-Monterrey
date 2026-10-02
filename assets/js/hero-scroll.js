(function () {
  const scroller = document.querySelector("[data-hero-scroller]");
  const video = document.querySelector("[data-hero-video]");
  const copy = document.querySelector("[data-hero-copy]");
  const hint = document.querySelector("[data-hero-hint]");

  if (!scroller || !video) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    video.play().catch(() => {});
    if (copy) {
      copy.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      copy.style.opacity = "1";
      copy.style.transform = "translateY(0)";
    }
    return;
  }

  let duration = 0;
  let targetTime = 0;
  let renderedTime = -1;
  let ticking = false;

  video.addEventListener("loadedmetadata", () => {
    duration = video.duration || 0;
  });

  function getProgress() {
    const rect = scroller.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    const scrolled = -rect.top;
    return Math.min(1, Math.max(0, scrolled / total));
  }

  function render() {
    ticking = false;
    const progress = getProgress();

    if (duration > 0) {
      targetTime = progress * duration;
      if (Math.abs(targetTime - renderedTime) > 0.015 && !video.seeking) {
        video.currentTime = targetTime;
        renderedTime = targetTime;
      }
    }

    if (copy) {
      const fadeStart = 0.78;
      const fadeProgress = Math.min(
        1,
        Math.max(0, (progress - fadeStart) / (1 - fadeStart))
      );
      copy.style.opacity = String(fadeProgress);
      copy.style.transform = `translateY(${24 * (1 - fadeProgress)}px)`;
    }

    if (hint) {
      hint.style.opacity = progress > 0.05 ? "0" : "1";
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  video.addEventListener("canplay", render);
  render();
})();
