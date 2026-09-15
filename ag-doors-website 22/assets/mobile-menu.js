/* ============================================================
   AG DOORS — MOBILE MENU TOGGLE
   Shared across all pages. Opens/closes the slide-in nav drawer.
   ============================================================ */
(function(){
  var openBtn = document.getElementById('menuOpenBtn');
  var closeBtn = document.getElementById('menuCloseBtn');
  var overlay = document.getElementById('mobileMenuOverlay');
  var drawer = document.getElementById('mobileMenuDrawer');

  if (!openBtn || !overlay || !drawer) return;

  function openMenu(){
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });
})();
