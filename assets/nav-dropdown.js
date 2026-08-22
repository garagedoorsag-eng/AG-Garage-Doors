/* ============================================================
   AG DOORS — SERVICES NAV DROPDOWN
   Shared across all pages.
   - Desktop, mouse users: the dropdown opens on hover (handled
     purely by CSS — see :hover / :focus-within in the stylesheet).
     This script only updates aria-expanded for accessibility and
     handles same-page link clicks; it does not control visibility.
   - Desktop, touch-capable devices (e.g. iPad at desktop width):
     hover isn't reliable, so this script falls back to a
     click-to-toggle interaction instead.
   - Mobile: "Services" expands inline within the slide-in drawer
     as an accordion, without closing the drawer itself.
   - If already on services.html, clicking a service link smooth-
     scrolls to that section instead of reloading the page (the
     header-offset is handled by the section's scroll-margin-top
     in the stylesheet, so nothing lands hidden under the header).
   ============================================================ */
(function(){

  var onServicesPage = /services\.html$/.test(window.location.pathname);
  var supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function closeMobileMenuIfOpen(){
    var overlay = document.getElementById('mobileMenuOverlay');
    var drawer = document.getElementById('mobileMenuDrawer');
    if (overlay) overlay.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Handles a click on any dropdown link (desktop or mobile) when
  // we're already on services.html — scrolls instead of reloading.
  function handleSamePageClick(e){
    var href = this.getAttribute('href'); // e.g. "services.html#repairs" or "services.html"
    var hashIndex = href.indexOf('#');

    e.preventDefault();

    if (hashIndex === -1){
      // "View All Services" while already on the page — just go to top.
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      var targetId = href.slice(hashIndex + 1);
      var target = document.getElementById(targetId);
      if (target){
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + targetId);
      }
    }
  }

  // ---------- Desktop dropdown ----------
  var desktopWrap = document.querySelector('.nav-dropdown');
  if (desktopWrap) {
    var desktopTrigger = desktopWrap.querySelector('.nav-dropdown-trigger');
    var desktopLinks = desktopWrap.querySelectorAll('.nav-dropdown-menu a');

    if (supportsHover){
      // CSS handles opening/closing via :hover and :focus-within.
      // Just keep aria-expanded accurate for screen readers.
      desktopWrap.addEventListener('mouseenter', function(){
        desktopTrigger.setAttribute('aria-expanded', 'true');
      });
      desktopWrap.addEventListener('mouseleave', function(){
        desktopTrigger.setAttribute('aria-expanded', 'false');
      });
      desktopWrap.addEventListener('focusin', function(){
        desktopTrigger.setAttribute('aria-expanded', 'true');
      });
      desktopWrap.addEventListener('focusout', function(e){
        if (!desktopWrap.contains(e.relatedTarget)){
          desktopTrigger.setAttribute('aria-expanded', 'false');
        }
      });
      // Escape moves focus away, which closes the menu via :focus-within.
      desktopWrap.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && document.activeElement){
          document.activeElement.blur();
        }
      });
    } else {
      // Touch-capable "desktop" width — click to toggle instead.
      function closeDesktop(){
        desktopWrap.classList.remove('open');
        desktopTrigger.setAttribute('aria-expanded', 'false');
      }
      desktopTrigger.addEventListener('click', function(e){
        e.stopPropagation();
        var isOpen = desktopWrap.classList.contains('open');
        if (isOpen){
          closeDesktop();
        } else {
          desktopWrap.classList.add('open');
          desktopTrigger.setAttribute('aria-expanded', 'true');
        }
      });
      document.addEventListener('click', function(e){
        if (!desktopWrap.contains(e.target)) closeDesktop();
      });
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape') closeDesktop();
      });
    }

    if (onServicesPage){
      desktopLinks.forEach(function(link){
        link.addEventListener('click', function(e){
          handleSamePageClick.call(link, e);
          desktopWrap.classList.remove('open');
          desktopTrigger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // ---------- Mobile accordion ----------
  var mobileWrap = document.querySelector('.mobile-nav-dropdown');
  if (mobileWrap) {
    var mobileTrigger = mobileWrap.querySelector('.mobile-nav-dropdown-trigger');
    var mobileLinks = mobileWrap.querySelectorAll('.mobile-nav-dropdown-menu a');

    mobileTrigger.addEventListener('click', function(){
      var isOpen = mobileWrap.classList.toggle('open');
      mobileTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    if (onServicesPage){
      mobileLinks.forEach(function(link){
        link.addEventListener('click', function(e){
          handleSamePageClick.call(link, e);
          closeMobileMenuIfOpen();
        });
      });
    }
  }
})();
