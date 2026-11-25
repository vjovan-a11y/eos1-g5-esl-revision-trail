/* 99-paper.js - who is using the trail, on <html data-role="student|teacher|visitor">, so that teacher-only
   details can be hidden from children (99-paper.css: the objective code and DOK label under each question
   show for teachers and TAs only; Jovan, 25 November 2026). */
(function (T) {
  'use strict';
  function role() {
    try {
      const p = T.players && typeof T.players.active === 'function' ? T.players.active() : null;
      return p && T.players.roleOf ? T.players.roleOf(p.cls) : 'student';
    } catch (e) { return 'student'; }
  }
  function mark() { document.documentElement.setAttribute('data-role', role()); }
  window.addEventListener('hashchange', function () { setTimeout(mark, 0); });
  document.addEventListener('click', function () { setTimeout(mark, 50); }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mark); else mark();
})(window.T = window.T || {});
