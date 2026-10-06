/* ============================================================
   AG DOORS — GOOGLE REVIEWS CAROUSEL
   Pulls the business's Google reviews (Places API, "New") and
   shows them as an auto-advancing carousel in #reviews.

   Safety rules built in:
   - Reviews are only shown if the Google listing found is
     verified to be AG Doors (phone number match, or an explicit
     PLACE_ID below). If nothing verifies, no reviews are shown.
   - If the API is unreachable/denied, the section falls back to
     a heading + the "Click to see all reviews" button only.
   - Review text is inserted with textContent (never as HTML).
   - Results are cached in the visitor's browser for 12 hours.

   NOTE: Google returns at most 5 reviews through this API.
   The API key is visible to anyone who views the page source, so
   it MUST be restricted in Google Cloud Console to (1) the
   "Places API (New)" only and (2) HTTP referrers:
   aggaragedoors.com.au/*  and  www.aggaragedoors.com.au/*
   ============================================================ */
(function(){
  var API_KEY = 'AIzaSyBSoVjdShnA8coDTJJBHEtYk1xbKltm5C4';
  var PLACE_ID = '';                       // optional: paste the Place ID here to skip the search
  var QUERY = 'AG Doors garage door repairs Gold Coast';
  var PHONE_LAST9 = '411419533';           // 0411 419 533 — used to verify the right listing
  var CACHE_KEY = 'agReviewsV1';
  var CACHE_MS = 12 * 60 * 60 * 1000;
  var AUTOPLAY_MS = 5500;

  var section = document.getElementById('reviews');
  var track = document.getElementById('reviewsTrack');
  var dotsWrap = document.getElementById('reviewsDots');
  var summary = document.getElementById('reviewsSummary');
  var carousel = document.getElementById('reviewsCarousel');
  var allBtn = document.getElementById('reviewsAllBtn');
  if (!section || !track || !carousel) return;

  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6 6 1-4.5 4.5 1 6-5.5-3-5.5 3 1-6L3 9l6-1z"/></svg>';

  function starsHtml(n){
    var out = '';
    for (var i = 0; i < 5; i++) out += i < Math.round(n) ? STAR : STAR.replace('<svg', '<svg class="off"');
    return out;
  }

  function digits(s){ return String(s || '').replace(/\D/g, ''); }

  function cacheGet(){
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (obj && Date.now() - obj.t < CACHE_MS) return obj.d;
    } catch (e) {}
    return null;
  }
  function cacheSet(d){
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
  }

  var FIELDS = 'id,displayName,nationalPhoneNumber,internationalPhoneNumber,rating,userRatingCount,googleMapsUri,reviews';

  function normalise(p){
    var reviews = (p.reviews || []).map(function(r){
      var text = (r.text && r.text.text) || (r.originalText && r.originalText.text) || '';
      return {
        rating: r.rating || 5,
        text: text,
        when: r.relativePublishTimeDescription || '',
        name: (r.authorAttribution && r.authorAttribution.displayName) || 'Google user',
        uri: (r.authorAttribution && r.authorAttribution.uri) || '',
        photo: (r.authorAttribution && r.authorAttribution.photoUri) || ''
      };
    }).filter(function(r){ return r.text.trim().length > 0; });
    return { rating: p.rating || 0, count: p.userRatingCount || 0, mapsUri: p.googleMapsUri || '', reviews: reviews };
  }

  function load(){
    var cached = cacheGet();
    if (cached) return Promise.resolve(cached);

    var req;
    if (PLACE_ID) {
      req = fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(PLACE_ID), {
        headers: { 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': FIELDS }
      }).then(function(r){ if (!r.ok) throw new Error('place ' + r.status); return r.json(); });
    } else {
      req = fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': FIELDS.split(',').map(function(f){ return 'places.' + f; }).join(',')
        },
        body: JSON.stringify({ textQuery: QUERY, regionCode: 'AU', maxResultCount: 5 })
      }).then(function(r){ if (!r.ok) throw new Error('search ' + r.status); return r.json(); })
        .then(function(j){
          var list = j.places || [];
          for (var i = 0; i < list.length; i++) {
            var ph = digits(list[i].nationalPhoneNumber) + ' ' + digits(list[i].internationalPhoneNumber);
            if (ph.indexOf(PHONE_LAST9) !== -1) return list[i];
          }
          throw new Error('no verified match');
        });
    }
    return req.then(function(p){
      var data = normalise(p);
      if (data.reviews.length) cacheSet(data);
      return data;
    });
  }

  function render(data){
    if (!data.reviews.length) return;
    if (data.mapsUri && allBtn) allBtn.href = data.mapsUri;

    if (summary && data.rating) {
      summary.innerHTML = '';
      var wrap = document.createElement('span');
      wrap.className = 'reviews-summary-row';
      wrap.innerHTML = '<span class="reviews-stars">' + starsHtml(data.rating) + '</span>';
      var txt = document.createElement('span');
      txt.textContent = data.rating.toFixed(1) + ' on Google' + (data.count ? ' · ' + data.count + ' reviews' : '');
      wrap.appendChild(txt);
      summary.appendChild(wrap);
    }

    track.innerHTML = '';
    data.reviews.forEach(function(r, i){
      var card = document.createElement('article');
      card.className = 'review-card';
      card.setAttribute('aria-label', 'Review ' + (i + 1) + ' of ' + data.reviews.length);

      var stars = document.createElement('div');
      stars.className = 'reviews-stars';
      stars.innerHTML = starsHtml(r.rating);
      card.appendChild(stars);

      var p = document.createElement('p');
      p.className = 'review-text';
      p.textContent = r.text;
      card.appendChild(p);

      var who = document.createElement('div');
      who.className = 'review-who';
      if (r.photo) {
        var img = document.createElement('img');
        img.src = r.photo; img.alt = ''; img.width = 36; img.height = 36;
        img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
        who.appendChild(img);
      }
      var meta = document.createElement('div');
      var name = document.createElement(r.uri ? 'a' : 'span');
      name.className = 'review-name';
      name.textContent = r.name;
      if (r.uri) { name.href = r.uri; name.target = '_blank'; name.rel = 'noopener'; }
      meta.appendChild(name);
      if (r.when) {
        var when = document.createElement('span');
        when.className = 'review-when';
        when.textContent = r.when;
        meta.appendChild(when);
      }
      who.appendChild(meta);
      card.appendChild(who);
      track.appendChild(card);
    });

    carousel.hidden = false;
    if (summary) summary.hidden = false;
    initCarousel(data.reviews.length);
  }

  function initCarousel(n){
    var cards = track.children;
    var dots = [];
    dotsWrap.innerHTML = '';
    for (var i = 0; i < n; i++) {
      (function(i){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'reviews-dot';
        b.setAttribute('aria-label', 'Show review ' + (i + 1));
        b.addEventListener('click', function(){ goTo(i); pauseFor(12000); });
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
    if (reduce || maxScroll() <= 2 && n <= 1) return;

    var paused = false, resumeAt = 0;
    function pauseFor(ms){ resumeAt = Date.now() + ms; }
    ['mouseenter', 'focusin', 'touchstart'].forEach(function(ev){
      carousel.addEventListener(ev, function(){ paused = true; }, { passive: true });
    });
    ['mouseleave', 'focusout'].forEach(function(ev){
      carousel.addEventListener(ev, function(){ paused = false; pauseFor(2500); });
    });
    carousel.addEventListener('touchend', function(){ paused = false; pauseFor(6000); }, { passive: true });

    setInterval(function(){
      if (paused || document.hidden || Date.now() < resumeAt) return;
      if (maxScroll() <= 2) return;                        // everything already visible
      var atEnd = track.scrollLeft >= maxScroll() - 2;
      if (atEnd) track.scrollTo({ left: 0, behavior: 'smooth' });
      else goTo(current() + 1);
    }, AUTOPLAY_MS);
  }

  load().then(render).catch(function(){ /* fall back to heading + button only */ });
})();
