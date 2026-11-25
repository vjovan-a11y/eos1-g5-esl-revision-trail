/* 05-fx.js - sound effects, the "hear the word" voice, and particles.

   T.fx.sfx(name, opts)        play a synthesised sound effect (never throws; silent when sound is off)
   T.fx.on                     the saved sound switch (boolean, default true); T.fx.toggle() flips it
   T.fx.unlock()               create or resume the audio (done automatically on the first tap or key)
   T.fx.silence()              stop every sound that is playing or waiting to play, and the spoken word
   T.fx.sayWord(text)          speak one word for the "hear the word" button; false if there is no voice
   T.fx.confetti(x, y, n)      particles at a point in the window (clientX / clientY)
   T.fx.sparkle(x, y, n, colour)
   T.fx.ring(x, y, colour)
   T.fx.burst(el, n)           confetti, sparkles and a ring from the middle of an element
   T.fx.flyStar(fromEl, toEl, opts)   fly a drawn star between two elements, then play 'chime';
                               returns a promise that settles when the star has landed
   T.fx.still()                true: no movement (reduced motion, or the lowest effects tier); every engine asks this
   T.fx.names                  the list of sound names
   T.fx.status()               what the engine is doing, for tests and the dev kit

   The audio engine is the old app's FX engine (tone, noise, bell, brass and its table of sounds)
   without the background music and without the reading voice. Nothing speaks or plays by itself.
   The full API is in brief/api-core.md. */
