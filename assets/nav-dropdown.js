/* ============================================================
   AG DOORS — SERVICES NAV DROPDOWN
   Shared across all pages.
   - Desktop: click "Services" to open a dropdown listing each
     service section; click outside, Escape, or a link to close.
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

    function closeDesktop(){
      desktopWrap.classList.remove('open');
      desktopTrigger.setAttribute('aria-expanded', 'false');
    }
    function toggleDesktop(e){
      e.stopPropagation();
      var isOpen = desktopWrap.classList.contains('open');
      if (isOpen){
        closeDesktop();
      } else {
        desktopWrap.classList.add('open');
        desktopTrigger.setAttribute('aria-expanded', 'true');
      }
    }

    desktopTrigger.addEventListener('click', toggleDesktop);
    document.addEventListener('click', function(e){
      if (!desktopWrap.contains(e.target)) closeDesktop();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closeDesktop();
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
