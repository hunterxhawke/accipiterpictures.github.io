// Accipiter Pictures / Hunter Hawke Sound
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('yr').textContent = new Date().getFullYear();

  // Short links (/sound/, /about/) arrive as /?to=sound: start the page already at that section,
  // with no scroll animation, and tidy the address to /#sound. Re-pinned once images settle, unless the visitor has moved.
  var to = /[?&]to=([\w-]+)/.exec(location.search), target = to && document.getElementById(to[1]), pin = null;
  if (target) {
    history.replaceState(null, '', location.pathname + '#' + to[1]);
    var moved = false;
    ['wheel', 'touchstart', 'keydown'].forEach(function (t) { addEventListener(t, function () { moved = true; }, { passive: true, once: true }); });
    pin = function () {
      if (moved) return;
      var r = document.documentElement, b = r.style.scrollBehavior;
      r.style.scrollBehavior = 'auto';
      target.scrollIntoView();
      r.style.scrollBehavior = b;
    };
    pin();
    addEventListener('load', pin, { once: true });
  }

  // Intro (first visit from outside the site; see the script in the page head).
  // The bird rises in, winks, then glides into its place in the hero logo.
  var intro = document.querySelector('.splash');
  if (intro && document.documentElement.classList.contains('splash-on') && intro.animate) {
    var root = document.documentElement,
        bird = intro.querySelector('.splash-bird'), rig = intro.querySelector('.splash-rig'),
        head = intro.querySelector('.splash-head'), eye = intro.querySelector('.splash-eye'),
        logo = document.querySelector('.hero-mark'),
        smooth = 'cubic-bezier(.2, .7, .2, 1)', glide = 'cubic-bezier(.65, 0, .25, 1)',
        running = [], ended = false;
    intro.style.animation = 'none';
    if (logo) logo.style.animation = 'none';
    root.style.overflow = 'hidden';

    var play = function (el, frames, opts) {
      var a = el.animate(frames, Object.assign({ fill: 'both' }, opts));
      running.push(a);
      return a.finished;
    };
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

    // Fast (something went wrong): fade the curtain. Otherwise the bird is already sitting on the logo,
    // so the rest of the logo fades up around it, then the curtain is simply removed.
    var finish = function (fast) {
      if (ended) return;
      ended = true;
      var shown = logo && logo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fast ? 300 : 400, easing: 'ease', fill: 'forwards' });
      var done = function () {
        running.forEach(function (a) { a.cancel(); });
        intro.remove();
        root.classList.remove('splash-on');
        root.style.overflow = '';
        if (pin) pin();
        if (shown) shown.cancel();
      };
      (fast ? intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease', fill: 'forwards' }).finished : wait(400)).then(done);
    };

    // Land on the bird in the hero logo, when the logo is on screen.
    var land = function () {
      var r = logo && logo.getBoundingClientRect();
      if (!r || !r.width || r.top < 0 || r.bottom > innerHeight) {
        return play(bird, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-10px) scale(.92)', opacity: 0 }], { duration: 450, easing: glide })
          .then(function () { finish(true); });
      }
      var b = bird.getBoundingClientRect(), k = r.width / 1276;   // the layers sit at (445, -20) in the 1276-wide logo
      var tx = r.left + 445 * k - b.left, ty = r.top - 20 * k - b.top, s = (423 * k) / b.width;
      intro.animate([{ backgroundColor: '#000' }, { backgroundColor: 'rgba(0,0,0,0)' }], { duration: 600, delay: 80, easing: 'ease', fill: 'forwards' });
      return play(bird, [{ transform: 'none' }, { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')' }], { duration: 650, easing: glide })
        .then(function () { finish(); });
    };

    var imgs = [].slice.call(intro.querySelectorAll('img'));
    Promise.race([
      Promise.all(imgs.map(function (i) { return i.decode ? i.decode() : Promise.resolve(); })),
      wait(2500).then(function () { throw new Error('slow'); })
    ]).then(function () {
      if (ended) return;
      // 1. Arrive: rise out of the dark, eye already open
      play(bird, [{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease' });
      return play(rig, [
        { transform: 'translateY(18px) scale(.95)', filter: 'blur(5px)' },
        { transform: 'none', filter: 'blur(0)' }
      ], { duration: 600, easing: smooth });
    }).then(function () {
      if (ended) return;
      // 2. Wink, with a small cock of the head (the hood stays still)
      play(head, [
        { transform: 'none' }, { transform: 'rotate(-3deg)', offset: .35 }, { transform: 'rotate(-3deg)', offset: .65 }, { transform: 'none' }
      ], { duration: 480, delay: 60, easing: 'ease-in-out' });
      return play(eye, [
        { transform: 'scaleY(1)' },
        { transform: 'scaleY(.08)', offset: .3, easing: 'ease-out' },
        { transform: 'scaleY(.08)', offset: .5, easing: 'cubic-bezier(.3, 1.6, .5, 1)' },
        { transform: 'scaleY(1)' }
      ], { duration: 380, delay: 140 });
    }).then(function () {
      if (!ended) return wait(160).then(land);
    }).catch(function () { finish(true); });
  }

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

  // Films play right in their tile. The link stays as the fallback (no script, or a new-tab click).
  var embedUrl = function (href) {
    var m = /vimeo\.com\/(\d+)(?:\/([0-9a-f]+))?/.exec(href);
    if (m) return 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1&dnt=1&title=0&byline=0&portrait=0' + (m[2] ? '&h=' + m[2] : '');
    m = /youtube\.com\/watch\?v=([\w-]+)/.exec(href) || /youtu\.be\/([\w-]+)/.exec(href);
    if (m) return 'https://www.youtube-nocookie.com/embed/' + m[1] + '?autoplay=1&rel=0&playsinline=1';
    return null;
  };
  var playing = null;
  var stop = function () {
    if (!playing) return;
    var f = playing.querySelector('iframe');
    if (f) f.remove();
    playing.querySelector('.tile').classList.remove('playing');
    playing.classList.remove('playing');
    playing.setAttribute('href', playing.dataset.href);
    playing = null;
  };
  document.querySelectorAll('.film a[href]').forEach(function (a) {
    var src = embedUrl(a.href);
    if (!src) return;
    a.addEventListener('click', function (e) {
      if (a === playing) return;                                                  // already playing here
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;   // let new-tab clicks through
      e.preventDefault();
      stop();
      var tile = a.querySelector('.tile'), f = document.createElement('iframe');
      f.src = src;
      f.title = a.getAttribute('aria-label').replace(/^Watch /, '');
      f.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      f.allowFullscreen = true;
      tile.appendChild(f);
      tile.classList.add('playing');
      a.dataset.href = a.getAttribute('href');
      a.removeAttribute('href');                      // the title below no longer jumps away mid-film
      a.classList.add('playing');
      playing = a;
      f.focus();
    });
  });

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
