/* ============================================================
   AG DOORS — SERVICES NAV DROPDOWN
   Shared across all pages.
   - Desktop: the dropdown opens on hover via CSS (:hover /
     :focus-within), AND can always be toggled by clicking —
     click is a guaranteed fallback regardless of whether hover
     is detected correctly on a given device/browser, so the
     menu is always reachable one way or another.
   - Mobile: "Services" expands inline within the slide-in drawer
     as an accordion, without closing the drawer itself.
   - If already on services.html, clicking a service link smooth-
     scrolls to that section instead of reloading the page (the
     header-offset is handled by the section's scroll-margin-top
     in the stylesheet, so nothing lands hidden under the header).
   ============================================================ */
(function(){

  var onServicesPage = /services\.html$/.test(window.location.pathname);

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

    function openDesktop(){
      desktopWrap.classList.add('open');
      desktopTrigger.setAttribute('aria-expanded', 'true');
    }
    function closeDesktop(){
      desktopWrap.classList.remove('open');
      desktopTrigger.setAttribute('aria-expanded', 'false');
    }

    // Click always works, as a guaranteed fallback alongside CSS hover.
    desktopTrigger.addEventListener('click', function(e){
      e.stopPropagation();
      if (desktopWrap.classList.contains('open')){
        closeDesktop();
      } else {
        openDesktop();
      }
    });
    document.addEventListener('click', function(e){
      if (!desktopWrap.contains(e.target)) closeDesktop();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closeDesktop();
    });

    // Keep aria-expanded accurate when CSS :hover opens it directly,
    // without needing a click.
    desktopWrap.addEventListener('mouseenter', function(){
      desktopTrigger.setAttribute('aria-expanded', 'true');
    });
    desktopWrap.addEventListener('mouseleave', function(){
      if (!desktopWrap.classList.contains('open')){
        desktopTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    if (onServicesPage){
      desktopLinks.forEach(function(link){
        link.addEventListener('click', function(e){
          handleSamePageClick.call(link, e);
          closeDesktop();
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