(function (T) {
  'use strict';

  const noop = function () {};
  const hasOwn = function (obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); };
  const isNumber = function (x) { return typeof x === 'number' && isFinite(x); };

  /* ---------- the sound switch (saved through T.store) ---------- */

  const SOUND_PATH = 'settings.sound';
  let soundInMemory = true;                 // only used if the store is missing

  function isOn() {
    return T.store ? T.store.get(SOUND_PATH, true) !== false : soundInMemory;
  }

  function setOn(value) {
    const on = !!value;
    soundInMemory = on;
    if (T.store) T.store.set(SOUND_PATH, on);
    if (on) { wake(); if (!isRunning()) arm(); }
    else { hush(); rest(); }
    return on;
  }

  // flip the switch and save it; -> the new value
  function toggle() {
    return setOn(!isOn());
  }

  /* ---------- audio engine: the context and its output chain ----------
     voices -> OUT -> compressor -> speakers, with a reverb send (SEND) beside it. */

  let C = null, OUT = null, SEND = null, NOISE = null;
  let audioFailed = false;
  const live = new Set();                   // source nodes that are playing or scheduled to play
  const MAX_VOICES = 256;                   // a runaway loop of sounds stops here
  const LATE_MS = 250;                      // a sound that could not start within this time is dropped
  let waiting = [];                         // sounds asked for while the context was still starting
  let soundCount = 0, lastSound = '';       // for status()

  function audioCtor() {
    return window.AudioContext || window.webkitAudioContext || null;
  }

  function isRunning() {
    return !!C && C.state === 'running';
  }

  function build() {
    if (C || audioFailed) return C;
    const Ctor = audioCtor();
    if (!Ctor) return null;
    let c = null;
    try {
      c = new Ctor();
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 4;
      comp.connect(c.destination);
      const out = c.createGain();
      out.gain.value = 0.9;
      out.connect(comp);
      // a small room: 1.5 seconds of fading noise as the reverb impulse
      const conv = c.createConvolver();
      const len = Math.floor(c.sampleRate * 1.5);
      const impulse = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.4);
      }
      conv.buffer = impulse;
      const wet = c.createGain();
      wet.gain.value = 0.24;
      conv.connect(wet);
      wet.connect(comp);
      C = c; OUT = out; SEND = conv; NOISE = null;
      c.onstatechange = onAudioState;
      watchVisibility();
    } catch (e) {
      audioFailed = true;
      C = null;
      try { if (c && c.close) c.close(); } catch (e2) { /* nothing to close */ }
    }
    return C;
  }

  function noiseBuffer() {
    if (NOISE) return NOISE;
    const len = C.sampleRate;
    NOISE = C.createBuffer(1, len, C.sampleRate);
    const data = NOISE.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return NOISE;
  }

  /* ---------- audio engine: waking, resting, silencing ----------
     Browsers let sound start only after a tap or a key press. The context is created on that
     first gesture and resumed before every sound. iOS can also put it in an 'interrupted' state
     (a phone call, the app switcher): anything that is not 'running' is resumed the same way.
     The listeners stay only until the audio runs, and come back if the system stops it. */

  const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'];   // pen and screen readers may send only some of these
  const CAPTURE = { capture: true, passive: true };
  let armed = false;
  let gestured = false;
  let voicesWarmed = false;
  let watching = false;

  // has the child touched the page yet? (a finger going down does not count, a finger lifting does)
  function tapped() {
    const ua = navigator.userActivation;
    return ua ? !!(ua.hasBeenActive || ua.isActive) : gestured;
  }

  function arm() {
    if (armed || audioFailed || !audioCtor()) return;   // no Web Audio: there is nothing to wake
    armed = true;
    GESTURES.forEach(function (type) { window.addEventListener(type, onGesture, CAPTURE); });
  }

  function disarm() {
    if (!armed) return;
    armed = false;
    GESTURES.forEach(function (type) { window.removeEventListener(type, onGesture, CAPTURE); });
  }

  function onGesture() {
    gestured = true;
    warmVoices();
    if (!isOn()) { disarm(); return; }      // the sound switch wakes the audio when it is turned on
    if (!tapped()) return;                  // wait for the finger to lift
    unlock();
  }

  // T.fx.unlock(): create the audio context if needed and resume it if it is not running.
  // Returns true when there is an audio context to play on; false when the sound is switched off
  // (the audio then stays asleep) or when this browser has no Web Audio.
  function unlock() {
    if (!isOn()) return false;
    const c = build();
    if (!c) { disarm(); return false; }
    if (c.state !== 'running' && c.state !== 'closed' && !document.hidden) resume();
    if (c.state === 'running') disarm(); else arm();   // not running yet: the next gesture tries again
    return true;
  }

  // used before each sound: never creates the context before the first gesture
  function wake() {
    if (!C && !tapped()) return null;
    return unlock() ? C : null;
  }

  function resume() {
    try {
      const p = C.resume();
      if (p && typeof p.then === 'function') p.then(onAudioState, noop);
    } catch (e) { /* still locked: the next gesture tries again */ }
  }

  // save the battery while the page is hidden or the sound is off
  function rest() {
    if (!isRunning()) return;
    try {
      const p = C.suspend();
      if (p && typeof p.then === 'function') p.then(noop, noop);
    } catch (e) { /* it keeps running, which is harmless */ }
  }

  // T.fx.silence(): stop every sound that is playing, scheduled or waiting, and the spoken word
  function hush() {
    waiting = [];
    live.forEach(function (node) {
      try { node.stop(); } catch (e) { /* it had already ended */ }
    });
    live.clear();
    stopVoice();
  }

  function onAudioState() {
    if (!C) return;
    if (C.state === 'running') {
      disarm();
      if (document.hidden || !isOn()) rest(); else playWaiting();
    } else if (C.state !== 'closed' && isOn() && !document.hidden) {
      arm();                                // suspended or interrupted by the system: the next tap wakes it
    }
  }

  // a hidden page is silent: everything stops and the audio sleeps until the page is back
  function onVisibility() {
    if (document.hidden) { hush(); rest(); }
    else if (C && isOn()) unlock();
  }

  // listen for the page being hidden; started with the first sound or the first spoken word
  function watchVisibility() {
    if (watching) return;
    watching = true;
    document.addEventListener('visibilitychange', onVisibility);
  }

  /* ---------- audio engine: the two building blocks ---------- */

  function track(node) {
    live.add(node);
    node.onended = function () { live.delete(node); };
  }

  // one oscillator with a pluck envelope. o: type, to + glide (pitch slide), vol, a (attack),
  // lp (low-pass), rev (reverb send, 0 = dry), vib + vibd (vibrato speed and depth)
  function tone(f, t, d, o) {
    o = o || {};
    const os = C.createOscillator(), g = C.createGain();
    os.type = o.type || 'sine';
    os.frequency.setValueAtTime(f, t);
    if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + (o.glide || d));
    const v = o.vol || 0.2, a = o.a || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    let last = os;
    if (o.lp) {
      const filter = C.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = o.lp;
      os.connect(filter);
      last = filter;
    }
    last.connect(g);
    g.connect(OUT);
    if (o.rev !== 0) {
      const send = C.createGain();
      send.gain.value = o.rev || 0.4;
      g.connect(send);
      send.connect(SEND);
    }
    if (o.vib) {
      const lfo = C.createOscillator(), depth = C.createGain();
      lfo.frequency.value = o.vib;
      depth.gain.value = o.vibd || 8;
      lfo.connect(depth);
      depth.connect(os.frequency);
      lfo.start(t);
      lfo.stop(t + d + 0.05);
      track(lfo);
    }
    os.start(t);
    os.stop(t + d + 0.05);
    track(os);
  }

  // filtered white noise with the same envelope. o: f (filter frequency), to (sweep), ft (filter
  // type, default bandpass), q, vol, a (attack), rev (reverb send)
  function noise(t, d, o) {
    o = o || {};
    const src = C.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;                        // the buffer is one second long; long hisses need more
    const filter = C.createBiquadFilter();
    filter.type = o.ft || 'bandpass';
    filter.frequency.setValueAtTime(o.f || 1000, t);
    if (o.to) filter.frequency.exponentialRampToValueAtTime(o.to, t + d);
    filter.Q.value = o.q || 1;
    const g = C.createGain(), v = o.vol || 0.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + (o.a || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(filter);
    filter.connect(g);
    g.connect(OUT);
    if (o.rev) {
      const send = C.createGain();
      send.gain.value = o.rev;
      g.connect(send);
      send.connect(SEND);
    }
    src.start(t, Math.random() * 0.5);
    src.stop(t + d + 0.05);
    track(src);
  }

  /* ---------- the sounds ---------- */

  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];

  function bell(f, t, v) {
    v = v || 0.15;
    tone(f, t, 1, { vol: v });
    tone(f * 2, t, 0.55, { vol: v * 0.35 });
    tone(f * 3.01, t, 0.25, { vol: v * 0.12, type: 'triangle' });
  }

  function sparkles(t, n) {
    for (let i = 0; i < n; i++) tone(1900 + Math.random() * 2600, t + i * 0.045 + Math.random() * 0.02, 0.2, { vol: 0.03, rev: 0.9 });
  }

  function brass(f, t, d, v) {
    v = v || 0.06;
    tone(f, t, d, { type: 'sawtooth', vol: v, lp: 2300, a: 0.035, rev: 0.45 });
    tone(f * 1.006, t, d, { type: 'sawtooth', vol: v * 0.6, lp: 1700, a: 0.04, rev: 0.45 });
  }

  // read a number option the way the old engine did (missing or 0 means the default),
  // then keep it inside safe limits
  function opt(o, key, fallback, low, high) {
    const v = o && isNumber(o[key]) && o[key] !== 0 ? o[key] : fallback;
    return Math.min(high, Math.max(low, v));
  }

  function whole(o, key, fallback, low, high) {
    return Math.floor(opt(o, key, fallback, low, high));
  }

  // every entry is (t, opts): t is the audio time at which the sound starts
  const SFX = {
    tap: function (t) { tone(900, t, 0.06, { to: 620, vol: 0.07, rev: 0.1 }); },
    pick: function (t) { tone(520, t, 0.13, { to: 900, vol: 0.09, type: 'triangle' }); },
    drop: function (t) {
      tone(640, t, 0.14, { to: 300, vol: 0.1, type: 'triangle' });
      noise(t, 0.07, { f: 320, ft: 'lowpass', vol: 0.07 });
    },
    // opts.streak: 1, 2, 3 … each right answer in a row rings a step higher, with sparkles from 3
    ok: function (t, o) {
      const k = whole(o, 'streak', 1, 1, 8) - 1;
      bell(PENTA[k], t);
      bell(PENTA[k + 2], t + 0.09);
      if (k >= 2) sparkles(t + 0.15, k);
    },
    no: function (t) {
      tone(210, t, 0.24, { to: 150, vol: 0.15, type: 'triangle', lp: 900 });
      tone(190, t + 0.13, 0.28, { to: 125, vol: 0.11, type: 'triangle', lp: 700 });
    },
    pop: function (t) { tone(380, t, 0.09, { to: 1150, glide: 0.06, vol: 0.13 }); },
    star: function (t) {
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach(function (f, i) { bell(f, t + i * 0.085, 0.14); });
      sparkles(t + 0.42, 10);
    },
    win: function (t) {
      brass(523.25, t, 0.17);
      brass(659.25, t + 0.16, 0.17);
      brass(783.99, t + 0.32, 0.17);
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f) { brass(f, t + 0.5, 1.1, 0.05); });
      tone(65, t + 0.5, 0.5, { to: 42, vol: 0.32, rev: 0 });
      noise(t + 0.5, 0.7, { f: 6000, ft: 'highpass', vol: 0.05, rev: 0.7 });
      sparkles(t + 0.7, 16);
    },
    whoosh: function (t) { noise(t, 0.3, { f: 450, to: 2600, q: 0.9, vol: 0.05 }); },
    // a soft card flip: a short swish of filtered noise, then a light tick as the card lands
    flip: function (t) {
      noise(t, 0.17, { f: 700, to: 3000, q: 0.8, vol: 0.05 });
      noise(t + 0.15, 0.035, { f: 3200, q: 6, vol: 0.07 });
      tone(1250, t + 0.15, 0.04, { to: 900, vol: 0.02, rev: 0.1 });
    },
    // opts.v: loudness, 0.04 (a small bounce) to 0.19 (a big one)
    boing: function (t, o) { tone(150, t, 0.38, { to: 430, glide: 0.08, vol: opt(o, 'v', 0.15, 0.005, 0.4), vib: 16, vibd: 28 }); },
    thud: function (t) {
      tone(120, t, 0.28, { to: 45, vol: 0.3, rev: 0.2 });
      noise(t, 0.13, { f: 420, ft: 'lowpass', vol: 0.12 });
    },
    tick: function (t) { noise(t, 0.045, { f: 2600, q: 7, vol: 0.14 }); },
    level: function (t) {
      tone(400, t, 0.45, { to: 1700, vol: 0.06, type: 'triangle' });
      sparkles(t + 0.3, 6);
    },
    // opts.i: 0 to 10, a step on the five-note scale
    chime: function (t, o) { bell(PENTA[whole(o, 'i', 0, 0, 10)], t, 0.12); },
    // opts.f: the pitch in hertz
    note: function (t, o) {
      const f = opt(o, 'f', 440, 30, 6000);
      tone(f, t, 0.4, { vol: 0.1, type: 'triangle', rev: 0.35 });
      tone(f * 2, t, 0.2, { vol: 0.035 });
    },
    // opts.i: 0 to 10, a bar of the xylophone
    xylo: function (t, o) {
      const f = PENTA[whole(o, 'i', 0, 0, 10)] * 0.5;
      tone(f, t, 0.5, { vol: 0.2 });
      tone(f * 4, t, 0.07, { vol: 0.05 });
      noise(t, 0.02, { f: 3000, vol: 0.04 });
    },
    step: function (t) { noise(t, 0.05, { f: 520, q: 2, vol: 0.05 }); },
    // Phase 5: a digit or a counter that clicks into its place, and digits that slide along the chart
    snap: function (t) { tone(760, t, 0.05, { to: 1040, vol: 0.06, type: 'triangle' }); noise(t, 0.03, { f: 2200, q: 4, vol: 0.05 }); },
    slide: function (t) { noise(t, 0.22, { f: 700, to: 1500, q: 1.2, vol: 0.04 }); tone(520, t + 0.2, 0.06, { to: 700, vol: 0.05, type: 'triangle' }); },
    stretch: function (t) { tone(170, t, 0.55, { to: 330, vol: 0.07, type: 'sawtooth', lp: 520, vib: 9, vibd: 7 }); },
    bubble: function (t) { tone(650 + Math.random() * 700, t, 0.08, { to: 1500 + Math.random() * 700, glide: 0.05, vol: 0.045, rev: 0.35 }); },
    splat: function (t) {
      noise(t, 0.2, { f: 900, to: 180, q: 2, vol: 0.15 });
      tone(300, t, 0.14, { to: 90, vol: 0.08 });
    },
    buzzer: function (t) {
      tone(150, t, 0.7, { type: 'sawtooth', vol: 0.07, lp: 600 });
      tone(152, t, 0.7, { type: 'sawtooth', vol: 0.05, lp: 600 });
    },
    firework: function (t) {
      noise(t, 0.45, { f: 300, to: 2800, q: 0.7, vol: 0.04 });
      noise(t + 0.45, 0.7, { f: 1700, q: 0.5, vol: 0.16, rev: 0.8 });
      for (let i = 0; i < 14; i++) noise(t + 0.55 + Math.random() * 0.7, 0.03, { f: 3500 + Math.random() * 2500, q: 3, vol: 0.045, rev: 0.6 });
    },
    scan: function (t) {
      tone(260, t, 1.25, { to: 1300, vol: 0.045, type: 'square', lp: 1500, rev: 0.2 });
      noise(t, 1.25, { f: 2000, q: 8, vol: 0.02 });
    },
    beep: function (t) {
      tone(1320, t, 0.09, { vol: 0.08, type: 'square', lp: 3000 });
      tone(1760, t + 0.12, 0.13, { vol: 0.08, type: 'square', lp: 3000 });
    },
    fall: function (t) { tone(1500, t, 0.7, { to: 380, vol: 0.05, type: 'sine', rev: 0.2 }); },
    // opts.d: how long, in seconds
    gurgle: function (t, o) {
      const d = opt(o, 'd', 1.5, 0.2, 4);
      for (let i = 0; i < d * 13; i++) tone(240 + Math.random() * 360, t + i / 13 + Math.random() * 0.03, 0.09, { to: 520 + Math.random() * 520, glide: 0.06, vol: 0.045, rev: 0.35 });
      noise(t, d, { f: 650, q: 1.4, vol: 0.035, a: 0.2, rev: 0.3 });
    },
    // opts.d: how long, in seconds
    hiss: function (t, o) {
      const d = opt(o, 'd', 1.5, 0.2, 4);
      noise(t, d, { f: 3800, ft: 'highpass', vol: 0.04, a: 0.25 });
      for (let i = 0; i < d * 28; i++) noise(t + Math.random() * d, 0.016, { f: 2500 + Math.random() * 3500, q: 4, vol: 0.055 });
    },
    // opts.d: how long, in seconds
    shimmer: function (t, o) {
      const d = opt(o, 'd', 2, 0.2, 4);
      for (let i = 0; i < d * 9; i++) tone(2200 + Math.random() * 1800, t + i / 9, 0.25, { vol: 0.02, rev: 0.9 });
    },
    // opts.n: how many blips (Zip's little chirp)
    zip: function (t, o) {
      const n = whole(o, 'n', 3, 1, 8);
      for (let i = 0; i < n; i++) tone(480 + Math.random() * 420, t + i * 0.08, 0.065, { type: 'square', lp: 1700, vol: 0.028, to: 520 + Math.random() * 480, rev: 0.1 });
    }
  };

  /* ---------- T.fx.sfx ---------- */

  function play(name, opts) {
    if (live.size >= MAX_VOICES) return false;
    try {
      SFX[name](C.currentTime + 0.01, opts);
      soundCount += 1;
      lastSound = name;
      return true;
    } catch (e) {
      return false;
    }
  }

  function playWaiting() {
    const list = waiting, now = Date.now();
    waiting = [];
    list.forEach(function (w) {
      if (now - w.asked < LATE_MS && isOn()) play(w.name, w.opts);
    });
  }

  // Never throws. Does nothing when the sound is off, the name is unknown, the page is hidden,
  // nobody has tapped yet or the browser has no Web Audio. Returns true when the sound was started
  // (or will start within a moment, on the very first tap).
  function sfx(name, opts) {
    try {
      if (typeof name !== 'string' || !hasOwn(SFX, name) || !isOn() || document.hidden) return false;
      const c = wake();
      if (!c) return false;
      if (c.state === 'running') return play(name, opts);
      // the very first tap: the context is still starting, so play as soon as it runs
      const now = Date.now();
      waiting = waiting.filter(function (w) { return now - w.asked < LATE_MS; }).slice(-7);
      waiting.push({ name: name, opts: opts, asked: now });
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- the "hear the word" voice ----------
     The only speech in the app. It runs only when a button calls it. */

  let spoken = null;                        // the last word that was said (kept alive until it is over)

  // -> the browser's speech tools, or null when it cannot speak (or speech is blocked)
  function speechParts() {
    if (T.NO_VOICE !== false) return null;            // Maths: no read-aloud voice anywhere (docs/01-brief.md)
    try {
      const synth = window.speechSynthesis, Utterance = window.SpeechSynthesisUtterance;
      return synth && Utterance ? { synth: synth, Utterance: Utterance } : null;
    } catch (e) {
      return null;
    }
  }

  // stop the word that is being said, if this page has said one
  function stopVoice() {
    if (!spoken) return;
    spoken = null;
    try {
      const parts = speechParts();
      if (parts) parts.synth.cancel();
    } catch (e) { /* nothing to stop */ }
  }

  // ask for the voice list early: some browsers load it only after the first request
  function warmVoices() {
    if (voicesWarmed) return;
    voicesWarmed = true;
    try {
      const parts = speechParts();
      if (parts) parts.synth.getVoices();
    } catch (e) { /* no voices: sayWord will report it */ }
  }

  function voiceLang(voice) {
    return String((voice && voice.lang) || '');
  }

  // a British English voice if there is one, otherwise any English voice, otherwise null;
  // a voice that lives on the device is preferred to one that needs the network
  function pickVoice(voices) {
    const british = voices.filter(function (v) { return /^en[-_]GB/i.test(voiceLang(v)); });
    const english = voices.filter(function (v) { return /^en([-_]|$)/i.test(voiceLang(v)); });
    const local = function (v) { return v.localService; };
    return british.filter(local)[0] || british[0] || english.filter(local)[0] || english[0] || null;
  }

  // Returns true when the word was handed to the voice. Returns false when the browser cannot
  // speak, when there is nothing to say, or when the device lists voices and none of them is
  // English (a voice for another language would only mangle the word).
  function sayWord(text) {
    try {
      const parts = speechParts();
      const word = String(text == null ? '' : text).trim();
      if (!parts || !word) return false;
      const voices = Array.prototype.slice.call(parts.synth.getVoices() || []);
      const voice = pickVoice(voices);
      const allForeign = voices.length > 0 && voices.every(function (v) { return voiceLang(v) !== ''; });
      if (!voice && allForeign) return false;
      const u = new parts.Utterance(word);
      if (voice) u.voice = voice;
      u.lang = voice ? voiceLang(voice).replace('_', '-') : 'en-GB';   // no list yet: let the browser choose
      u.rate = 0.85;
      parts.synth.cancel();
      parts.synth.speak(u);
      spoken = u;
      watchVisibility();
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- particles: one canvas over the whole window ----------
     Created on first use. It never takes a tap (pointer-events: none). */

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const LAYER = 9990;                       // above the content; the flying star goes one higher
  const COLOURS = ['#111111', '#1F3A5F', '#4A4A4A', '#111111', '#7A7A7A', '#1F3A5F', '#2B2B2B', '#9A9A9A'];   // ink (paper look)
  const MAX_PARTICLES = 400;
  const MAX_SCALE = 2;                      // sharper than this cannot be seen on moving specks
  const MAX_CANVAS_PIXELS = 5000000;        // keeps a huge classroom board cheap to clear

  let canvas = null, pen = null, canvasTried = false;
  let particles = [], rafId = 0, lastFrame = 0;
  let viewW = 0, viewH = 0, pixelScale = 1, fitDpr = 0, needFit = true;
  let motionQuery = null;

  // still = the child's device asks for reduced motion, or the effects tier is 1 (80-polish.js: a slow device).
  // Both get the same thing: no movement, the final state at once (Phase 5, docs/02).
  function reducedMotion() {
    try {
      if (document.documentElement.getAttribute('data-fx') === '1') return true;
      if (!motionQuery && window.matchMedia) motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      return !!(motionQuery && motionQuery.matches);
    } catch (e) {
      return false;
    }
  }

  function getPen() {
    if (pen || canvasTried) return pen;
    canvasTried = true;
    try {
      canvas = document.querySelector('canvas#fx');          // reuse the one in body.html if it is there
      if (!canvas) {
        canvas = document.createElement('canvas');
        if (!document.getElementById('fx')) canvas.id = 'fx';
        document.body.appendChild(canvas);
      }
      canvas.classList.add('fx-canvas');
      canvas.setAttribute('aria-hidden', 'true');
      const s = canvas.style;
      s.position = 'fixed';
      s.left = '0';
      s.top = '0';
      s.width = '100%';
      s.height = '100%';
      s.pointerEvents = 'none';
      s.zIndex = String(LAYER);
      pen = canvas.getContext('2d');
      window.addEventListener('resize', function () { needFit = true; });
    } catch (e) {
      pen = null;
    }
    return pen;
  }

  // match the canvas to the window and to the screen's pixel density
  function fit() {
    needFit = false;
    fitDpr = window.devicePixelRatio || 1;
    viewW = canvas.clientWidth || window.innerWidth || 0;
    viewH = canvas.clientHeight || window.innerHeight || 0;
    let scale = Math.min(fitDpr, MAX_SCALE);
    if (viewW * viewH * scale * scale > MAX_CANVAS_PIXELS) scale = Math.sqrt(MAX_CANVAS_PIXELS / (viewW * viewH));
    pixelScale = scale;
    const w = Math.max(1, Math.round(viewW * scale)), h = Math.max(1, Math.round(viewH * scale));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  /* ---------- particles: the animation loop (it stops when nothing is alive) ---------- */

  function starShape(r) {
    pen.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
      pen.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    pen.closePath();
  }

  function fade(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  // move and draw one particle; k is the frame length measured in 60ths of a second
  function drawParticle(p, k) {
    pen.save();
    if (p.kind === 'ring') {
      p.radius += p.grow * k;
      p.grow *= Math.pow(0.93, k);
      pen.globalAlpha = fade(p.life / p.span);
      pen.strokeStyle = p.colour;
      pen.lineWidth = 3 * fade(p.life / p.span) + 1;
      pen.beginPath();
      pen.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      pen.stroke();
      pen.restore();
      return;
    }
    const slow = Math.pow(p.drag, k);
    p.vy += p.gravity * k;
    p.vx *= slow;
    p.vy *= slow;
    p.x += (p.vx + (p.wobble ? Math.sin(p.life * 0.15 + p.wobble) * 0.6 : 0)) * k;
    p.y += p.vy * k;
    p.angle += p.spin * k;
    pen.translate(p.x, p.y);
    pen.rotate(p.angle);
    pen.globalAlpha = fade(p.life / 25);
    pen.fillStyle = p.colour;
    if (p.kind === 'spark') {
      const r = p.size * (0.6 + 0.4 * Math.sin(p.life * 0.5));
      pen.globalCompositeOperation = 'lighter';
      starShape(r * 1.6);
      pen.fill();
      pen.fillStyle = 'rgba(255,255,255,.9)';
      pen.beginPath();
      pen.arc(0, 0, r * 0.45, 0, Math.PI * 2);
      pen.fill();
    } else if (p.kind === 'star') {
      starShape(p.size * 0.8);
      pen.fill();
    } else if (p.kind === 'dot') {
      pen.beginPath();
      pen.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
      pen.fill();
    } else {                                // a tumbling piece of paper
      pen.scale(1, Math.cos(p.life * 0.2));
      pen.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
    }
    pen.restore();
  }

  function frame(now) {
    rafId = 0;
    try {
      const k = lastFrame ? Math.min(3, Math.max(0.1, (now - lastFrame) / 16.667)) : 1;
      lastFrame = now;
      if (needFit || fitDpr !== (window.devicePixelRatio || 1)) fit();
      pen.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
      pen.clearRect(0, 0, viewW, viewH);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life -= k;
        if (p.life > 0) drawParticle(p, k);
      }
      particles = particles.filter(function (p) { return p.life > 0 && p.y < viewH + 60; });
    } catch (e) {
      particles = [];
    }
    if (particles.length) { rafId = requestAnimationFrame(frame); return; }
    lastFrame = 0;
    try { pen.clearRect(0, 0, viewW, viewH); } catch (e) { /* the canvas is gone */ }
  }

  function addParticle(p) {
    particles.push(p);
    if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
    if (!rafId) { lastFrame = 0; rafId = requestAnimationFrame(frame); }
  }

  // may particles be drawn at this point? (not under reduced motion, not without a canvas)
  function canDraw(x, y) {
    return isNumber(x) && isNumber(y) && !reducedMotion() && !!getPen();
  }

  function howMany(n, fallback) {
    const v = isNumber(n) ? n : fallback;
    return Math.max(0, Math.min(MAX_PARTICLES, Math.floor(v)));
  }

  /* ---------- particles: the effects ---------- */

  // life: how long a piece lives, in 60ths of a second (default 90 to 140: a celebration; a right answer: shorter)
  function confetti(x, y, n, spread, life) {
    try {
      if (!canDraw(x, y)) return;
      const sp = isNumber(spread) && spread > 0 ? spread : 12;
      const span = isNumber(life) && life > 0 ? life : 90;
      const count = howMany(n, 24);
      for (let i = 0; i < count; i++) {
        const pick = Math.random();
        addParticle({
          kind: pick < 0.25 ? 'star' : pick < 0.5 ? 'dot' : 'paper', x: x, y: y,
          vx: (Math.random() - 0.5) * sp, vy: -Math.random() * sp - 3,
          size: Math.random() * 6 + 6, colour: COLOURS[i % COLOURS.length],
          angle: Math.random() * 6, spin: (Math.random() - 0.5) * 0.35,
          life: span + Math.random() * span * 0.55, gravity: 0.28, drag: 0.985, wobble: Math.random() * 6
        });
      }
    } catch (e) { /* decoration only */ }
  }

  function sparkle(x, y, n, colour) {
    try {
      if (!canDraw(x, y)) return;
      const count = howMany(n, 12);
      for (let i = 0; i < count; i++) {
        const dir = Math.random() * Math.PI * 2, speed = 1.5 + Math.random() * 4.5;
        addParticle({
          kind: 'spark', x: x, y: y, vx: Math.cos(dir) * speed, vy: Math.sin(dir) * speed,
          size: 2.2 + Math.random() * 2.6, colour: colour || '#4A4A4A', angle: 0, spin: 0.1,
          life: 34 + Math.random() * 26, gravity: 0.03, drag: 0.93, wobble: 0
        });
      }
    } catch (e) { /* decoration only */ }
  }

  function ring(x, y, colour) {
    try {
      if (!canDraw(x, y)) return;
      addParticle({ kind: 'ring', x: x, y: y, radius: 8, grow: 7, colour: colour || '#111111', life: 28, span: 28 });
    } catch (e) { /* decoration only */ }
  }

  function centreOf(el) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return null;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return null;                  // hidden or not on the page
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // Phase 5: a small burst (20 or fewer, a right answer) is short and stays near the answer: gone in about a second,
  // so nothing falls over the feedback the child is about to read. A bigger one (a result card) keeps its long fall.
  function burst(el, n) {
    try {
      const c = centreOf(el);
      if (!c) return;
      const count = howMany(n, 24);
      const small = count <= 20;
      confetti(c.x, c.y, small ? Math.round(count * 0.6) : count, small ? 7 : 12, small ? 38 : 90);
      sparkle(c.x, c.y, Math.max(8, Math.round(count / 2)));
      ring(c.x, c.y, COLOURS[Math.floor(Math.random() * 4)]);
    } catch (e) { /* decoration only */ }
  }

  /* ---------- the flying star ----------
     A drawn star (an SVG path, never a text glyph) flies in an arc from one element to another
     with the Web Animations API, then 'chime' plays. Under reduced motion nothing flies and the
     chime plays at once. The promise gives true when a star really flew. */

  const FLY_MS = 800;
  const FLY_FRAMES = 12;                    // points along the arc
  const FLY_CHIME = 7;                      // the default note of the landing chime (opts.i changes it)
  const STAR_PATH = starPathData(12, 12, 10.5, 4.8);

  function starPathData(cx, cy, outer, inner) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 5 * i - Math.PI / 2, r = i % 2 ? inner : outer;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(2) + ' ' + (cy + Math.sin(a) * r).toFixed(2);
    }
    return d + 'Z';
  }

  function makeStar(size) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'fx-flystar');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:fixed;left:0;top:0;margin:0;pointer-events:none;will-change:transform;z-index:' + (LAYER + 1);
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', STAR_PATH);
    path.setAttribute('fill', '#111111');                    // presentation attributes: CSS may restyle .fx-flystar path
    path.setAttribute('stroke', '#000000');
    path.setAttribute('stroke-width', '1.4');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    return svg;
  }

  // keyframes along a curve that rises above both ends; the star pops up, turns once and shrinks as it lands
  function flightFrames(a, b, size) {
    const half = size / 2;
    const lift = Math.min(160, 40 + Math.hypot(b.x - a.x, b.y - a.y) * 0.3);
    const midX = (a.x + b.x) / 2, midY = Math.max(half, Math.min(a.y, b.y) - lift);
    const frames = [];
    for (let i = 0; i <= FLY_FRAMES; i++) {
      const t = i / FLY_FRAMES, u = 1 - t;
      const x = u * u * a.x + 2 * u * t * midX + t * t * b.x;
      const y = u * u * a.y + 2 * u * t * midY + t * t * b.y;
      const scale = t < 0.25 ? 0.7 + 3.6 * t : 1.6 - (t - 0.25) / 0.75;
      frames.push({
        offset: t,
        opacity: t > 0.9 ? 0.85 : 1,
        transform: 'translate(' + (x - half).toFixed(1) + 'px,' + (y - half).toFixed(1) + 'px) scale(' + scale.toFixed(3) + ') rotate(' + Math.round(360 * t) + 'deg)'
      });
    }
    return frames;
  }

  // opts.i: the note of the landing chime, 0 to 10 (say 5, 6, 7 for the first, second and third star)
  function flyStar(fromEl, toEl, opts) {
    const chimeNote = opts && isNumber(opts.i) ? Math.min(10, Math.max(0, Math.floor(opts.i))) : FLY_CHIME;
    return new Promise(function (resolve) {
      let landed = false, star = null, guard = 0;
      function land(flew) {
        if (landed) return;
        landed = true;
        clearTimeout(guard);
        try {
          if (star && star.parentNode) star.parentNode.removeChild(star);
          const at = flew ? centreOf(toEl) : null;
          if (at) sparkle(at.x, at.y, 14);
        } catch (e) { /* decoration only */ }
        sfx('chime', { i: chimeNote });
        resolve(!!flew);
      }
      try {
        const a = centreOf(fromEl), b = centreOf(toEl);
        if (!a || !b || reducedMotion() || typeof document.body.animate !== 'function') { land(false); return; }
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const size = Math.round(rem * 2.5);
        star = makeStar(size);
        document.body.appendChild(star);
        const flight = star.animate(flightFrames(a, b, size), { duration: FLY_MS, easing: 'ease-in-out', fill: 'both' });
        flight.onfinish = function () { land(true); };
        flight.oncancel = function () { land(false); };
        guard = setTimeout(function () { land(true); }, FLY_MS + 1500);   // if the animation never reports back
      } catch (e) {
        land(false);
      }
    });
  }

  /* ---------- status, for tests and the dev kit ---------- */

  function status() {
    return {
      on: isOn(),
      audio: !audioCtor() || audioFailed ? 'unavailable' : C ? C.state : 'idle',   // idle = waiting for the first tap
      voices: live.size,                    // sound sources that are playing or scheduled
      sounds: soundCount,                   // how many sounds have been started so far
      last: lastSound,                      // the name of the last sound that was started
      speech: !!speechParts(),
      reducedMotion: reducedMotion(),
      particles: particles.length,
      looping: !!rafId
    };
  }

  /* ---------- public API ---------- */

  T.fx = {
    sfx: sfx, toggle: toggle, unlock: unlock, silence: hush, sayWord: sayWord,
    confetti: confetti, sparkle: sparkle, ring: ring, burst: burst, flyStar: flyStar, still: reducedMotion,
    names: Object.keys(SFX), status: status
  };
  Object.defineProperty(T.fx, 'on', { enumerable: true, configurable: true, get: isOn, set: setOn });

  /* ---------- wake the audio on the first tap or key press (the listeners remove themselves) ---------- */

  arm();
})(window.T = window.T || {});

