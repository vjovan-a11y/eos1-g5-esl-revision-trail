/* 08-g5-models-s7.js - Grade 5 question models for Stop 7: quadrilaterals (6Gg.01) and rotational symmetry (6Gg.08).
   No page code. Every shape is a list of corners (MX.G7.SH); every property that a question asks for or states
   (pairs of parallel sides, equal sides, right angles, diagonals, lines of symmetry, order of rotational symmetry,
   the name) is worked out here from those corners, never typed. A model throws when its data does not make one
   sound question (two true options, a "wrong" name that is also true, an example drawing that does not fit).

   MX.G7   SH (the table), of(id) -> properties, quad(pts), order4(pts, edges), is(p, name), say(id), tell(aspect, p),
           ST (the statements a shape can be tested with), fitsAfter(shape, degrees), svg(shape, marks) -> the drawing

   Statement keys (ST): par0 par1 par2 | eq4 noteq4 eqopp kite (not a rhombus) kitei (any kite, a rhombus too) | right0 right2 right4 | sym0 sym1 sym2 sym4 |
                        rot1 rot2 rot3 rot4 | deq dneq dperp dbis
   Marks of a drawing: { ticks, par, right, diag, sym, centre, dot, grid, lens: { side: '8 cm' } }

   qname   { id, opts: ['rectangle', 'kite'], at }               name the quadrilateral in the picture (tick)
   qclue   { id, clues: ['par', 'eq', 'right'], opts: [...], at }   "I have ... What am I?": the name from properties
   qfact   { id, stmts: ['sym1', 'par2', 'right4'], at, marks? }  which sentence is true for this shape (the first is)
   qnum    { id, ask: ['par', 'right', 'sym', 'rot'] }            write the numbers: one box for each property
   qcount  { ids: [...], prop: 'par2' }                           how many of these shapes have the property? (a box)
   spick   { ids: [...], prop: 'par2' }                           tap every shape with the property (tool shpick)
   swhich  { ids: [right, wrong, wrong, (wrong)], prop, at, marks?, text?, worked? }   which shape has the property (figures);
                                                                  worked: a sentence put before the worked answer
   rorder  { id, tool?: true }                                    the order of rotational symmetry (the turning tool,
                                                                  or the picture alone), one box
   rtiles  { who, he?, items: [['rhombus', 3], ['square', 2]] }   two steps: the orders of the tiles, then the sum
   qperim  { id, len: [8, 5], unit: 'cm', text? }                 two steps: the equal sides, then the perimeter
   gdraw   { cols, rows, given: [[x, y] ...], need: ['par2'], ex: [[x, y] ...], shape?, text? }
                                                                  finish or draw a quadrilateral on the dot grid
                                                                  (tool qgrid); the drawing is checked by geometry */
