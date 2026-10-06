/* ============================================================
   AG DOORS — GOOGLE REVIEWS CAROUSEL
   Uses the Google Maps JavaScript API "places" library
   (google.maps.places.Place) to show the business's Google
   reviews in an auto-advancing carousel inside #reviews.

   >>> ENTER YOUR API KEY ON THE LINE MARKED  <<< ENTER KEY HERE  <<<
   The key must be restricted in Google Cloud Console to:
     - HTTP referrers: https://aggaragedoors.com.au/*
                       https://www.aggaragedoors.com.au/*
     - APIs: Maps JavaScript API + Places API (New)

   Policy notes (Google Maps Platform):
   - Reviews are fetched live on each page view and are NEVER
     stored (no localStorage / cookies / files of our own).
   - Each review shows the reviewer's name (linked to their Google
     profile), their photo and star rating, as returned by Google.
   - Google attribution ("Google Maps") is shown with the reviews.
   - Reviews are only shown if the listing found is verified to be
     AG Doors (phone-number match, or the explicit PLACE_ID below).
   - If anything fails, the section falls back to a heading plus
     the "Read all reviews on Google" button only.
   Google returns at most 5 reviews through this API.
   ============================================================ */
(function(){
  var API_KEY  = 'AIzaSyBSoVjdShnA8coDTJJBHEtYk1xbKltm5C4';   // <<< ENTER KEY HERE <<<

  // Optional: paste the business's Place ID (starts with "ChIJ...") to skip the
  // search step. Leave as '' to find the listing by name + phone number instead.
  var PLACE_ID = 'ChIJz2CaQB-nua0RZalrRV_iHo0';   // AG Doors (verified)

  var SEARCH_TEXT = 'AG Doors garage door repairs Gold Coast';
  var PHONE_LAST9 = '411419533';       // 0411 419 533 — used to verify the right listing
  var AUTOPLAY_MS = 5500;

  var section  = document.getElementById('reviews');
  var track    = document.getElementById('reviewsTrack');
  var dotsWrap = document.getElementById('reviewsDots');
  var summary  = document.getElementById('reviewsSummary');
  var carousel = document.getElementById('reviewsCarousel');
  var allBtn   = document.getElementById('reviewsAllBtn');
  var attrib   = document.getElementById('reviewsAttribution');
  if (!section || !track || !carousel) return;
  if (!API_KEY || API_KEY.indexOf('PASTE_') === 0) { console.warn('[AG reviews] No API key set in assets/reviews.js'); return; }

  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6 6 1-4.5 4.5 1 6-5.5-3-5.5 3 1-6L3 9l6-1z"/></svg>';
  function starsHtml(n){
    var out = '';
    for (var i = 0; i < 5; i++) out += i < Math.round(n) ? STAR : STAR.replace('<svg', '<svg class="off"');
    return out;
  }
  function digits(s){ return String(s || '').replace(/\D/g, ''); }

  /* ---------- load the Maps JS API (only when the section is near the screen) ---------- */
  var started = false;
  function start(){
    if (started) return; started = true;
    window.gm_authFailure = function(){ console.warn('[AG reviews] Google rejected the API key or this website address. Check the key restrictions (website addresses) and that Maps JavaScript API + Places API (New) are enabled and billing is on.'); };
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(API_KEY) +
            '&v=weekly&loading=async&callback=__agReviewsMapsReady';
    window.__agReviewsMapsReady = function(){
      google.maps.importLibrary('places').then(fetchPlace).then(render).catch(function(e){ console.warn('[AG reviews] Could not load reviews:', e && (e.message || e)); });
    };
    s.onerror = function(){ console.warn('[AG reviews] Could not load the Google Maps script (blocked or offline).'); };
    document.head.appendChild(s);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      if (entries[0].isIntersecting) { io.disconnect(); start(); }
    }, { rootMargin: '500px 0px' });
    io.observe(section);
  } else { start(); }
  // Fallback: if the observer hasn't fired shortly after the page loads, load anyway
  window.addEventListener('load', function(){ setTimeout(start, 2500); });

  /* ---------- get the place + reviews ---------- */
  var FIELDS = ['displayName', 'rating', 'userRatingCount', 'reviews', 'googleMapsURI', 'nationalPhoneNumber'];

  function fetchPlace(lib){
    var Place = lib.Place;
    if (PLACE_ID) {
      var p = new Place({ id: PLACE_ID });
      return p.fetchFields({ fields: FIELDS }).then(function(){ return p; });
    }
    return Place.searchByText({
      textQuery: SEARCH_TEXT,
      fields: FIELDS,
      region: 'au',
      maxResultCount: 5
    }).then(function(res){
      var list = (res && res.places) || [];
      for (var i = 0; i < list.length; i++) {
        if (digits(list[i].nationalPhoneNumber).indexOf(PHONE_LAST9) !== -1) return list[i];
      }
      console.warn('[AG reviews] Search found ' + list.length + ' places but none with phone 0411 419 533: ' +
        list.map(function(x){ return (x.displayName || '?') + ' (' + (x.nationalPhoneNumber || 'no phone') + ')'; }).join(', ') +
        '. Add your Place ID to PLACE_ID in assets/reviews.js.');
      throw new Error('no verified match');
    });
  }

  /* ---------- render ---------- */
  function render(place){
    var reviews = (place.reviews || []).filter(function(r){
      return r && r.text && String(r.text).trim().length > 0;
    });
    if (!reviews.length) return;

    if (place.googleMapsURI && allBtn) allBtn.href = place.googleMapsURI;

    if (summary && place.rating) {
      summary.textContent = '';
      var row = document.createElement('span');
      row.className = 'reviews-summary-row';
      var st = document.createElement('span');
      st.className = 'reviews-stars';
      st.innerHTML = starsHtml(place.rating);
      var txt = document.createElement('span');
      txt.textContent = Number(place.rating).toFixed(1) + ' on Google' +
        (place.userRatingCount ? ' · ' + place.userRatingCount + ' reviews' : '');
      row.appendChild(st); row.appendChild(txt);
      summary.appendChild(row);
    }

    track.textContent = '';
    reviews.forEach(function(r, i){
      var a = r.authorAttribution || {};
      var card = document.createElement('article');
      card.className = 'review-card';
      card.setAttribute('aria-label', 'Review ' + (i + 1) + ' of ' + reviews.length);

      var stars = document.createElement('div');
      stars.className = 'reviews-stars';
      stars.innerHTML = starsHtml(r.rating || 5);
      card.appendChild(stars);

      var p = document.createElement('p');
      p.className = 'review-text';
      p.textContent = String(r.text);
      card.appendChild(p);

      var who = document.createElement('div');
      who.className = 'review-who';
      if (a.photoURI) {
        var img = document.createElement('img');
        img.src = a.photoURI; img.alt = ''; img.width = 36; img.height = 36;
        img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
        who.appendChild(img);
      }
      var meta = document.createElement('div');
      var name = document.createElement(a.uri ? 'a' : 'span');
      name.className = 'review-name';
      name.textContent = a.displayName || 'Google user';
      if (a.uri) { name.href = a.uri; name.target = '_blank'; name.rel = 'noopener'; }
      meta.appendChild(name);
      if (r.relativePublishTimeDescription) {
        var when = document.createElement('span');
        when.className = 'review-when';
        when.textContent = r.relativePublishTimeDescription + ' · on Google';
        meta.appendChild(when);
      }
      who.appendChild(meta);
      card.appendChild(who);
      track.appendChild(card);
    });

    carousel.hidden = false;
    if (attrib) attrib.hidden = false;
    initCarousel(reviews.length);
  }

  /* ---------- carousel (scroll-snap + auto-advance) ---------- */
  function initCarousel(n){
    var cards = track.children;
    var dots = [];
    dotsWrap.textContent = '';
    for (var i = 0; i < n; i++) {
      (function(i){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'reviews-dot';
        b.setAttribute('aria-label', 'Show review ' + (i + 1));
        b.addEventListener('click', function(){ goTo(i); resumeAt = Date.now() + 12000; });
        dotsWrap.appendChild(b);
        dots.push(b);
      })(i);
    }
    function step(){ return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth; }
    function maxScroll(){ return track.scrollWidth - track.clientWidth; }
    function current(){ return Math.min(n - 1, Math.round(track.scrollLeft / (step() || 1))); }
    function goTo(i){ track.scrollTo({ left: Math.min(i * step(), maxScroll()), behavior: 'smooth' }); }
    function markDots(){
      var c = current();
      if (track.scrollLeft >= maxScroll() - 2) c = n - 1;
      dots.forEach(function(d, k){ d.classList.toggle('active', k === c); });
    }
    track.addEventListener('scroll', markDots, { passive: true });
    window.addEventListener('resize', markDots);
    markDots();

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    var paused = false, resumeAt = 0;
    ['mouseenter', 'focusin', 'touchstart'].forEach(function(ev){
      carousel.addEventListener(ev, function(){ paused = true; }, { passive: true });
    });
    ['mouseleave', 'focusout'].forEach(function(ev){
      carousel.addEventListener(ev, function(){ paused = false; resumeAt = Date.now() + 2500; });
    });
    carousel.addEventListener('touchend', function(){ paused = false; resumeAt = Date.now() + 6000; }, { passive: true });

    setInterval(function(){
      if (paused || document.hidden || Date.now() < resumeAt) return;
      if (maxScroll() <= 2) return;
      if (track.scrollLeft >= maxScroll() - 2) track.scrollTo({ left: 0, behavior: 'smooth' });
      else goTo(current() + 1);
    }, AUTOPLAY_MS);
  }
})();
