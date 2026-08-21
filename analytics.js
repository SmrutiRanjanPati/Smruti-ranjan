// ============ GA4 SECTION ENGAGEMENT TRACKING ============
// Tracks how long a visitor actually has each section in view (not just
// scroll position) and reports it to GA4 as a custom event, so you can see
// which sections people linger on vs. skim past.
//
// Requires the GA4 loader snippet (gtag.js) to already be present in <head>.
(function sectionEngagementTracker() {
  if (typeof gtag !== 'function') return; // GA4 not loaded (e.g. blocked) — skip quietly

  // Any section/footer with an id is tracked automatically.
  const trackedEls = document.querySelectorAll('main section[id], main footer[id]');
  if (!trackedEls.length) return;

  const state = new Map(); // id -> { visibleSince: number|null, totalMs: number }
  trackedEls.forEach(el => state.set(el.id, { visibleSince: null, totalMs: 0 }));

  function markVisible(id) {
    const s = state.get(id);
    if (s && s.visibleSince === null) s.visibleSince = performance.now();
  }

  function markHiddenAndFlush(id, { keepalive = false } = {}) {
    const s = state.get(id);
    if (!s || s.visibleSince === null) return;
    const elapsedMs = performance.now() - s.visibleSince;
    s.visibleSince = null;
    // Ignore blink-and-you-missed-it exposures (fast scroll-throughs)
    if (elapsedMs < 800) return;
    s.totalMs += elapsedMs;
    gtag('event', 'section_engagement', {
      section_id: id,
      view_duration_ms: Math.round(elapsedMs),
      total_duration_ms: Math.round(s.totalMs),
      transport_type: keepalive ? 'beacon' : undefined,
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        markVisible(id);
      } else {
        markHiddenAndFlush(id);
      }
    });
  }, { threshold: [0, 0.5, 1] });

  trackedEls.forEach(el => observer.observe(el));

  // Flush whatever section is currently open when the tab is hidden or the
  // page is closed, so you don't lose the last section someone was reading.
  function flushAllVisible(opts) {
    state.forEach((_, id) => markHiddenAndFlush(id, opts));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushAllVisible({ keepalive: true });
  });
  window.addEventListener('pagehide', () => flushAllVisible({ keepalive: true }));
})();