(function () {
"use strict";
const M = MX.M, arrange = MX.arrange, cap = MX.cap;
const L6 = "ABCDEF";

/* ---------- geometry ---------- */
const EPS = 1e-6, near0 = v => Math.abs(v) < EPS;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const samePt = (a, b) => near0(a[0] - b[0]) && near0(a[1] - b[1]);
const R3 = Math.sqrt(3);

/* the shapes: corners in order, y upwards. Quadrilaterals have 4 corners; `say` names the others (a label, not an
   answer). A pattern is a list of pieces (polys). Nothing else is typed: see props(). */
const rot90 = p => p.map(q => [-q[1], q[0]]);
const rotBy = (p, deg) => { const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t); return p.map(q => [q[0] * c - q[1] * s, q[0] * s + q[1] * c]); };
const BLADE4 = [[0, 0], [2.6, 0], [2.6, 1.3]], BLADE3 = [[0, 0], [3, 0], [2.3, 1.3]];
const SH = {
  square:   { pts: [[0, 0], [4, 0], [4, 4], [0, 4]] },
  squaret:  { pts: [[3, 0], [6, 3], [3, 6], [0, 3]] },
  rect:     { pts: [[0, 0], [6, 0], [6, 3], [0, 3]] },
  recttall: { pts: [[0, 0], [3, 0], [3, 6], [0, 6]] },
  para:     { pts: [[0, 0], [4, 0], [6, 3], [2, 3]] },
  paral:    { pts: [[2, 0], [7, 0], [5, 3], [0, 3]] },
  rhombus:  { pts: [[3, 0], [6, 2], [3, 4], [0, 2]] },
  rhombusl: { pts: [[0, 0], [5, 0], [8, 4], [3, 4]] },
  trap:     { pts: [[0, 0], [6, 0], [4, 3], [1, 3]] },
  isotrap:  { pts: [[0, 0], [6, 0], [4, 3], [2, 3]] },
  rtrap:    { pts: [[0, 0], [5, 0], [3, 3], [0, 3]] },
  kite:     { pts: [[2, 0], [4, 5], [2, 6], [0, 5]] },
  kitew:    { pts: [[0, 2], [1, 0], [6, 2], [1, 4]] },
  quad:     { pts: [[0, 0], [5, 1], [4, 4], [1, 2]] },
  tri:      { say: "equilateral triangle", pts: [[0, 0], [4, 0], [2, 2 * R3]] },
  isotri:   { say: "triangle with 2 equal sides", pts: [[0, 0], [4, 0], [2, 5]] },
  rtri:     { say: "right-angled triangle", pts: [[0, 0], [5, 0], [0, 3]] },
  plus:     { say: "cross", pts: [[1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [2, 2], [2, 3], [1, 3], [1, 2], [0, 2], [0, 1], [1, 1]].map(p => [p[0] * 1.5, p[1] * 1.5]) },
  star4:    { say: "four-point star", pts: [[0, 3], [1, 1], [3, 0], [1, -1], [0, -3], [-1, -1], [-3, 0], [-1, 1]] },
  leth:     { say: "letter H", pts: [[0, 0], [1, 0], [1, 2], [2, 2], [2, 0], [3, 0], [3, 5], [2, 5], [2, 3], [1, 3], [1, 5], [0, 5]] },
  letz:     { say: "letter Z", pts: [[0, 0], [4, 0], [4, 1], [1.5, 1], [4, 4], [4, 5], [0, 5], [0, 4], [2.5, 4], [0, 1]] },
  letn:     { say: "letter N", pts: [[0, 0], [1, 0], [1, 3.2], [3, 0], [4, 0], [4, 5], [3, 5], [3, 1.8], [1, 5], [0, 5]] },
  lett:     { say: "letter T", pts: [[1, 0], [2, 0], [2, 3], [3, 3], [3, 4], [0, 4], [0, 3], [1, 3]] },
  letl:     { say: "letter L", pts: [[0, 0], [3, 0], [3, 1], [1, 1], [1, 4], [0, 4]] },
  arrow:    { say: "arrow", pts: [[0, 1], [3, 1], [3, 0], [5, 2], [3, 4], [3, 3], [0, 3]] },
  windmill: { say: "windmill pattern", polys: [BLADE4, rot90(BLADE4), rot90(rot90(BLADE4)), rot90(rot90(rot90(BLADE4)))] },
  fan3:     { say: "fan with 3 blades", polys: [BLADE3, rotBy(BLADE3, 120), rotBy(BLADE3, 240)] },
  twosq:    { say: "pattern of 2 squares", polys: [[[0, 0], [2, 0], [2, 2], [0, 2]], [[2, 2], [4, 2], [4, 4], [2, 4]]] }
};

const polysOf = s => s.polys || [s.pts];
function centre(polys) { let x = 0, y = 0, n = 0; polys.forEach(p => p.forEach(q => { x += q[0]; y += q[1]; n++; })); return [x / n, y / n]; }
function turn(polys, c, deg) {
  const t = deg * Math.PI / 180, cs = Math.cos(t), sn = Math.sin(t);
  return polys.map(p => p.map(q => { const dx = q[0] - c[0], dy = q[1] - c[1]; return [c[0] + dx * cs - dy * sn, c[1] + dx * sn + dy * cs]; }));
}
/* the mirror picture in the line through c at the angle deg */
function flip(polys, c, deg) {
  const t = 2 * deg * Math.PI / 180, cs = Math.cos(t), sn = Math.sin(t);
  return polys.map(p => p.map(q => { const dx = q[0] - c[0], dy = q[1] - c[1]; return [c[0] + dx * cs + dy * sn, c[1] + dx * sn - dy * cs]; }));
}
function samePoly(a, b) {
  const n = a.length;
  if (n !== b.length) return false;
  for (let s = 0; s < n; s++) for (const dir of [1, -1]) if (a.every((p, i) => samePt(p, b[((s + dir * i) % n + n) % n]))) return true;
  return false;
}
function sameFig(A, B) {
  const used = [];
  return A.length === B.length && A.every(a => { const j = B.findIndex((b, k) => !used[k] && samePoly(a, b)); if (j < 0) return false; used[j] = 1; return true; });
}
/* does the shape fit its own outline after a turn of deg degrees about its centre? */
function fitsAfter(s, deg) { const ps = polysOf(shapeOf(s)); return sameFig(turn(ps, centre(ps), deg), ps); }
/* the order of rotational symmetry: the largest k for which a turn of 360 / k fits (1: only the full turn) */
function rotOrder(polys) { const c = centre(polys); for (let k = 12; k >= 2; k--) if (sameFig(turn(polys, c, 360 / k), polys)) return k; return 1; }
/* the lines of symmetry: the angles (0 to 180) of the mirror lines through the centre */
function symLines(polys) {
  const c = centre(polys), cand = [], all = [].concat.apply([], polys);
  const add = v => { if (near0(v[0]) && near0(v[1])) return; let a = Math.atan2(v[1], v[0]) * 180 / Math.PI; a = ((a % 180) + 180) % 180; if (a > 180 - 1e-4) a = 0; if (!cand.some(x => Math.abs(x - a) < 1e-4)) cand.push(a); };
  all.forEach(p => add(sub(p, c)));
  all.forEach((p, i) => all.forEach((q, j) => { if (j > i) { const v = sub(q, p); add([-v[1], v[0]]); } }));
  return cand.filter(a => sameFig(flip(polys, c, a), polys)).sort((x, y) => x - y);
}

/* groups of equal numbers: [[0, 2], [1, 3]] (indexes), in the order of the first member */
function groupsOf(vals) {
  const gs = [];
  vals.forEach((v, i) => { const g = gs.find(x => near0(vals[x[0]] - v)); if (g) g.push(i); else gs.push([i]); });
  return gs;
}
const properCross = (a, b, c, d) => cross(sub(b, a), sub(c, a)) * cross(sub(b, a), sub(d, a)) < -EPS && cross(sub(d, c), sub(a, c)) * cross(sub(d, c), sub(b, c)) < -EPS;

/* the properties of 4 corners taken in order (null when they do not make a quadrilateral) */
function quad(pts) {
  if (!pts || pts.length !== 4) return null;
  const P = i => pts[((i % 4) + 4) % 4], v = [0, 1, 2, 3].map(i => sub(P(i + 1), P(i)));
  for (let i = 0; i < 4; i++) { if (near0(cross(v[i], v[(i + 1) % 4]))) return null; for (let j = i + 1; j < 4; j++) if (samePt(pts[i], pts[j])) return null; }
  if (properCross(P(0), P(1), P(2), P(3)) || properCross(P(1), P(2), P(3), P(0))) return null;
  const l2 = v.map(x => dot(x, x)), groups = groupsOf(l2);
  const par = (near0(cross(v[0], v[2])) ? 1 : 0) + (near0(cross(v[1], v[3])) ? 1 : 0);
  const right = [0, 1, 2, 3].filter(i => near0(dot(v[i], v[(i + 3) % 4]))).length;
  const eqAll = groups.length === 1, eqOpp = near0(l2[0] - l2[2]) && near0(l2[1] - l2[3]);
  const eqAdj = (near0(l2[0] - l2[1]) && near0(l2[2] - l2[3])) || (near0(l2[1] - l2[2]) && near0(l2[3] - l2[0]));
  const d1 = sub(P(2), P(0)), d2 = sub(P(3), P(1));
  const m1 = [(P(0)[0] + P(2)[0]) / 2, (P(0)[1] + P(2)[1]) / 2], m2 = [(P(1)[0] + P(3)[0]) / 2, (P(1)[1] + P(3)[1]) / 2];
  const sym = symLines([pts]), rot = rotOrder([pts]);
  const p = { quad: true, pts: pts, par: par, right: right, eqAll: eqAll, eqOpp: eqOpp, eqAdj: eqAdj, groups: groups, l2: l2,
    dEq: near0(dot(d1, d1) - dot(d2, d2)), dPerp: near0(dot(d1, d2)), dBis: samePt(m1, m2), sym: sym.length, symAt: sym, rot: rot, sides: 4 };
  p.name = right === 4 && eqAll ? "square" : right === 4 ? "rectangle" : eqAll ? "rhombus" : par === 2 ? "parallelogram" : par === 1 ? "trapezium" : eqAdj ? "kite" : "quadrilateral";
  return p;
}
/* 4 dots in any order -> the corners in order round the shape (the sides do not cross); `edges` (pairs of dots that
   must stay sides) choose between the three ways when one dot lies inside the others. null: no quadrilateral. */
function order4(pts, edges) {
  if (!pts || pts.length !== 4) return null;
  const ways = [[0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3]].map(w => w.map(i => pts[i])).filter(w => quad(w));
  if (!ways.length) return null;
  const has = (w, e) => w.some((p, i) => { const q = w[(i + 1) % 4]; return (samePt(p, e[0]) && samePt(q, e[1])) || (samePt(p, e[1]) && samePt(q, e[0])); });
  return ways.find(w => (edges || []).every(e => has(w, e))) || ways[0];
}

function shapeOf(s) { const sh = typeof s === "string" ? SH[s] : s; if (!sh) throw new Error("G7: no shape " + s); return sh; }
const cache = {};
/* the properties of a shape of the table (or of { pts } / { polys }) */
function of(s) {
  if (typeof s === "string" && cache[s]) return cache[s];
  const sh = shapeOf(s), polys = polysOf(sh);
  let p = polys.length === 1 && polys[0].length === 4 ? quad(polys[0]) : null;
  if (!p) { const sym = symLines(polys); p = { quad: false, sym: sym.length, symAt: sym, rot: rotOrder(polys), sides: polys.length === 1 ? polys[0].length : 0, name: sh.say || "shape" }; }
  p.say = sh.say || p.name;
  if (typeof s === "string") { p.id = s; cache[s] = p; }
  return p;
}
const QUADS = Object.keys(SH).filter(id => !SH[id].polys && SH[id].pts.length === 4);

/* the inclusive names: a square is a rectangle, a rhombus, a parallelogram and a kite; a trapezium has ONE pair */
function is(p, name) {
  if (!p.quad) return false;
  return name === "square" ? p.right === 4 && p.eqAll : name === "rectangle" ? p.right === 4 : name === "rhombus" ? p.eqAll :
    name === "parallelogram" ? p.par === 2 : name === "trapezium" ? p.par === 1 : name === "kite" ? p.eqAdj : name === "quadrilateral";
}
const DEF = {
  square: "A square has 4 equal sides and 4 right angles.", rectangle: "A rectangle has 4 right angles.", rhombus: "A rhombus has 4 equal sides.",
  parallelogram: "A parallelogram has 2 pairs of parallel sides.", trapezium: "A trapezium has exactly one pair of parallel sides.",
  kite: "A kite has 2 pairs of equal sides. The equal sides are next to each other."
};
const NAMES = Object.keys(DEF);

/* what is true of the shape, in words, for one aspect */
const plural = (n, one, many) => (n === 0 ? "no " + many : n === 1 ? "1 " + one : n + " " + many);
function tell(a, p) {
  const big = Math.max.apply(null, (p.groups || [[0]]).map(g => g.length));
  switch (a) {
    case "par": return ["no parallel sides", "exactly one pair of parallel sides", "2 pairs of parallel sides"][p.par];
    case "eq": return p.eqAll ? "4 equal sides" : p.eqOpp ? "2 pairs of equal sides opposite each other" : p.eqAdj ? "2 pairs of equal sides next to each other" : big === 2 ? "only 2 equal sides" : "4 sides of different lengths";
    case "right": return plural(p.right, "right angle", "right angles");
    case "sym": return p.sym === 0 ? "no line of symmetry" : plural(p.sym, "line of symmetry", "lines of symmetry");
    case "rot": return p.rot === 1 ? "no rotational symmetry (order 1)" : "rotational symmetry of order " + p.rot;
    case "deq": return p.dEq ? "diagonals of equal length" : "diagonals of different lengths";
    case "dperp": return p.dPerp ? "diagonals that cross at right angles" : "diagonals that do not cross at right angles";
    case "dbis": return p.dBis ? "diagonals that cut each other in half" : "diagonals that do not both cut each other in half";
  }
  throw new Error("G7: no aspect " + a);
}
const Q = f => p => { if (!p.quad) throw new Error("G7: this statement is for quadrilaterals only"); return f(p); };
/* the statements: a = the aspect, has = "It has ...", test = is it true of the shape? */
const ST = {
  par0: { a: "par", has: "no parallel sides", test: Q(p => p.par === 0) },
  par1: { a: "par", has: "exactly one pair of parallel sides", test: Q(p => p.par === 1) },
  par2: { a: "par", has: "2 pairs of parallel sides", test: Q(p => p.par === 2) },
  eq4: { a: "eq", has: "4 equal sides", test: Q(p => p.eqAll) },
  noteq4: { a: "eq", has: "sides that are not all equal", test: Q(p => !p.eqAll) },
  eqopp: { a: "eq", has: "opposite sides of equal length", test: Q(p => p.eqOpp) },
  kite: { a: "eq", has: "2 pairs of equal sides next to each other", needs: "2 pairs of equal sides next to each other. Its 4 sides must not all be equal", test: Q(p => p.eqAdj && !p.eqAll) },
  kitei: { a: "eq", has: "2 pairs of equal sides next to each other", test: Q(p => p.eqAdj) },
  right0: { a: "right", has: "no right angles", test: Q(p => p.right === 0) },
  right2: { a: "right", has: "exactly 2 right angles", test: Q(p => p.right === 2) },
  right4: { a: "right", has: "4 right angles", test: Q(p => p.right === 4) },
  sym0: { a: "sym", has: "no line of symmetry", test: p => p.sym === 0 },
  sym1: { a: "sym", has: "exactly 1 line of symmetry", test: p => p.sym === 1 },
  sym2: { a: "sym", has: "exactly 2 lines of symmetry", test: p => p.sym === 2 },
  sym4: { a: "sym", has: "4 lines of symmetry", test: p => p.sym === 4 },
  rot1: { a: "rot", has: "no rotational symmetry (order 1)", test: p => p.rot === 1 },
  rot2: { a: "rot", has: "rotational symmetry of order 2", test: p => p.rot === 2 },
  rot3: { a: "rot", has: "rotational symmetry of order 3", test: p => p.rot === 3 },
  rot4: { a: "rot", has: "rotational symmetry of order 4", test: p => p.rot === 4 },
  deq: { a: "deq", has: "diagonals of equal length", test: Q(p => p.dEq) },
  dneq: { a: "deq", has: "diagonals of different lengths", test: Q(p => !p.dEq) },
  dperp: { a: "dperp", has: "diagonals that cross at right angles", test: Q(p => p.dPerp) },
  dbis: { a: "dbis", has: "diagonals that cut each other in half", test: Q(p => p.dBis) }
};
const st = k => { if (!ST[k]) throw new Error("G7: no statement " + k); return ST[k]; };

/* ---------- the drawing (a string of SVG, so that a claim can carry a counter-example in its reason) ---------- */
const f2 = n => String(+n.toFixed(2));
const unit = v => { const l = Math.sqrt(dot(v, v)) || 1; return [v[0] / l, v[1] / l]; };
function svg(s, o) {
  o = o || {};
  const sh = shapeOf(s), polys = polysOf(sh), all = [].concat.apply([], polys), c = centre(polys), flipY = !o.ydown;
  const q = polys.length === 1 && polys[0].length === 4 ? quad(polys[0]) : null;
  const U = 20, pad = o.lens ? 50 : o.sym ? 16 : 12;
  let x0, x1, y0, y1;
  if (o.box === "turn") {
    const r = Math.max.apply(null, all.map(p => Math.sqrt(dot(sub(p, c), sub(p, c))))) + 0.15;
    x0 = c[0] - r; x1 = c[0] + r; y0 = c[1] - r; y1 = c[1] + r;
  } else if (o.grid && typeof o.grid === "object") { x0 = 0; y0 = 0; x1 = o.grid.cols - 1; y1 = o.grid.rows - 1; }
  else {
    x0 = Math.min.apply(null, all.map(p => p[0])); x1 = Math.max.apply(null, all.map(p => p[0]));
    y0 = Math.min.apply(null, all.map(p => p[1])); y1 = Math.max.apply(null, all.map(p => p[1]));
    if (o.grid) { x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; x1 = Math.ceil(x1) + 1; y1 = Math.ceil(y1) + 1; }
  }
  const W = (x1 - x0) * U + 2 * pad, H = (y1 - y0) * U + 2 * pad;
  const X = p => [(p[0] - x0) * U + pad, flipY ? (y1 - p[1]) * U + pad : (p[1] - y0) * U + pad];
  const pt = p => f2(p[0]) + " " + f2(p[1]);
  const path = ps => "M" + ps.map(X).map(pt).join("L") + "Z";
  const C = X(c);
  let out = "";
  if (o.grid) for (let gx = Math.round(x0); gx <= x1 + EPS; gx++) for (let gy = Math.round(y0); gy <= y1 + EPS; gy++) { const g = X([gx, gy]); out += '<circle class="shp__gd" cx="' + f2(g[0]) + '" cy="' + f2(g[1]) + '" r="2.3"/>'; }
  if (o.ghost) {
    out += polys.map(p => '<path class="shp__ghost" d="' + path(p) + '"/>').join("");
    out += '<path class="shp__cross" d="M' + f2(C[0] - 4) + " " + f2(C[1]) + "h8M" + f2(C[0]) + " " + f2(C[1] - 4) + 'v8"/>';
  } else {
    out += polys.map(p => '<path class="shp__f" d="' + path(p) + '"/>').join("");
    if (o.sym) {
      /* each line of symmetry, cut where it leaves the picture (half a step outside the shape) */
      const m = 0.55, bx = [x0 - m, x1 + m], by = [y0 - m, y1 + m];
      symLines(polys).forEach(a => {
        const t = a * Math.PI / 180, d = [Math.cos(t), Math.sin(t)];
        let lo = -1e9, hi = 1e9;
        [[d[0], c[0], bx], [d[1], c[1], by]].forEach(z => { if (near0(z[0])) return; const t1 = (z[2][0] - z[1]) / z[0], t2 = (z[2][1] - z[1]) / z[0]; lo = Math.max(lo, Math.min(t1, t2)); hi = Math.min(hi, Math.max(t1, t2)); });
        out += '<path class="shp__sym" d="M' + pt(X([c[0] + d[0] * lo, c[1] + d[1] * lo])) + "L" + pt(X([c[0] + d[0] * hi, c[1] + d[1] * hi])) + '"/>';
      });
    }
    if (q) {
      const P = polys[0].map(X), side = i => [P[i], P[(i + 1) % 4]];
      if (o.diag) out += '<path class="shp__dg" d="M' + pt(P[0]) + "L" + pt(P[2]) + "M" + pt(P[1]) + "L" + pt(P[3]) + '"/>';
      const both = o.ticks && o.par;
      if (o.right) for (let i = 0; i < 4; i++) {
        if (!near0(dot(sub(polys[0][(i + 1) % 4], polys[0][i]), sub(polys[0][(i + 3) % 4], polys[0][i])))) continue;
        const e1 = unit(sub(P[(i + 1) % 4], P[i])), e2 = unit(sub(P[(i + 3) % 4], P[i])), k = 8;
        out += '<path class="shp__ra" d="M' + pt([P[i][0] + e1[0] * k, P[i][1] + e1[1] * k]) + "L" + pt([P[i][0] + (e1[0] + e2[0]) * k, P[i][1] + (e1[1] + e2[1]) * k]) + "L" + pt([P[i][0] + e2[0] * k, P[i][1] + e2[1] * k]) + '"/>';
      }
      if (o.ticks) q.groups.filter(g => g.length > 1).forEach((g, gi) => g.forEach(i => {
        const a = side(i), d = unit(sub(a[1], a[0])), n = [-d[1], d[0]], t = both && g.length < 4 && isPar(q, i) ? 0.34 : 0.5;
        const m = [a[0][0] + (a[1][0] - a[0][0]) * t, a[0][1] + (a[1][1] - a[0][1]) * t];
        (gi === 0 ? [0] : [-1.7, 1.7]).forEach(off => { const b = [m[0] + d[0] * off, m[1] + d[1] * off]; out += '<path class="shp__tick" d="M' + pt([b[0] - n[0] * 4.6, b[1] - n[1] * 4.6]) + "L" + pt([b[0] + n[0] * 4.6, b[1] + n[1] * 4.6]) + '"/>'; });
      }));
      if (o.par) {
        let pair = 0;
        [0, 1].forEach(i => {
          if (!isPar(q, i)) return;
          pair++;
          [i, i + 2].forEach(j => {
            const a = side(j), t = both && sideGroup(q, j) > 1 ? 0.66 : 0.5;
            let d = unit(sub(a[1], a[0]));
            if (d[0] < -EPS || (near0(d[0]) && d[1] > 0)) d = [-d[0], -d[1]];                 /* both arrows of a pair point the same way */
            const n = [-d[1], d[0]], m = [a[0][0] + (a[1][0] - a[0][0]) * t, a[0][1] + (a[1][1] - a[0][1]) * t];
            (pair === 1 ? [0] : [-2.6, 2.6]).forEach(off => {
              const tip = [m[0] + d[0] * (off + 3.2), m[1] + d[1] * (off + 3.2)];
              out += '<path class="shp__par" d="M' + pt([tip[0] - d[0] * 6 - n[0] * 4.4, tip[1] - d[1] * 6 - n[1] * 4.4]) + "L" + pt(tip) + "L" + pt([tip[0] - d[0] * 6 + n[0] * 4.4, tip[1] - d[1] * 6 + n[1] * 4.4]) + '"/>';
            });
          });
        });
      }
      if (o.lens) Object.keys(o.lens).forEach(k => {
        const a = side(+k), m = [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2], d = unit(sub(a[1], a[0]));
        let n = [-d[1], d[0]];
        if (dot(n, sub(m, C)) < 0) n = [-n[0], -n[1]];
        const anc = n[0] > 0.3 ? "start" : n[0] < -0.3 ? "end" : "middle", ox = anc === "middle" ? 0 : n[0] * 11;
        out += '<text class="shp__len" x="' + f2(m[0] + ox) + '" y="' + f2(m[1] + n[1] * 17 + 6) + '" text-anchor="' + anc + '">' + o.lens[k] + "</text>";
      });
    }
    if (o.centre) out += '<circle class="shp__c" cx="' + f2(C[0]) + '" cy="' + f2(C[1]) + '" r="2.4"/>';
    if (o.dot) { const p0 = X(polys[0][polys[0].length > 4 ? 0 : 1]), m = [p0[0] + (C[0] - p0[0]) * 0.2, p0[1] + (C[1] - p0[1]) * 0.2]; out += '<circle class="shp__dot" cx="' + f2(m[0]) + '" cy="' + f2(m[1]) + '" r="3.4"/>'; }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" class="shp__svg" viewBox="0 0 ' + f2(W) + " " + f2(H) + '" style="width:calc(' + f2(W) + ' * var(--shp-k, .055rem))" role="img" aria-label="' + (o.alt || "A shape") + '">' + out + "</svg>";
}
function isPar(q, i) { const P = q.pts, v = j => sub(P[(j + 1) % 4], P[j % 4]); return near0(cross(v(i % 4), v((i + 2) % 4))); }
function sideGroup(q, i) { return q.groups.find(g => g.indexOf(i % 4) >= 0).length; }

const G = MX.G7 = { SH: SH, QUADS: QUADS, NAMES: NAMES, DEF: DEF, ST: ST, of: of, quad: quad, order4: order4, is: is, tell: tell, fitsAfter: fitsAfter,
  rotOrder: rotOrder, symLines: symLines, svg: svg, say: id => of(id).say, polysOf: s => polysOf(shapeOf(s)) };

/* ---------- words shared by the models ---------- */
const MK = { ticks: true, par: true, right: true };
const fig = (id, o) => Object.assign({ k: "shape", id: id }, o || {});
const an = w => (/^[aeiou]/i.test(w) ? "an " : "a ") + w;
const list = a => (a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);
const KEY = { k: "shkey" };
/* why a name does not fit the shape (the name is false for it) */
function whyNot(name, p) {
  const t = name === "square" ? (p.eqAll ? "right" : "eq") : name === "rectangle" ? "right" : name === "rhombus" ? "eq" : name === "kite" ? "eq" : "par";
  return DEF[name] + " This shape has " + tell(t, p) + ".";
}
/* short sentences, one property each (a list with commas reads badly with "next to each other") */
const describe = p => ["par", "right", "eq"].map(a => "It has " + tell(a, p) + ".").join(" ");
const num = v => (/^\d+$/.test(String(v)) ? +v : NaN);
/* what went wrong with an order of rotational symmetry */
function rotSlip(p, typed) {
  const v = num(typed);
  if (isNaN(v)) return "Write a number.";
  if (v === 0) return "The order is never 0. Every shape fits at the end of a full turn. If it fits only then, the order is 1.";
  if (v === p.sym && p.sym !== p.rot) return "That is the number of lines of symmetry. Turn the shape: how many times does it fit in one full turn?";
  if (v === p.sides && p.sides === 4) return "It has 4 sides, but it does not fit after every quarter turn. Turn it slowly and look.";
  if (v > p.rot) return "Too many. Count only when the shape fits its outline exactly.";
  return "Count the end of the full turn too. The shape always fits when it is back at the start.";
}
const fitAngles = n => { const a = []; for (let k = 1; k <= n; k++) a.push(360 * k / n + "°"); return a; };
function rotWorked(p) {
  return p.rot === 1 ? "Turn the " + p.say + " about its centre. It fits its outline only at the end of the full turn (360°). That is 1 time: order 1. It has no rotational symmetry."
    : "Turn the " + p.say + " about its centre. It fits its outline after " + list(fitAngles(p.rot)) + ". That is " + p.rot + " times in one full turn: order " + p.rot + ".";
}

/* ---------- name the quadrilateral ---------- */
M.qname = function (d) {
  const p = of(d.id);
  if (!p.quad || !DEF[p.name]) throw new Error("qname: " + d.id + " has no special name");
  d.opts.forEach(n => { if (!DEF[n] || is(p, n)) throw new Error("qname: '" + n + "' is also true for " + d.id); });
  const opts = arrange([p.name].concat(d.opts).map((n, i) => ({ html: cap(n), ok: i === 0, why: i === 0 ? "" : whyNot(n, p) })), d.at);
  return {
    q: "What is the name of this [[quadrilateral]]?", sub: "Tick (✓) one box.", fig: fig(d.id, MK), opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " Look at the marks again." }; },
    hint: { pic: KEY, step: "Look at the marks. Which sides are [[parallel]]? Which sides are equal? Are there [[right angles|right angle]]?" },
    worked: { text: describe(p) + " So it is " + an(p.name) + ".", pic: fig(d.id, Object.assign({ cap: cap(p.name) }, MK)) },
    yes: describe(p) + " It is " + an(p.name) + ".", key: cap(p.name)
  };
};

/* the name from its properties. A clue is an aspect ('par', 'eq', 'right', 'sym', 'rot', 'deq', 'dperp', 'dbis': the
   sentence says what the shape has) or a statement key of ST ('noteq4'). Clues are read with the INCLUSIVE meaning:
   "2 pairs of equal sides opposite each other" is true of a square too. The clues must fit no shape of the table that
   is not the answer, and each wrong name must be ruled out by ONE clue (its feedback quotes that clue only). */
const CLUE_SAY = { noteq4: ["My 4 sides are not all the same length.", "Its 4 sides are not all the same length.", "4 sides that are not all the same length"] };
const ASPECTS = ["par", "eq", "right", "sym", "rot", "deq", "dperp", "dbis"];
function clueOf(c, p) {
  if (ASPECTS.indexOf(c) < 0) {
    if (!ST[c].test(p)) throw new Error("qclue: the clue " + c + " is not true of " + p.id);
    const w = CLUE_SAY[c] || ["I have " + ST[c].has + ".", "It has " + ST[c].has + ".", ST[c].has];
    return { a: ST[c].a, me: w[0], it: w[1], what: w[2], test: x => !!ST[c].test(x) };
  }
  const t = tell(c, p), incl = c === "eq" ? (p.eqAll ? (x => x.eqAll) : p.eqOpp ? (x => x.eqOpp) : p.eqAdj ? (x => x.eqAdj) : null) : null;
  return { a: c, me: "I have " + t + ".", it: "It has " + t + ".", what: t, test: incl || (x => tell(c, x) === t) };
}
/* what is true of EVERY shape with the name (a square is a rectangle, a rhombus and a kite), one sentence per aspect */
const FAM = {
  square: { par: "A square has 2 pairs of parallel sides.", right: "A square has 4 right angles.", eq: "A square has 4 equal sides.", sym: "A square has 4 lines of symmetry.",
    rot: "A square has rotational symmetry of order 4.", deq: "The diagonals of a square are equal.", dperp: "The diagonals of a square cross at right angles." },
  rectangle: { par: "A rectangle has 2 pairs of parallel sides.", right: "A rectangle has 4 right angles.", eq: "A rectangle has opposite sides of equal length.",
    sym: "A rectangle has 2 or 4 lines of symmetry.", deq: "The diagonals of a rectangle are equal." },
  rhombus: { par: "A rhombus has 2 pairs of parallel sides.", eq: "A rhombus has 4 equal sides.", sym: "A rhombus has 2 or 4 lines of symmetry.",
    dperp: "The diagonals of a rhombus cross at right angles." },
  parallelogram: { par: "A parallelogram has 2 pairs of parallel sides.", eq: "A parallelogram has opposite sides of equal length." },
  trapezium: { par: "A trapezium has exactly one pair of parallel sides.", rot: "A trapezium has no rotational symmetry." },
  kite: { par: "A kite never has exactly one pair of parallel sides.", eq: "A kite has 2 pairs of equal sides next to each other.", sym: "A kite always has a line of symmetry.",
    dperp: "The diagonals of a kite cross at right angles." }
};
M.qclue = function (d) {
  const p = of(d.id);
  if (!p.quad || !DEF[p.name]) throw new Error("qclue: " + d.id + " has no special name");
  const cs = d.clues.map(c => clueOf(c, p)), all = QUADS.map(of), fits = x => cs.every(c => c.test(x));
  all.filter(fits).forEach(x => { if (!is(x, p.name)) throw new Error("qclue: the clues also fit '" + x.id + "', which is not " + an(p.name)); });
  const why = n => {
    if (!DEF[n] || is(p, n)) throw new Error("qclue: '" + n + "' is also true for " + d.id);
    const fam = all.filter(x => is(x, n));
    if (!fam.length) throw new Error("qclue: no " + n + " in the table");
    const c = cs.find(c => fam.every(x => !c.test(x)));
    if (!c) throw new Error("qclue: no single clue rules out every " + n);
    const s = (FAM[n] || {})[c.a] || (/^no /.test(c.what) ? "" : cap(an(n)) + " never has " + c.what + ".");
    if (!s) throw new Error("qclue: no sentence for " + n + " / " + c.a);
    return s + " The shape in the clues has " + c.what + ".";
  };
  const opts = arrange([p.name].concat(d.opts).map((n, i) => ({ html: cap(n), ok: i === 0, why: i === 0 ? "" : why(n) })), d.at);
  const said = cs.map(c => c.it).join(" ") + " So it is " + an(p.name) + ".";
  return {
    q: "I am a [[quadrilateral]]. " + cs.map(c => c.me).join(" ") + " What am I?", sub: "Tick (✓) one box.", opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + " Read the clues again." }; },
    hint: { pic: d.opts.length ? { k: "shapes", letters: false, list: [p.name].concat(d.opts).sort().map(n => ({ id: QUADS.find(id => of(id).name === n), cap: cap(n) })), marks: MK } : null,
      step: "Take one clue at a time. Cross out every shape that does not fit it." },
    worked: { text: said, pic: fig(d.id, Object.assign({ cap: cap(p.name) }, MK)) },
    yes: said, key: cap(p.name)
  };
};

