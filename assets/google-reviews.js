/* ============================================================
   AG DOORS — GOOGLE REVIEWS (homepage)
   Reads window.AG_GOOGLE_REVIEWS, which is set by
   assets/data/google-reviews-data.js — a small file refreshed
   once a day by a GitHub Action that calls Google's Places API.
   No API key lives in this file or anywhere else on the site,
   and visitors' browsers never call Google for this data.

   Two jobs:
   1. fill()  — fills in every rating element marked with
                data-ag-reviews (hero badge, enquiry info card,
                closing CTA) and un-hides it.
   2. init()  — builds the full "Trusted by Local Homeowners"
                section: summary, review cards, carousel, buttons.

   If the data file is missing, empty, invalid or badly out of
   date, nothing is shown: every element stays hidden and the
   rest of the page is untouched.
   ============================================================ */
(function(){
  'use strict';

  // ---- Settings ----
  var MIN_RATING = 4;     // only show review cards with at least this many stars
  var MAX_CARDS = 6;      // most review cards to show (Google returns up to 5)
  var MAX_AGE_DAYS = 30;  // hide everything if the data hasn't refreshed for this long

  var DAY_MS = 86400000;
  var cachedData;         // undefined = not checked yet, null = unusable

  function getData(){
    if (cachedData !== undefined) return cachedData;
    cachedData = null;
    var d = window.AG_GOOGLE_REVIEWS;
    if (!d || d.status !== 'ok') return null;
    if (typeof d.rating !== 'number' || d.rating < 1 || d.rating > 5) return null;
    if (typeof d.reviewCount !== 'number' || d.reviewCount < 1) return null;
    var fetched = Date.parse(d.fetchedAt);
    if (!fetched || (Date.now() - fetched) > MAX_AGE_DAYS * DAY_MS) return null;
    cachedData = d;
    return d;
  }

  function safeUrl(url){
    return (typeof url === 'string' && /^https:\/\//i.test(url)) ? url : '';
  }

  function formatCount(n){
    try { return n.toLocaleString('en-AU'); } catch (e) { return String(n); }
  }

  function setStars(el, rating){
    var pct = Math.max(0, Math.min(100, (rating / 5) * 100));
    el.style.setProperty('--pct', pct.toFixed(1) + '%');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', 'Rated ' + (Math.round(rating * 10) / 10) + ' out of 5 stars');
  }

  /* ---------- 1. Rating elements (hero badge etc.) ---------- */
  function fill(){
    var d = getData();
    if (!d) return;
    var rating = d.rating.toFixed(1);
    var count = formatCount(d.reviewCount);
    var noun = d.reviewCount === 1 ? 'review' : 'reviews';

    var blocks = document.querySelectorAll('[data-ag-reviews]');
    Array.prototype.forEach.call(blocks, function(block){
      if (block.getAttribute('data-ag-filled') === '1') return;
      Array.prototype.forEach.call(block.querySelectorAll('[data-ag]'), function(el){
        var kind = el.getAttribute('data-ag');
        if (kind === 'rating') el.textContent = rating;
        else if (kind === 'count') el.textContent = count;
        else if (kind === 'noun') el.textContent = noun;
        else if (kind === 'stars') setStars(el, d.rating);
      });
      block.setAttribute('data-ag-filled', '1');
      block.hidden = false;
    });
  }

  /* ---------- 2. Full reviews section ---------- */
  function el(tag, className, text){
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function relativeDate(iso, fallback){
    var t = Date.parse(iso);
    if (!t) return fallback || '';
    var days = Math.floor((Date.now() - t) / DAY_MS);
    if (days < 1) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 30){ var w = Math.floor(days / 7); return w === 1 ? 'A week ago' : w + ' weeks ago'; }
    if (days < 365){ var m = Math.floor(days / 30); return m === 1 ? 'A month ago' : m + ' months ago'; }
    var y = Math.floor(days / 365);
    return y === 1 ? 'A year ago' : y + ' years ago';
  }

  function avatarFallback(name){
    var initial = (name || '').trim().charAt(0) || '?';
    var node = el('span', 'review-avatar review-avatar-fallback', initial);
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function buildCard(review){
    var card = el('article', 'review-card');

    // Reviewer: photo (or fallback), name linked to their Google profile, date
    var head = el('div', 'review-head');
    var photoUrl = safeUrl(review.photo);
    if (photoUrl){
      var img = document.createElement('img');
      img.className = 'review-avatar';
      img.alt = '';
      img.width = 44;
      img.height = 44;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.addEventListener('error', function(){
        if (img.parentNode) img.parentNode.replaceChild(avatarFallback(review.author), img);
      });
      img.src = photoUrl;
      head.appendChild(img);
    } else {
      head.appendChild(avatarFallback(review.author));
    }

    var who = el('div', 'review-who');
    var authorUrl = safeUrl(review.authorUrl);
    var name;
    if (authorUrl){
      name = el('a', 'review-author', review.author);
      name.href = authorUrl;
      name.target = '_blank';
      name.rel = 'noopener nofollow';
    } else {
      name = el('span', 'review-author', review.author);
    }
    who.appendChild(name);
    var when = relativeDate(review.publishTime, review.relativeTime);
    if (when) who.appendChild(el('span', 'review-date', when));
    head.appendChild(who);
    card.appendChild(head);

    // Star rating
    var stars = el('span', 'rating-stars');
    setStars(stars, review.rating);
    card.appendChild(stars);

    // Review text, exactly as written (clamped by CSS, with "Read more")
    var text = el('p', 'review-text', review.text);
    card.appendChild(text);
    if (review.translated) card.appendChild(el('span', 'review-translated', 'Translated by Google'));

    var more = el('button', 'review-more', 'Read more');
    more.type = 'button';
    more.hidden = true;
    more.setAttribute('aria-expanded', 'false');
    more.addEventListener('click', function(){
      var open = card.classList.toggle('is-expanded');
      more.textContent = open ? 'Show less' : 'Read more';
      more.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    card.appendChild(more);

    // Google Maps attribution, linking to this exact review on Google Maps
    var foot = el('div', 'review-foot');
    var reviewUrl = safeUrl(review.url);
    var source;
    if (reviewUrl){
      source = el('a', 'review-source gmaps-attr', 'Google Maps');
      source.href = reviewUrl;
      source.target = '_blank';
      source.rel = 'noopener nofollow';
      source.setAttribute('aria-label', 'View this review on Google Maps (opens in a new tab)');
    } else {
      source = el('span', 'review-source gmaps-attr', 'Google Maps');
    }
    foot.appendChild(source);
    card.appendChild(foot);

    return card;
  }

  function setupReadMore(track){
    function check(){
      Array.prototype.forEach.call(track.children, function(card){
        if (card.classList.contains('is-expanded')) return;
        var text = card.querySelector('.review-text');
        var more = card.querySelector('.review-more');
        if (!text || !more) return;
        more.hidden = !(text.scrollHeight - text.clientHeight > 2);
      });
    }
    check();
    return check;
  }

  function setupCarousel(track, nav){
    var prev = nav.querySelector('[data-dir="prev"]');
    var next = nav.querySelector('[data-dir="next"]');
    var dots = nav.querySelector('.reviews-dots');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ticking = false;

    function metrics(){
      var first = track.children[0];
      if (!first) return null;
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      var step = first.getBoundingClientRect().width + gap;
      if (!step) return null;
      var perView = Math.max(1, Math.round((track.clientWidth + gap) / step));
      return { step: step, pages: Math.max(1, track.children.length - perView + 1) };
    }

    function update(){
      ticking = false;
      var m = metrics();
      if (!m) return;
      var single = m.pages <= 1;
      nav.hidden = single;
      track.classList.toggle('is-static', single);
      if (single) return;
      if (dots.children.length !== m.pages){
        dots.textContent = '';
        for (var i = 0; i < m.pages; i++) dots.appendChild(document.createElement('span'));
      }
      var index = Math.max(0, Math.min(m.pages - 1, Math.round(track.scrollLeft / m.step)));
      Array.prototype.forEach.call(dots.children, function(dot, i){
        dot.className = i === index ? 'active' : '';
      });
      prev.disabled = index <= 0;
      next.disabled = index >= m.pages - 1;
    }

    function move(direction){
      var m = metrics();
      if (!m) return;
      var left = track.scrollLeft + direction * m.step;
      if (typeof track.scrollTo === 'function' && !reduceMotion){
        try { track.scrollTo({ left: left, behavior: 'smooth' }); return; } catch (e) { /* fall through */ }
      }
      track.scrollLeft = left;
    }

    prev.addEventListener('click', function(){ move(-1); });
    next.addEventListener('click', function(){ move(1); });
    track.addEventListener('scroll', function(){
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
    return update;
  }

  // Same fade + lift used by the rest of the site (see animations.js).
  function setupReveal(targets){
    targets.forEach(function(t){ t.classList.add('reveal-on-scroll'); });
    if (!('IntersectionObserver' in window)){
      targets.forEach(function(t){ t.classList.add('revealed'); });
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
    targets.forEach(function(t){ observer.observe(t); });
  }

  var built = false;
  function init(){
    fill();
    if (built) return;
    var d = getData();
    var section = document.getElementById('reviews');
    if (!d || !section) return;
    built = true;

    // Buttons — "read all" and "leave a review" on Google
    var links = d.links || {};
    var allLink = document.getElementById('reviewsAllLink');
    var writeLink = document.getElementById('reviewsWriteLink');
    var allUrl = safeUrl(links.reviews) || safeUrl(links.place);
    var writeUrl = safeUrl(links.writeReview);
    if (allLink){ if (allUrl) allLink.href = allUrl; else allLink.hidden = true; }
    if (writeLink){ if (writeUrl) writeLink.href = writeUrl; else writeLink.hidden = true; }

    // Review cards
    var carousel = document.getElementById('reviewsCarousel');
    var track = document.getElementById('reviewsList');
    var nav = document.getElementById('reviewsNav');
    var note = document.getElementById('reviewsNote');
    var reviews = (Array.isArray(d.reviews) ? d.reviews : []).filter(function(r){
      return r && typeof r.author === 'string' && r.author &&
             typeof r.text === 'string' && r.text.trim() &&
             typeof r.rating === 'number' && r.rating >= MIN_RATING;
    }).slice(0, MAX_CARDS);

    var hasCards = !!(carousel && track && nav && reviews.length);
    if (hasCards){
      reviews.forEach(function(r){ track.appendChild(buildCard(r)); });
      if (note){
        note.textContent = MIN_RATING > 1
          ? 'Showing the reviews Google ranks as most relevant, rated ' + MIN_RATING + ' stars or higher.'
          : 'Showing the reviews Google ranks as most relevant.';
      }
      carousel.hidden = false;
    }

    // Reveal the section and the divider that follows it
    section.hidden = false;
    var divider = document.getElementById('reviewsDivider');
    if (divider) divider.hidden = false;

    if (hasCards){
      var updateCarousel = setupCarousel(track, nav);
      var checkReadMore = setupReadMore(track);
      var resizeTimer;
      window.addEventListener('resize', function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function(){ updateCarousel(); checkReadMore(); }, 150);
      });
      // Web fonts can change line counts once they finish loading.
      if (document.fonts && document.fonts.ready && document.fonts.ready.then){
        document.fonts.ready.then(function(){ checkReadMore(); });
      }
    }

    var revealTargets = Array.prototype.slice.call(section.querySelectorAll('.reviews-summary, .reviews-carousel, .reviews-actions'))
      .filter(function(t){ return !t.hidden; });
    setupReveal(revealTargets);
  }

  window.AGReviews = { fill: fill, init: init };

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
