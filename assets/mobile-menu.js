/* ============================================================
   AG DOORS — MOBILE MENU TOGGLE
   Shared across all pages. Opens/closes the compact dropdown
   menu anchored below the hamburger button.
   ============================================================ */
(function(){
  var openBtn = document.getElementById('menuOpenBtn');
  var closeBtn = document.getElementById('menuCloseBtn');
  var overlay = document.getElementById('mobileMenuOverlay');
  var drawer = document.getElementById('mobileMenuDrawer');

  if (!openBtn || !overlay || !drawer) return;

  function isOpen(){ return drawer.classList.contains('open'); }
  function openMenu(){
    overlay.classList.add('open');
    drawer.classList.add('open');
    openBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu(){
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    openBtn.setAttribute('aria-expanded', 'false');
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