/* which sentence is true for this shape? */
M.qfact = function (d) {
  const p = of(d.id), ok = d.stmts.map(k => !!st(k).test(p));
  if (!ok[0] || ok.slice(1).some(Boolean)) throw new Error("qfact: the first sentence must be the only true one for " + d.id + " (" + ok.join(",") + ")");
  const marks = d.marks || (d.stmts.some(k => /^d/.test(k)) ? { diag: true, ticks: true, right: true } : d.stmts.some(k => /^(sym|rot)/.test(k)) ? { ticks: true, right: true } : MK);
  const opts = arrange(d.stmts.map((k, i) => ({ html: "It has " + ST[k].has + ".", ok: i === 0, why: i === 0 ? "" : "Look again. This " + p.say + " has " + tell(ST[k].a, p) + "." })), d.at);
  const a0 = ST[d.stmts[0]].a, symQ = d.stmts.some(k => /^sym/.test(k)), rotQ = d.stmts.some(k => /^rot/.test(k));
  return {
    q: "Look at this " + p.say + ". Which sentence is true?", sub: "Tick (✓) one box.", fig: fig(d.id, marks), opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why }; },
    hint: { pic: rotQ ? { k: "rot", id: d.id, turns: 0 } : symQ ? fig(d.id, { sym: true }) : KEY,
      step: rotQ ? "Turn the shape in your head. How many times does it fit in one full turn?" : symQ ? "A [[line of symmetry]] is a fold line. Both halves must match exactly." : /^d/.test(a0) ? "A [[diagonal]] joins two opposite corners. Look at the two dotted lines." : "Check each sentence with the marks on the shape." },
    worked: { text: "This " + p.say + " has " + list(d.stmts.map(k => ST[k].a).filter((a, i, arr) => arr.indexOf(a) === i).map(a => tell(a, p))) + ".", pic: fig(d.id, Object.assign({}, marks, symQ ? { sym: true } : {})) },
    yes: cap(an(p.say)) + " like this has " + tell(a0, p) + ".", key: "It has " + ST[d.stmts[0]].has + "."
  };
};

