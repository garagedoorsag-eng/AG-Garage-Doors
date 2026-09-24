/* ============================================================
   AG DOORS — MOBILE MENU TOGGLE
   Shared across all pages. Opens/closes the compact dropdown
   menu anchored below the hamburger button.

   Animation is driven explicitly in JS (Web Animations API)
   rather than relying only on a CSS transition firing — this
   sidesteps browser-specific cases where a CSS transition can
   fail to trigger, and lets us respect prefers-reduced-motion
   deliberately rather than by accident.
   ============================================================ */
(function(){
  var openBtn = document.getElementById('menuOpenBtn');
  var closeBtn = document.getElementById('menuCloseBtn');
  var overlay = document.getElementById('mobileMenuOverlay');
  var drawer = document.getElementById('mobileMenuDrawer');

  if (!openBtn || !overlay || !drawer) return;

  var DURATION = 260;
  var EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
  var OPEN_FRAMES = [
    { opacity: 0, transform: 'scaleY(0.85) translateY(-6px)' },
    { opacity: 1, transform: 'scaleY(1) translateY(0)' }
  ];
  var CLOSE_FRAMES = [
    { opacity: 1, transform: 'scaleY(1) translateY(0)' },
    { opacity: 0, transform: 'scaleY(0.85) translateY(-6px)' }
  ];

  function reduceMotion(){
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isOpen(){ return drawer.classList.contains('open'); }

  function runAnimation(frames){
    if (typeof drawer.animate !== 'function' || reduceMotion()) return;
    try {
      drawer.animate(frames, { duration: DURATION, easing: EASING, fill: 'forwards' });
    } catch (e) { /* animation is a visual enhancement only; class toggle below already sets the correct end state */ }
  }

  function openMenu(){
    overlay.classList.add('open');
    drawer.classList.add('open');
    openBtn.setAttribute('aria-expanded', 'true');
    runAnimation(OPEN_FRAMES);
  }
  function closeMenu(){
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    openBtn.setAttribute('aria-expanded', 'false');
    runAnimation(CLOSE_FRAMES);
  }

  openBtn.addEventListener('click', function(){
    if (isOpen()) closeMenu(); else openMenu();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });
})();
