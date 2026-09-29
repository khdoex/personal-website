// Runs inline in <head>, before the first paint, and decides whether the
// home page opens with the ride in from deep space. It has to run that early:
// if the page painted first and hid itself second, the page would flash.
//
// The ride plays on a direct visit to /, once per browser session. It is
// skipped for crawlers and automation (they get the page at once), for
// reduced motion, for Save-Data, and without WebGL. ?intro=1 forces it and
// ?intro=0 skips it. If the engine has not booted after nine seconds the page
// shows itself anyway, so a failed script can never leave it blank.

export const INTRO_GATE = `(function () {
  try {
    var d = document.documentElement, q = location.search;
    if (location.pathname !== '/' || /[?&]intro=0/.test(q)) return;
    var force = /[?&]intro=1/.test(q);
    var nav = navigator;
    var bot = nav.webdriver || /bot|crawl|spider|slurp|lighthouse|pagespeed|headless|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|linkedin/i.test(nav.userAgent);
    var calm = matchMedia('(prefers-reduced-motion: reduce)').matches || (nav.connection && nav.connection.saveData);
    var seen = false;
    try { seen = sessionStorage.getItem('world:arrived') === '1'; } catch (e) {}
    if (!window.WebGLRenderingContext) return;
    if (!force && (bot || calm || seen)) return;
    d.setAttribute('data-intro', 'play');
    setTimeout(function () {
      if (!window.__worldBooted && d.getAttribute('data-intro') === 'play') d.setAttribute('data-intro', 'done');
    }, 9000);
  } catch (e) {}
})();`