/* write the numbers */
const NUM = {
  par: { label: "Pairs of [[parallel]] sides", get: p => p.par, slip: (p, v) => (v === p.par * 2 || v === 4 ? "Count pairs, not sides. Two parallel sides make 1 pair." : "Parallel sides have the same arrow marks. Count the pairs.") },
  right: { label: "[[Right angles|right angle]]", get: p => p.right, slip: () => "A right angle has a small square in its corner. Count the small squares." },
  sym: { label: "[[Lines of symmetry|line of symmetry]]", get: p => p.sym, slip: (p, v) => (v === p.rot && p.rot !== p.sym ? "That is the order of rotational symmetry. A line of symmetry is a fold line." : v > p.sym ? "Too many. Fold along each line in your head. Do both halves match exactly?" : "Look for every fold line that makes two matching halves.") },
  rot: { label: "[[Order of rotational symmetry]]", get: p => p.rot, slip: (p, v) => rotSlip(p, v) }
};
M.qnum = function (d) {
  const p = of(d.id), ask = d.ask, want = ask.map(a => { if (!NUM[a] || (!p.quad && /par|right/.test(a))) throw new Error("qnum: cannot ask " + a + " of " + d.id); return NUM[a].get(p); });
  const symQ = ask.indexOf("sym") >= 0, rotQ = ask.indexOf("rot") >= 0;
  return {
    q: "Look at this " + p.say + ". Write the " + (ask.length > 1 ? "numbers" : "number") + ".", marks: ask.length, fig: fig(d.id, p.quad ? MK : {}),
    lines: ask.map((a, i) => NUM[a].label + ": {" + i + "}"), blanks: ask.map(() => ({ len: 1, w: "box" })),
    check(r) {
      const parts = want.map((w, i) => num(r.v[i]) === w);
      if (parts.every(Boolean)) return { ok: true, parts: parts };
      const i = parts.indexOf(false);
      return { ok: false, msg: NUM[ask[i]].slip(p, num(r.v[i])), parts: parts };
    },
    hint: { pic: rotQ ? { k: "rot", id: d.id, turns: 0 } : symQ ? fig(d.id, { sym: true }) : KEY,
      step: rotQ ? "Turn the shape about its centre. Count each time it fits in one full turn." : symQ ? "A line of symmetry is a fold line. Both halves must match exactly." : "Same arrows: parallel sides. A small square: a right angle." },
    worked: { text: "This " + p.say + " has " + list(ask.map(a => tell(a, p))) + ".", pic: fig(d.id, Object.assign({}, p.quad ? MK : {}, symQ ? { sym: true } : {})) },
    yes: "This " + p.say + " has " + list(ask.map(a => tell(a, p))) + ".", key: want.join(" ; "), fill: want.map(String)
  };
};

