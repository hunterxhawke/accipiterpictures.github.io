// Accipiter Pictures / Hunter Hawke Sound
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('yr').textContent = new Date().getFullYear();

  // Show the logo mark in the top bar only once the hero's full logo has scrolled away.
  var nav = document.querySelector('.nav'), hero = document.querySelector('.hero-mark');
  if (nav && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('past-hero', !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0);
    }).observe(hero);
  } else if (nav) {
    nav.classList.add('past-hero');
  }

  // Definition card: flips to "An Accipiter is a Hunter Hawke" on mouse hover, keyboard focus,
  // or a tap (touch screens toggle it, since sticky hover/focus on phones is unreliable).
  var entry = document.querySelector('.entry');
  if (entry) {
    var flip = function (on) { entry.classList.toggle('on', on); };
    entry.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') flip(true); });
    entry.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') flip(false); });
    entry.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') flip(!entry.classList.contains('on')); });
    entry.addEventListener('keyup', function (e) { if (e.key === 'Tab') flip(true); });
    entry.addEventListener('blur', function () { if (!entry.matches(':hover')) flip(false); });
  }

  // Woodcut waveforms: thin bars masked with the edges of the woodcut borders,
  // uneven widths and a slight hand-set tilt. Seeded, so every visit looks the same.
  // Absolute URLs: a url() inside a custom property resolves against the stylesheet that uses it.
  var edges = [1, 2, 3, 4].map(function (k) { return new URL('assets/wave-edge-' + k + '.png', document.baseURI).href; });
  document.querySelectorAll('.wave').forEach(function (wave) {
    var n = +wave.dataset.bars;
    if (window.innerWidth < 600) n = Math.round(n / 2);
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var bar = document.createElement('i');
      var h = 22 + Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11)) * 70 + rnd() * 8;
      bar.style.cssText =
        '--h:' + h.toFixed(0) + '%;' +
        '--w:' + (2 + rnd() * 2).toFixed(1) + 'px;' +
        '--m:url(' + edges[Math.floor(rnd() * 4)] + ');' +
        '--r:' + ((rnd() - 0.5) * 3).toFixed(1) + 'deg;' +
        'animation-duration:' + (1.2 + rnd() * 1.1).toFixed(2) + 's;' +
        'animation-delay:' + (-rnd() * 2).toFixed(2) + 's';
      if (i % 11 === 4) bar.className = 'red';
      else if (h > 70 || rnd() < 0.12) bar.className = 'hot';
      frag.appendChild(bar);
    }
    wave.appendChild(frag);
  });

  // Running timecode in the hero at 24 fps; only touches the page when the frame changes.
  var tc = document.getElementById('tc');
  // Skipped when hidden (phones) or when reduced motion is on.
  if (tc && !reduced && tc.offsetParent !== null) {
    var t0 = performance.now(), last = -1;
    var pad = function (v) { return (v < 10 ? '0' : '') + v; };
    (function tick(now) {
      var f = Math.floor((now - t0) * 0.024);
      if (f !== last) {
        last = f;
        tc.textContent = pad(Math.floor(f / 86400) % 24) + ':' + pad(Math.floor(f / 1440) % 60) + ':' + pad(Math.floor(f / 24) % 60) + ':' + pad(f % 24);
      }
      requestAnimationFrame(tick);
    })(t0);
  }

  // Copy email, with a select-the-text fallback where the clipboard isn't available.
  var btn = document.getElementById('copy'), email = document.getElementById('email');
  if (btn && email) {
    btn.addEventListener('click', function () {
      function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = 'Copy email'; }, 2000); }
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(email);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        done('Selected, press Copy');
      }
      try { navigator.clipboard.writeText(email.textContent.trim()).then(function () { done('Copied'); }, fallback); }
      catch (e) { fallback(); }
    });
  }
})();
