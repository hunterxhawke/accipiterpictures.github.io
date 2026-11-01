// Accipiter Pictures · site stats for the Site Room (a private dashboard on Cloudflare).
// Counts page views, which sections people reach, how far they scroll, how long they stay,
// and which links they click. No cookies, no names. A random visitor ID in this browser's storage
// lets returning visits be recognized; nothing else identifies anyone.
(function () {
  var ENDPOINT = 'https://lfm-092826-room.hunter-e61.workers.dev/site-collect';
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  function rid() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6); }
  var visitor = '', returning = false;
  try { visitor = localStorage.getItem('ap-vid') || ''; returning = !!visitor; if (!visitor) { visitor = rid(); localStorage.setItem('ap-vid', visitor); } } catch (e) { visitor = rid(); }
  var view = rid().slice(0, 12), queue = [], seen = {}, depths = {}, active = 0, lastTick = Date.now(), sentTime = 0;
  var device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'phone' : 'computer';
  var ref = '';
  try { var h = document.referrer ? new URL(document.referrer).hostname : ''; if (h && h.indexOf('accipiterpictures.com') < 0) ref = h; } catch (e) {}
  var params = new URLSearchParams(location.search);

  function push(type, label, n) { queue.push({ type: type, label: String(label || '').slice(0, 80), n: n || 0, at: new Date().toISOString() }); }
  function flush(final) {
    tick();
    var secs = Math.round(active / 1000);
    if (secs > sentTime) { push('time', '', secs); sentTime = secs; }
    if (!queue.length) return;
    var body = JSON.stringify({ v: visitor, s: view, back: returning, d: device, ref: ref, path: location.pathname, utm: (params.get('utm_source') || '').slice(0, 40), events: queue.splice(0) });
    var blob = new Blob([body], { type: 'text/plain;charset=UTF-8' });
    if (final && navigator.sendBeacon) navigator.sendBeacon(ENDPOINT, blob);
    else fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: true, body: blob }).catch(function () {});
  }
  // Time actually spent looking at the page (paused while the tab is hidden)
  function tick() { var now = Date.now(); if (!document.hidden) active += Math.min(now - lastTick, 30000); lastTick = now; }

  push('view', document.title);

  // Sections reached: counted once each, when most of the section's opening is on screen
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { var id = en.target.id; if (en.isIntersecting && !seen[id]) { seen[id] = 1; push('section', id); } });
    }, { threshold: 0.3 });
    document.querySelectorAll('section[id]').forEach(function (s) { io.observe(s); });
  }
  // Scroll depth: 25 / 50 / 75 / 100 %
  window.addEventListener('scroll', function () {
    var max = document.documentElement.scrollHeight - innerHeight; if (max <= 0) return;
    var pct = (scrollY / max) * 100;
    [25, 50, 75, 100].forEach(function (d) { if (pct >= d - 1 && !depths[d]) { depths[d] = 1; push('scroll', '', d); } });
  }, { passive: true });

  // Clicks, named the way you'd say them: the film's title, "Instagram", "Email (sound booking)"
  function nameFor(a) {
    var href = a.getAttribute('href') || '';
    var film = a.closest('.film'); if (film) { var t = film.querySelector('.film-title'); return 'Film: ' + (t ? t.textContent.trim() : href); }
    if (/^mailto:/i.test(href)) return /booking/i.test(href) ? 'Email (sound booking)' : 'Email';
    if (/instagram\.com/i.test(href)) return 'Instagram';
    if (/youtube\.com\/@/i.test(href)) return 'YouTube channel';
    if (/vimeo\.com\/[a-z]/i.test(href)) return 'Vimeo profile';
    if (/^#/.test(href)) return 'Jump: ' + (a.textContent.trim() || href);
    if (/accipiterpictures\.com\/molly|^\/?molly/i.test(href)) return 'Looking for Molly page';
    return (a.textContent.trim() || href).slice(0, 60);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (a) { push('click', nameFor(a)); if (!/^#/.test(a.getAttribute('href'))) flush(true); return; }
    var b = e.target.closest('#copy'); if (b) push('click', 'Copied email');
  }, true);

  setInterval(function () { flush(); }, 15000);
  document.addEventListener('visibilitychange', function () { tick(); if (document.hidden) flush(true); });
  window.addEventListener('pagehide', function () { flush(true); });
  setTimeout(flush, 3000);
})();