/* how many of these shapes ...? */
M.qcount = function (d) {
  const S = st(d.prop), ps = d.ids.map(of), ok = ps.map(p => !!S.test(p)), n = ok.filter(Boolean).length;
  const marks = d.marks || (/^(sym|rot)/.test(d.prop) ? {} : MK), yes = d.ids.map((x, i) => L6[i]).filter((x, i) => ok[i]);
  return {
    q: "How many of these shapes have " + S.has + "?", fig: { k: "shapes", list: d.ids.map(id => ({ id: id })), marks: marks },
    lines: ["{0}"], blanks: [{ len: 1, w: "box" }],
    check(r) {
      const v = num(r.v[0]);
      if (v === n) return { ok: true };
      const i = v > n ? ok.indexOf(false) : ok.indexOf(true);
      return { ok: false, msg: (v > n ? "Too many. " : "Look at every shape. ") + (i >= 0 ? "Shape " + L6[i] + " has " + tell(S.a, ps[i]) + "." : ""), parts: [false] };
    },
    hint: { pic: /^rot/.test(d.prop) ? null : /^sym/.test(d.prop) ? null : KEY, step: "Check the shapes one at a time: A, then B, then C." },
    worked: { text: d.ids.map((id, i) => "Shape " + L6[i] + " has " + tell(S.a, ps[i]) + (ok[i] ? " ✓" : "")).join(". ") + ". So the answer is " + n + (yes.length ? ": " + list(yes) : "") + "." },
    yes: n === 0 ? "None of them have " + S.has + "." : (n === 1 ? "Only shape " : "Shapes ") + list(yes) + (n === 1 ? " has " : " have ") + S.has + ".", key: String(n), fill: [String(n)]
  };
};

