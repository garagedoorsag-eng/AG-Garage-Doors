/* ============================================================
   AG DOORS — SCROLL-REVEAL ANIMATIONS
   Shared across all pages. Targets existing component classes
   already used across the site, so no HTML changes are needed
   on any page.

   - Cards/panels: fade + lift into view (.reveal-on-scroll)
   - Section headings: fade + lift + a signature gold "glow"
     bloom, like a light announcing the next part of the page
   - Track dividers: a thin pulse of gold light sweeps across
   - Grid items (service cards, coverage cards): staggered
     delay so a row cascades in as a soft wave
   ============================================================ */
(function(){

  // Cards/panels that fade + lift into view.
  var liftSelectors = [
    '.service-card',
    '.coverage-card',
    '.detail-block',
    '.suburb-panel',
    '.info-card',
    '.hero-card',
    '.warranty-inner',
    '.area-left',
    '.faq-item'
  ];

  // Grid containers whose direct children should cascade with a stagger.
  var staggerGroups = ['.service-grid', '.coverage-grid'];

  var liftTargets = document.querySelectorAll(liftSelectors.join(', '));
  var sectionHeads = document.querySelectorAll('.section-head');
  var tracks = document.querySelectorAll('.track');

  liftTargets.forEach(function(el){ el.classList.add('reveal-on-scroll'); });
  sectionHeads.forEach(function(el){ el.classList.add('reveal-on-scroll'); });

  // Apply a small incremental delay to items inside stagger groups.
  staggerGroups.forEach(function(groupSelector){
    document.querySelectorAll(groupSelector).forEach(function(group){
      Array.prototype.forEach.call(group.children, function(child, i){
        child.style.setProperty('--reveal-delay', (i * 0.08) + 's');
      });
    });
  });

  var allTargets = Array.prototype.slice.call(liftTargets)
    .concat(Array.prototype.slice.call(sectionHeads))
    .concat(Array.prototype.slice.call(tracks));

  if (!allTargets.length) return;

  // No IntersectionObserver support (very old browsers) — just show everything.
  if (!('IntersectionObserver' in window)){
    allTargets.forEach(function(el){ el.classList.add('revealed'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  allTargets.forEach(function(el){ observer.observe(el); });
})();
