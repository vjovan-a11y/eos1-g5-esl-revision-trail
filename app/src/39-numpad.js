/* 39-numpad.js - answer boxes and the on-screen number pad (from Maths v2 mui_b.js Answers).

   T.tools.numpad({ blanks, defs, onChange, onEnter }) -> { el, get(), full(), lock(), mark(parts), fill(values), focus(i), destroy() }
     blanks   the answer boxes, in order (elements with class 'blank'); a tap on a box makes it the one being filled
     defs     one per box: { len: most digits, w: 'big' | 'cell' | 'cbox' | 'fr', neg: a minus sign is allowed, sym: < > = only,
              dec: 3 }   dec (Grade 5): a decimal point is allowed, with at most that many digits after it
              ('fr': one of the two small boxes of a fraction, MX.FB)
              a 'cell' box holds one digit, and the pad moves on to the next box by itself
     el       the pad: 0 to 9, a minus sign (only when a box allows it), < > = (only for a sym box), rub out
   The keyboard works too: digits, - . < > =, Backspace, Enter (onEnter, for "Check").
   A typed 12345 shows as 12,345 and -4 with a real minus sign. get() -> the raw strings: ['12345', '-4', '0.75']. */
(function (T) {
  'use strict';

  const el = T.util.el;
  const SYMNAME = { '<': 'less than', '>': 'greater than', '=': 'equal to' };
  const sfx = function (name) { if (T.fx && T.fx.sfx) T.fx.sfx(name); };

  function numpad(o) {
    const MX = window.MX;
    const bl = (o.blanks || []).slice(), defs = o.defs || bl.map(function () { return { len: 6, w: 'big' }; });
    const v = defs.map(function () { return ''; });
    let cur = 0, locked = false;

    const keys = [];
    function key(label, k, aria, cls) {
      const b = el('button', { type: 'button', class: ['npad__key', cls], 'aria-label': aria || null, dataset: { k: k } }, label);
      b.addEventListener('click', function () { press(k); });
      keys.push(b);
      return b;
    }
    const textMode = defs.some(function (d) { return d && d.text; });     // ESL: words, typed on a letter pad
    const pad = textMode ? el('div', { class: 'npad npad--text', role: 'group', 'aria-label': 'Letter pad' },
      ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map(function (row, r0) {
        const r = r0 - 1;
        if (r0 === 0) return el('div', { class: 'npad__row npad__row--num' }, row.split('').map(function (c) { return key(c, c, null, 'npad__key--let npad__key--digit'); }),
          key(':', ':', 'Colon', 'npad__key--let'), key('.', '.', 'Full stop', 'npad__key--let'));
        return el('div', { class: 'npad__row npad__row--' + r }, row.split('').map(function (c) { return key(c, c, null, 'npad__key--let'); }),
          r === 2 ? [key("'", "'", 'Apostrophe', 'npad__key--let'), key('-', '-', 'Hyphen', 'npad__key--let'), key(T.ui.icon('back'), 'back', 'Rub out', 'npad__key--back')] : null);
      }),
      el('div', { class: 'npad__row npad__row--3' }, key('space', ' ', 'Space', 'npad__key--space'))) :
      el('div', { class: 'npad', role: 'group', 'aria-label': 'Number pad' },
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(function (d) { return key(String(d), String(d), null, 'npad__key--num'); }),
      key('−', '-', 'Minus sign', 'npad__key--neg'),
      key('.', '.', 'Decimal point', 'npad__key--dec'),
      ['<', '>', '='].map(function (x) { return key(x, x, SYMNAME[x], 'npad__key--sym'); }),
      key(T.ui.icon('back'), 'back', 'Rub out', 'npad__key--back'));

    function show(d, x) {
      if (d.text) return x;
      if (d.sym || d.w === 'cell') return x;
      if (x === '') return '';
      const digits = x.replace('-', ''), dot = digits.indexOf('.');
      if (dot >= 0) return (x[0] === '-' ? '−' : '') + MX.fmt(digits.slice(0, dot)) + digits.slice(dot);
      return (x[0] === '-' ? '−' : '') + (digits ? MX.fmt(digits) : '');
    }

    function paint() {
      const d0 = defs[cur] || {};
      pad.dataset.mode = d0.sym ? 'sym' : d0.neg ? 'neg' : 'num';
      pad.dataset.dec = d0.dec && !d0.sym ? '1' : '0';
      bl.forEach(function (b, i) {
        T.ui.empty(b);
        b.appendChild(el('span', { class: 'blank__val' }, show(defs[i], v[i])));
        if (b.classList.contains('is-good')) okMark(b);
        b.classList.toggle('is-on', i === cur && !locked);
        b.classList.toggle('is-filled', !!v[i]);
        b.setAttribute('aria-label', 'Answer box' + (bl.length > 1 ? ' ' + (i + 1) : '') + (v[i] ? ': ' + (defs[i].sym ? SYMNAME[v[i]] : v[i]) : ', empty'));
      });
    }

    // a right answer: a small green check that draws itself at the box's corner (not on the test paper, which
    // has the teacher's own pen marks). It takes no room, so nothing moves around it.
    function okMark(b) {
      if (b.closest('.tp') || b.querySelector('.blank__ok')) return;
      b.appendChild(el('span', { class: 'blank__ok', 'aria-hidden': 'true' }, T.ui.icon('check')));
    }

    function nudge(b) { b.classList.remove('is-shake'); void b.offsetWidth; b.classList.add('is-shake'); }

    function press(k) {
      if (locked || !bl.length) return;
      const d = defs[cur];
      if (d.text && k !== 'back') {
        if (k.length !== 1 || !/[a-zA-Z0-9:.'\- \u00C0-\u024F]/.test(k)) return;
        if (k === ' ' && (!v[cur] || / $/.test(v[cur]))) return;
        if (v[cur].length >= (d.len || 14)) { nudge(bl[cur]); return; }
        v[cur] += k; sfx('tap');
        paint();
        if (o.onChange) o.onChange();
        return;
      }
      if (k === 'back') {
        if (v[cur]) v[cur] = d.sym ? '' : v[cur].slice(0, -1);
        else if (cur > 0 && d.w === 'cell') { cur--; v[cur] = ''; }
        sfx('tap');
      } else if (d.sym) {
        if ('<>='.indexOf(k) < 0) return;
        v[cur] = k; sfx('snap');
        if (cur < bl.length - 1 && !v[cur + 1]) cur++;
      } else if (k === '-') {
        if (!d.neg) return;
        v[cur] = v[cur][0] === '-' ? v[cur].slice(1) : '-' + v[cur]; sfx('tap');
      } else if (k === '.') {
        if (!d.dec || v[cur].indexOf('.') >= 0) return;
        v[cur] = (v[cur] === '' || v[cur] === '-' ? v[cur] + '0' : v[cur]) + '.'; sfx('tap');
      } else if (!/^[0-9]$/.test(k)) {
        return;
      } else if (v[cur].indexOf('.') >= 0 && v[cur].length - v[cur].indexOf('.') > d.dec) {
        nudge(bl[cur]); return;                              // no more decimal places than the question uses
      } else if (d.w === 'cell') {
        v[cur] = k; if (cur < bl.length - 1) cur++; sfx('tap');
      } else if (v[cur].replace(/[-.]/g, '').length < (d.len || 6)) {
        v[cur] += k; sfx('tap');
      } else { nudge(bl[cur]); return; }
      paint();
      if (o.onChange) o.onChange();
    }

    bl.forEach(function (b, i) {
      b.addEventListener('click', function () { if (locked) return; cur = i; sfx('tap'); paint(); });
    });

    function onKey(e) {
      if (locked || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!pad.isConnected) return;
      if (e.target && e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return;
      if ((defs[cur] || {}).text) {
        if (e.key.length === 1 && /[a-zA-Z0-9:.'\- \u00C0-\u024F]/.test(e.key)) { press(e.key); e.preventDefault(); return; }
        if (e.key === '\u2019') { press("'"); e.preventDefault(); return; }
      }
      if (/^[0-9<>=.,-]$/.test(e.key)) { press(e.key === ',' ? '.' : e.key); e.preventDefault(); }
      else if (e.key === 'Backspace') { press('back'); e.preventDefault(); }
      else if (e.key === 'Enter' && !(e.target.closest && e.target.closest('button, input, textarea'))) { if (o.onEnter) o.onEnter(); }
    }
    document.addEventListener('keydown', onKey);

    paint();
    return {
      el: pad,
      get: function () { return v.slice(); },
      full: function () { return v.every(function (x, i) { return (defs[i] || {}).text ? x.trim() !== '' : x !== '' && x !== '-' && x.slice(-1) !== '.'; }); },
      lock: function () { locked = true; pad.classList.add('is-off'); keys.forEach(function (k) { k.disabled = true; }); paint(); },
      mark: function (parts) {
        bl.forEach(function (b, i) {
          b.classList.toggle('is-bad', !!parts && parts[i] === false);
          b.classList.toggle('is-good', !!parts && parts[i] === true);
          if (b.classList.contains('is-good')) okMark(b);
          else { const ok = b.querySelector('.blank__ok'); if (ok) ok.remove(); }
          if (parts && parts[i] === false && !b.closest('.tp')) nudge(b);    // the paper is marked by the pen, in turn
        });
      },
      fill: function (vals) { vals.forEach(function (x, i) { v[i] = x; if (bl[i]) bl[i].classList.add('is-shown'); }); paint(); },
      focus: function (i) { cur = Math.max(0, Math.min(bl.length - 1, i)); paint(); },
      destroy: function () { document.removeEventListener('keydown', onKey); if (pad.parentNode) pad.parentNode.removeChild(pad); }
    };
  }

  T.tools = Object.assign(T.tools || {}, { numpad: numpad });
})(window.T = window.T || {});