/* tap every shape that fits (tool shpick) */
M.spick = function (d) {
  const S = st(d.prop), ps = d.ids.map(of), ok = ps.map(p => !!S.test(p)), want = d.ids.map((x, i) => L6[i]).filter((x, i) => ok[i]).join("");
  if (!want.length || want.length === d.ids.length) throw new Error("spick: some shapes must fit and some must not");
  const marks = d.marks || (/^(sym|rot)/.test(d.prop) ? {} : /^d/.test(d.prop) ? { diag: true, ticks: true, right: true } : MK);
  return {
    q: "Tap every shape that has " + S.has + ".", how: "Tap a shape to choose it. Tap it again to let it go.",
    ui: { k: "shpick", ids: d.ids, marks: marks }, right: { sel: want },
    ready: r => !!r.sel,
    check(r) {
      const sel = String(r.sel || ""), bad = d.ids.map((x, i) => L6[i]).filter((x, i) => (sel.indexOf(x) >= 0) !== ok[i]);
      if (!bad.length) return { ok: true };
      const i = L6.indexOf(bad[0]);
      return { ok: false, msg: (ok[i] ? "You missed one. " : "One does not fit. ") + "Shape " + bad[0] + " has " + tell(S.a, ps[i]) + ".", parts: bad.filter(x => sel.indexOf(x) >= 0) };
    },
    given: r => String(r.sel || ""),
    hint: { pic: /^(sym|rot)/.test(d.prop) ? null : KEY, step: "Check the shapes one at a time. Does shape A have " + S.has + "?" },
    worked: { text: d.ids.map((id, i) => "Shape " + L6[i] + " has " + tell(S.a, ps[i]) + (ok[i] ? " ✓" : "")).join(". ") + "." },
    yes: (want.length === 1 ? "Only shape " : "Shapes ") + list(want.split("")) + (want.length === 1 ? " has " : " have ") + S.has + ".", key: list(want.split(""))
  };
};

