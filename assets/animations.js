/* ============================================================
   AG DOORS — SCROLL-REVEAL ANIMATIONS
   Shared across all pages. Fades and lifts cards/sections into
   view as the user scrolls down to them. Targets existing
   component classes already used across the site, so no HTML
   changes are needed on any page.
   ============================================================ */
(function(){
  var selectors = [
    '.service-card',
    '.coverage-card',
    '.detail-block',
    '.suburb-panel',
    '.info-card',
    '.hero-card',
    '.warranty-inner',
    '.area-left',
    '.faq-item'
  ].join(', ');

  var targets = document.querySelectorAll(selectors);
  if (!targets.length) return;

  targets.forEach(function(el){ el.classList.add('reveal-on-scroll'); });

  // No IntersectionObserver support (very old browsers) — just show everything.
  if (!('IntersectionObserver' in window)){
    targets.forEach(function(el){ el.classList.add('revealed'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function(el){ observer.observe(el); });
})();
