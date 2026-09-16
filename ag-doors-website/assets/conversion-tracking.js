/* ============================================================
   AG DOORS — GOOGLE ADS CONVERSION TRACKING (Phone Calls)
   Fires a conversion event whenever someone clicks any "call"
   link (header, hero, floating button, CTA sections, etc.)
   across any page on the site.

   Conversion action: "Phone call lead" (click-to-call)
   Label: AW-18317538295/qEsjCJLe99EcEPfnvZ5E

   Uses Google's recommended pattern of briefly delaying
   navigation to the tel: link until the conversion beacon has
   had a chance to send — otherwise the phone dialer can open
   before the tracking request finishes, silently losing the
   conversion. A 1-second safety timeout guarantees the call
   still goes through even if the tracking request is blocked
   or slow (e.g. an ad blocker).
   ============================================================ */
(function(){
  var CONVERSION_SEND_TO = 'AW-18317538295/qEsjCJLe99EcEPfnvZ5E';

  var callLinks = document.querySelectorAll('a[href^="tel:"]');
  if (!callLinks.length) return;

  callLinks.forEach(function(link){
    link.addEventListener('click', function(e){
      // If gtag hasn't loaded for any reason, let the call go through normally.
      if (typeof gtag !== 'function') return;

      var href = link.getAttribute('href');
      var navigated = false;

      function goToPhone(){
        if (navigated) return;
        navigated = true;
        window.location = href;
      }

      e.preventDefault();

      gtag('event', 'conversion', {
        'send_to': CONVERSION_SEND_TO,
        'value': 1.0,
        'currency': 'AUD',
        'event_callback': goToPhone
      });

      // Safety net: never let tracking delay or block an actual phone call.
      setTimeout(goToPhone, 1000);
    });
  });
})();