/* which shape ...? the options are drawings. prop: one statement, or a list (the shape must have them all) */
M.swhich = function (d) {
  const Ss = [].concat(d.prop).map(st), ps = d.ids.map(of), ok = ps.map(p => Ss.every(S => S.test(p)));
  if (!ok[0] || ok.slice(1).some(Boolean)) throw new Error("swhich: the first shape must be the only one with " + d.prop + " (" + ok.join(",") + ")");
  const k0 = [].concat(d.prop).join(" "), has = list(Ss.map(S => S.has));
  const marks = d.marks || (/sym|rot/.test(k0) && !/par|eq|right|kite/.test(k0) ? {} : /\bd/.test(k0) ? { diag: true, ticks: true, right: true } : MK);
  const tells = p => list(Ss.map(S => tell(S.a, p)).filter((x, i, a) => a.indexOf(x) === i));
  const opts = arrange(d.ids.map((id, i) => ({ html: "", fig: fig(id, marks), ok: i === 0, p: ps[i] })), d.at);
  opts.forEach((o, i) => { o.alt = "Shape " + L6[i]; const fail = Ss.find(S => !S.test(o.p));
    o.why = o.ok ? "" : "Shape " + L6[i] + " has " + tell(fail.a, o.p) + (fail === ST.kitei ? ", so it is not a kite" : "") + "."; delete o.p; });
  const right = opts.findIndex(o => o.ok), pr = ps[0];
  return {
    q: d.text || "Which shape has " + has + "?", sub: "Tick (✓) one box.", letters: true, opts: opts,
    check(r) { const o = opts[r.pick]; return o.ok ? { ok: true } : { ok: false, msg: o.why + (d.text ? " Look for a shape with " + has + "." : "") }; },
    hint: { pic: /sym|rot/.test(k0) || marks.grid ? null : KEY,
      step: /rot/.test(k0) ? "Turn each shape in your head. Count how many times it fits in one full turn." : /sym/.test(k0) ? "Look for fold lines. Both halves must match exactly." : marks.grid ? "Count the steps between the dots. " + (/par/.test(k0) ? "Parallel sides go the same way on the dots: a flat side with a flat side, or the same slope, like 1 up for 2 across and 2 up for 4 across." : "Sides with the same steps across and the same steps up or down are equal.") : "Check the shapes one at a time with the marks." },
    worked: { text: (d.worked ? d.worked + " " : "") + "Shape " + L6[right] + " has " + tells(pr) + ". " + opts.map(o => (o.ok ? "" : o.why)).filter(Boolean).join(" "), pic: fig(d.ids[0], Object.assign({}, marks, /sym/.test(k0) ? { sym: true } : {}, { cap: "Shape " + L6[right] })) },
    yes: "Shape " + L6[right] + " has " + tells(pr) + ".", key: L6[right]
  };
};

/* ---------- the order of rotational symmetry ---------- */
M.rorder = function (d, mode) {
  const p = of(d.id), want = p.rot;
  if (want > 4) throw new Error("rorder: order " + want + " is beyond this stage");
  const base = {
    q: "What is the [[order of rotational symmetry]] of this " + p.say + "?",
    lines: ["Order {0}"], blanks: [{ len: 1, w: "box" }],
    check(r) { return num(r.v[0]) === want ? { ok: true } : { ok: false, msg: rotSlip(p, r.v[0]), parts: [false] }; },
    worked: { text: rotWorked(p), pic: d.tool ? null : { k: "rot", id: d.id } },
    yes: want === 1 ? "It fits only once in a full turn: order 1." : "It fits " + want + " times in one full turn: order " + want + ".",
    key: String(want), fill: [String(want)]
  };
  if (d.tool) return Object.assign(base, {
    how: mode === "our" ? "Let's do it together. Tap <b>Turn</b>. Each time, look: does the shape fit its outline? Count the fits in one full turn." : "Turn the shape all the way round. Count how many times it fits.",
    ui: { k: "rot", id: d.id },
    hint: { step: "Tap <b>Turn</b> until the shape is back at the start. Count the green ticks." }
  });
  return Object.assign(base, {
    fig: fig(d.id, p.quad ? { ticks: true, right: true, centre: true } : { centre: true }),
    hint: { pic: { k: "rot", id: d.id, turns: 0 }, step: "Turn the shape about its centre in your head. Count each time it fits its outline, and count the full turn too." }
  });
};

