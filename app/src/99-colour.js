/* 99-colour.js - marks <html data-paper="exam"> in the Mini tests and the Summit, and data-paper="colour"
   everywhere else, so that 99-colour.css colours only the learning screens (Jovan, 26 November 2026).
   The router marks #app with data-route; this follows it at once, before the page is painted. */
(function (T) {
  'use strict';
  function exam() {
    if (typeof T.isExam === 'function') return T.isExam();
    const h = String(location.hash || '').replace(/^#/, '');
    return /^summit/.test(h) || /-test$/.test(h);
  }
  function mark() { document.documentElement.setAttribute('data-paper', exam() ? 'exam' : 'colour'); }
  mark();
  window.addEventListener('hashchange', mark);
  // the colour key under the trail map: which colour is which skill
  const KEY = [['#F59E0B', 'Words and grammar'], ['#3B82F6', 'Listening'], ['#14B8A6', 'Reading'], ['#8B5CF6', 'Writing']];
  function addKey() {
    const map = document.querySelector('.home__scroll > .map');
    if (!map || map.parentNode.querySelector('.skill-key')) return;
    const ul = document.createElement('ul');
    ul.className = 'skill-key';
    ul.setAttribute('aria-label', 'Colours of the skills');
    KEY.forEach(function (k) {
      const li = document.createElement('li');
      const dot = document.createElement('i');
      dot.style.setProperty('--c', k[0]);
      li.appendChild(dot);
      li.appendChild(document.createTextNode(k[1]));
      ul.appendChild(li);
    });
    map.parentNode.insertBefore(ul, map.nextSibling);
  }
  function watch() {
    const app = document.getElementById('app');
    if (!app || !window.MutationObserver) return;
    new MutationObserver(mark).observe(app, { attributes: true, attributeFilter: ['data-route', 'data-world'] });
    new MutationObserver(addKey).observe(app, { childList: true, subtree: true });
    addKey();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})(window.T = window.T || {});