/* two steps: the order of each tile, then the sum of all the numbers */
M.rtiles = function (d) {
  const it = d.items.map(x => ({ p: of(x[0]), n: x[1], id: x[0] })), total = it.reduce((s, x) => s + x.n * x.p.rot, 0);
  const bySym = it.reduce((s, x) => s + x.n * x.p.sym, 0), once = it.reduce((s, x) => s + x.p.rot, 0), tiles = it.reduce((s, x) => s + x.n, 0);
  const he = d.he ? "he" : "she", work = it.map(x => x.n + " × " + x.p.rot + " = " + x.n * x.p.rot);
  return {
    q: d.who + " has " + list(it.map(x => "<b>" + x.n + "</b> " + x.p.say + (x.n === 1 ? " tile" : " tiles"))) + " like these. On every tile " + he + " writes its [[order of rotational symmetry]]. What is the sum of all the numbers " + he + " writes?",
    fig: { k: "shapes", letters: false, list: it.map(x => ({ id: x.id, cap: cap(x.p.say) })), marks: { ticks: true, right: true } },
    lines: ["{0}"], blanks: [{ len: 2, w: "big" }],
    check(r) {
      const v = num(r.v[0]);
      if (v === total) return { ok: true };
      const msg = v === bySym && bySym !== total ? "You used the lines of symmetry. Use the order of rotational symmetry: how many times each shape fits in a full turn."
        : v === once && once !== total ? "That is one tile of each kind. There are " + list(it.map(x => x.n + " " + x.p.say + (x.n === 1 ? " tile" : " tiles"))) + "."
        : v === tiles ? "That is the number of tiles. First write the order on each tile." : "First find the order of each shape. Then multiply by the number of tiles. Then add.";
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: it.map(x => ({ k: "rot", id: x.id, turns: 0 })), step: "First find the order of each shape. Then multiply by the number of tiles. Then add." },
    worked: { text: it.map(x => "The " + x.p.say + " has order " + x.p.rot + ".").join(" ") + " " + work.join(" and ") + ". " + (it.length > 1 ? it.map(x => x.n * x.p.rot).join(" + ") + " = " + total + "." : "") },
    yes: work.join(" and ") + (it.length > 1 ? ". " + it.map(x => x.n * x.p.rot).join(" + ") + " = " + total : "") + ".", key: String(total), fill: [String(total)]
  };
};

/* two steps: use the equal sides to find the sides with no length, then add */
M.qperim = function (d) {
  const p = of(d.id), gs = p.quad ? p.groups : null;
  if (!gs || gs.length !== d.len.length) throw new Error("qperim: " + d.id + " has " + (gs ? gs.length : 0) + " groups of equal sides, the data gives " + d.len.length + " lengths");
  const total = gs.reduce((s, g, i) => s + g.length * d.len[i], 0), shown = d.len.reduce((s, x) => s + x, 0), u = d.unit || "cm", lens = {};
  gs.forEach((g, i) => { lens[g[0]] = d.len[i] + " " + u; });
  const work = gs.map((g, i) => (g.length > 1 ? g.length + " × " + d.len[i] + " = " + g.length * d.len[i] : String(d.len[i])));
  const sum = gs.length > 1 ? gs.map((g, i) => g.length * d.len[i]).join(" + ") + " = " + total : "";
  return {
    q: d.text || "Work out the perimeter of this " + p.say + ".", fig: fig(d.id, { ticks: true, right: true, lens: lens }),
    lines: ["{0} " + u], blanks: [{ len: 3, w: "big" }],
    check(r) {
      const v = num(r.v[0]);
      if (v === total) return { ok: true };
      const msg = v === shown && shown !== total ? "You added only the lengths in the picture. This " + p.name + " has " + tell("eq", p) + ". Find the other sides first."
        : v * 2 === total ? "That is half way round. Add all 4 sides." : "Sides with the same marks are equal. Write the length of all 4 sides. Then add.";
      return { ok: false, msg: msg, parts: [false] };
    },
    hint: { pic: KEY, step: "This " + p.name + " has " + tell("eq", p) + ". Write the length on every side. Then add the 4 lengths." },
    worked: { text: "This " + p.name + " has " + tell("eq", p) + ". " + work.filter(w => /=/.test(w)).join(" and ") + (sum ? ". " + sum : "") + ". The answer is " + total + " " + u + "." },
    yes: (sum || work[0]) + " " + u + ".", key: String(total), fill: [String(total)]
  };
};

/* ---------- finish or draw a quadrilateral on the dot grid ---------- */
const parsePts = s => String(s || "").split(";").filter(Boolean).map(x => x.split(",").map(Number));
M.gdraw = function (d) {
  const given = d.given || [], need = d.need.map(st), edges = given.slice(1).map((p, i) => [given[i], p]);
  /* what is wrong with the 4 dots? '' when the drawing is right */
  function fault(added) {
    const all = given.concat(added);
    if (all.length !== 4) return "Your shape needs 4 corners.";
    const o = order4(all, edges);
    if (!o) return "Three of your corners are in one straight line. That does not make a quadrilateral. Move one corner.";
    if (!edges.every(e => o.some((p, i) => { const q = o[(i + 1) % 4]; return (samePt(p, e[0]) && samePt(q, e[1])) || (samePt(p, e[1]) && samePt(q, e[0])); }))) return "Keep the sides that are drawn. Try another dot.";
    const p = quad(o), miss = need.find(S => !S.test(p));
    return miss ? "Your shape has " + tell(miss.a, p) + ". It needs " + (miss.needs || miss.has) + "." : "";
  }
  if (!d.ex || fault(d.ex)) throw new Error("gdraw: the example drawing does not fit: " + fault(d.ex || []));
  const exO = order4(given.concat(d.ex), edges), exP = quad(exO), nm = d.shape || "quadrilateral", k = 4 - given.length;
  const what = list(need.map(S => S.has));
  const q = d.text || (given.length === 3 ? "Three corners of " + an(nm) + " are marked. Tap the dot for the fourth corner."
    : given.length === 2 ? "One side of " + an(nm) + " is drawn. Tap 2 more dots to finish it. It must have " + what + "."
    : "Draw a [[quadrilateral]] with " + what + ". Tap 4 dots for its corners.");
  return {
    q: q, how: "Tap a dot to make a corner. Tap it again to take it away.",
    ui: { k: "qgrid", cols: d.cols || 7, rows: d.rows || 6, given: given }, right: { pts: d.ex.map(p => p.join(",")).join(";") },
    ready: r => given.length + parsePts(r.pts).length === 4,
    check(r) { const f = fault(parsePts(r.pts)); return f ? { ok: false, msg: f } : { ok: true }; },
    given: r => String(r.pts || ""),
    hint: { pic: given.length === 3 && DEF[nm] ? fig(QUADS.find(id => of(id).name === nm), Object.assign({ cap: cap(nm) }, MK)) : null,
      step: (DEF[nm] ? DEF[nm] + " " : "") + (need.some(S => S.a === "par") ? "Parallel sides go the same way on the dots: a flat side with a flat side, or the same slope, like 1 up for 2 across and 2 up for 4 across." : need.some(S => S.a === "eq") ? "Sides with the same steps across and the same steps up or down are equal." : "Count the steps between the dots.") },
    worked: { text: "Here is one right answer. It has " + list(d.need.map(kk => tell(ST[kk].a, exP)).filter((x, i, a) => a.indexOf(x) === i)) + ".", pic: { k: "shape", pts: exO, ydown: true, grid: { cols: d.cols || 7, rows: d.rows || 6 } } },
    yes: "Yes! Your shape has " + what + ".", key: (DEF[nm] ? nm + ": " : "") + what + " (" + k + (k === 1 ? " dot" : " dots") + ")"
  };
};
})();

