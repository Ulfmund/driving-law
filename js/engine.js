/* Driving Law — scene engine.
   A scene is built once from a section's build(s) function, then rendered at any time t,
   so playback, pausing, and scrubbing all go through Scene.render(t). */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const W = 1600, H = 900, LANE = 64, FT = 5.33;

  const C = {
    grass: '#a9c98f', grassDark: '#93b878', road: '#55595f', shoulder: '#6a6e73',
    line: '#f3f3f0', yellow: '#f2c230', curb: '#c9c4ba', walk: '#dedad2',
    tie: '#6b4a32', rail: '#9aa1a8', ballast: '#8c857b',
    blue: '#2f6fd6', red: '#d0452f', gold: '#e3a72a', gray: '#7d8790', green: '#3f8f5c',
    white: '#f4f4f2', purple: '#8457c4', teal: '#2a9d9a', black: '#24272b', brown: '#8a5a3b',
    bad: '#d63a2f', good: '#1f9d55', info: '#26313d', warn: '#d88a0f',
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const EASE = {
    lin: u => u,
    in: u => u * u,
    out: u => 1 - (1 - u) * (1 - u),
    io: u => u * u * (3 - 2 * u),
  };
  const blink = (t, hz) => Math.floor(t * hz * 2) % 2 === 0;
  const fade = (t, t0, t1, f = 0.25) => {
    if (t < t0 || t > t1) return 0;
    return Math.min(1, (t - t0) / f, (t1 - t) / f);
  };

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function frag(markup, parent, attrs) {
    const g = el('g', attrs, parent);
    g.innerHTML = markup;
    return g;
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Seeded RNG so a section's scenery is the same every time it loads.
  function rng(seed) {
    let h = 2166136261;
    for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return () => {
      h = Math.imul(h ^ (h >>> 15), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }

  /* ---------------- Paths ---------------- */

  class Path {
    constructor(x, y, t = 0) {
      this.segs = [];
      this.sx = x; this.sy = y;
      this.cx = x; this.cy = y; this.ct = t;
      this.h0 = null;
    }
    face(deg) { this.h0 = deg; return this; }
    _add(seg, x, y) {
      seg.t0 = this.ct;
      seg.p0 = [this.cx, this.cy];
      this.segs.push(seg);
      this.cx = x; this.cy = y; this.ct = seg.t1;
      this._ready = false;
      return this;
    }
    to(x, y, t, ease = 'lin', rev = false) { return this._add({ type: 'L', t1: t, p1: [x, y], ease, rev }, x, y); }
    by(dx, dy, t, ease, rev) { return this.to(this.cx + dx, this.cy + dy, t, ease, rev); }
    curve(qx, qy, x, y, t, ease = 'lin', rev = false) {
      return this._add({ type: 'Q', t1: t, c: [qx, qy], p1: [x, y], ease, rev }, x, y);
    }
    wait(t) { return this._add({ type: 'H', t1: t }, this.cx, this.cy); }
    // Circular arc around (ox, oy) from angle a0 to a1 (degrees, screen coordinates), arriving at time t.
    // Split into ≤45° quadratic pieces; timing is shared in proportion to angle.
    arc(ox, oy, R, a0, a1, t) {
      const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 45));
      const t0 = this.ct, rad = Math.PI / 180;
      const p = a => [ox + R * Math.cos(a * rad), oy + R * Math.sin(a * rad)];
      if (Math.hypot(this.cx - p(a0)[0], this.cy - p(a0)[1]) > 1) this.to(...p(a0), t0 + 0.0001);
      for (let i = 1; i <= n; i++) {
        const aa = a0 + (a1 - a0) * (i - 1) / n, ab = a0 + (a1 - a0) * i / n, am = (aa + ab) / 2;
        const k = R / Math.cos((ab - aa) / 2 * rad);
        const c = [ox + k * Math.cos(am * rad), oy + k * Math.sin(am * rad)];
        this.curve(c[0], c[1], ...p(ab), t0 + (t - t0) * i / n);
      }
      return this;
    }

    static pos(s, u) {
      if (s.type === 'H') return s.p0;
      if (s.type === 'L') return [lerp(s.p0[0], s.p1[0], u), lerp(s.p0[1], s.p1[1], u)];
      const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      return [a * s.p0[0] + b * s.c[0] + c * s.p1[0], a * s.p0[1] + b * s.c[1] + c * s.p1[1]];
    }
    static tan(s, u) {
      let dx, dy;
      if (s.type === 'L') { dx = s.p1[0] - s.p0[0]; dy = s.p1[1] - s.p0[1]; }
      else {
        dx = 2 * (1 - u) * (s.c[0] - s.p0[0]) + 2 * u * (s.p1[0] - s.c[0]);
        dy = 2 * (1 - u) * (s.c[1] - s.p0[1]) + 2 * u * (s.p1[1] - s.c[1]);
      }
      if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return null;
      return Math.atan2(dy, dx) * 180 / Math.PI + (s.rev ? 180 : 0);
    }
    _prepare() {
      let last = this.h0;
      for (const s of this.segs) {
        if (s.type === 'H') continue;
        s.hs = Path.tan(s, 0); s.he = Path.tan(s, 1);
        if (s.hs == null) s.hs = last; if (s.he == null) s.he = s.hs;
        if (last == null) last = s.hs;
        last = s.he;
      }
      // Holds keep the heading of the move before them (or after, if they come first).
      let prev = this.h0;
      for (let i = 0; i < this.segs.length; i++) {
        const s = this.segs[i];
        if (s.type !== 'H') { prev = s.he; continue; }
        if (prev != null) { s.hh = prev; continue; }
        const next = this.segs.slice(i).find(q => q.type !== 'H');
        s.hh = next ? next.hs : 0;
      }
      if (this.h0 == null) {
        const first = this.segs.find(q => q.type !== 'H');
        this.h0 = first ? first.hs : 0;
      }
      this._ready = true;
    }
    at(t) {
      if (!this._ready) this._prepare();
      const segs = this.segs;
      if (!segs.length) return { x: this.sx, y: this.sy, h: this.h0 || 0, v: 0 };
      if (t <= segs[0].t0) {
        const s = segs[0];
        return { x: this.sx, y: this.sy, h: s.type === 'H' ? s.hh : s.hs, v: 0 };
      }
      for (const s of segs) {
        if (t < s.t1) {
          if (s.type === 'H') return { x: s.p0[0], y: s.p0[1], h: s.hh, v: 0 };
          const u = EASE[s.ease]((t - s.t0) / Math.max(1e-6, s.t1 - s.t0));
          const p = Path.pos(s, u);
          const h = Path.tan(s, u);
          return { x: p[0], y: p[1], h: h == null ? s.hs : h, v: 1 };
        }
      }
      const s = segs[segs.length - 1];
      return { x: this.cx, y: this.cy, h: s.type === 'H' ? s.hh : s.he, v: 0 };
    }
  }

  /* ---------------- Tracks (step and tweened values over time) ---------------- */

  class Tracks {
    constructor() { this.step = {}; this.tw = {}; }
    set(t, k, v) {
      (this.step[k] = this.step[k] || []).push([t, v]);
      this.step[k].sort((a, b) => a[0] - b[0]);
    }
    tween(k, keys) { this.tw[k] = keys.slice().sort((a, b) => a[0] - b[0]); }
    get(k, t, def) {
      const a = this.step[k];
      let v = def;
      if (!a) return v;
      for (const [tt, vv] of a) { if (tt <= t + 1e-9) v = vv; else break; }
      return v;
    }
    num(k, t, def) {
      const a = this.tw[k];
      if (!a) return def;
      if (t <= a[0][0]) return a[0][1];
      for (let i = 0; i < a.length - 1; i++) {
        if (t < a[i + 1][0]) {
          const u = EASE.io((t - a[i][0]) / (a[i + 1][0] - a[i][0]));
          return lerp(a[i][1], a[i + 1][1], u);
        }
      }
      return a[a.length - 1][1];
    }
  }

  /* ---------------- Vehicle drawings (top-down, facing +x, centered) ---------------- */

  const KIND = {
    car: { L: 64, W: 30 }, suv: { L: 70, W: 32 }, pickup: { L: 76, W: 32 }, van: { L: 72, W: 32 },
    police: { L: 66, W: 30 }, hearse: { L: 76, W: 30 }, truck: { L: 112, W: 38 }, semi: { L: 222, W: 40 },
    bus: { L: 150, W: 40 }, school: { L: 150, W: 40 }, ambulance: { L: 86, W: 36 }, fire: { L: 136, W: 40 },
    plow: { L: 118, W: 40 }, garbage: { L: 112, W: 40 }, utility: { L: 104, W: 38 }, tow: { L: 92, W: 34 },
    moto: { L: 38, W: 14 }, bike: { L: 30, W: 10 }, tractor: { L: 60, W: 42 }, lsv: { L: 46, W: 28 },
    trailer: { L: 132, W: 32 }, oversize: { L: 230, W: 64 }, lumber: { L: 76, W: 32 }, dump: { L: 112, W: 40 },
    train: { L: 640, W: 34 }, paver: { L: 70, W: 50 },
  };

  function lightsFor(L, Wd, extra = '') {
    const hx = L / 2 - 3, tx = -L / 2 - 1, hy = Wd / 2 - 7;
    return `
      <rect x="${hx - 1}" y="${-hy - 3}" width="4" height="6" rx="1.5" fill="#fff6c8" data-part="head"/>
      <rect x="${hx - 1}" y="${hy - 3}" width="4" height="6" rx="1.5" fill="#fff6c8" data-part="head"/>
      <rect x="${tx}" y="${-hy - 3}" width="4" height="6" rx="1" fill="#6e1111" data-part="tail"/>
      <rect x="${tx}" y="${hy - 3}" width="4" height="6" rx="1" fill="#6e1111" data-part="tail"/>
      <circle cx="${hx - 2}" cy="${-Wd / 2 + 1}" r="3.4" fill="#ffb21f" opacity="0" data-part="sigL"/>
      <circle cx="${tx + 3}" cy="${-Wd / 2 + 1}" r="3.4" fill="#ffb21f" opacity="0" data-part="sigL"/>
      <circle cx="${hx - 2}" cy="${Wd / 2 - 1}" r="3.4" fill="#ffb21f" opacity="0" data-part="sigR"/>
      <circle cx="${tx + 3}" cy="${Wd / 2 - 1}" r="3.4" fill="#ffb21f" opacity="0" data-part="sigR"/>
      ${extra}`;
  }
  function bar(x, y, len, a = '#e0262b', b = '#2453e0', w = 8) {
    return `<rect x="${x - 3}" y="${-len / 2}" width="${w}" height="${len}" rx="2" fill="#30343a"/>
      <rect x="${x - 2}" y="${-len / 2 + 1}" width="${w - 2}" height="${len / 2 - 1}" rx="1.5" fill="${a}" opacity=".35" data-part="barA"/>
      <rect x="${x - 2}" y="0" width="${w - 2}" height="${len / 2 - 1}" rx="1.5" fill="${b}" opacity=".35" data-part="barB"/>`;
  }
  function carBody(L, Wd, color, opt = {}) {
    const glass = '#22313f';
    return `
      <rect x="${-L / 2}" y="${-Wd / 2}" width="${L}" height="${Wd}" rx="${Math.min(9, Wd / 3)}" fill="${color}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
      <rect x="${L / 2 - 26}" y="${-Wd / 2 + 3}" width="13" height="${Wd - 6}" rx="4" fill="${glass}" opacity=".88"/>
      <rect x="${-L / 2 + 8}" y="${-Wd / 2 + 4}" width="9" height="${Wd - 8}" rx="3" fill="${glass}" opacity=".75"/>
      <rect x="${-L / 2 + 18}" y="${-Wd / 2 + 3}" width="${L - 45}" height="${Wd - 6}" rx="3" fill="#fff" opacity="${opt.roof ?? 0.13}"/>
      <rect x="${L / 2 - 24}" y="${-Wd / 2 - 3}" width="5" height="4" rx="1" fill="${color}" stroke="rgba(0,0,0,.3)"/>
      <rect x="${L / 2 - 24}" y="${Wd / 2 - 1}" width="5" height="4" rx="1" fill="${color}" stroke="rgba(0,0,0,.3)"/>`;
  }
  function cabBox(L, Wd, cab, cargo, cabLen = 30) {
    return `
      <rect x="${-L / 2}" y="${-Wd / 2}" width="${L - cabLen - 2}" height="${Wd}" rx="3" fill="${cargo}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
      <rect x="${L / 2 - cabLen}" y="${-Wd / 2 + 1}" width="${cabLen}" height="${Wd - 2}" rx="6" fill="${cab}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
      <rect x="${L / 2 - 11}" y="${-Wd / 2 + 4}" width="7" height="${Wd - 8}" rx="2" fill="#22313f" opacity=".85"/>`;
  }

  /* ---------------- Crash-diagram style ----------------
     Plan-view scenes can be drawn the way officers sketch a UD-10 crash diagram, using the
     symbols in Michigan's e-crash (iyeTek Crash Designer) Sketch palette: units as outlined
     boxes with a solid triangle pointing the direction of travel, numbered in order, a filled
     block for damage, a point-of-impact mark, and a debris symbol. CUR.diagram is on while a
     diagram-style scene is being built, so every drawing helper picks the right style. */

  const CUR = { diagram: false };
  const DIAG = {
    grass: '#ffffff', grassDark: '#f3f3f1', road: '#e6e6e3', shoulder: '#efefec', line: '#1b1b1b', yellow: '#1b1b1b',
    curb: '#8c8c8c', walk: '#f6f6f4', tie: '#444444', rail: '#111111', ballast: '#ffffff',
  };
  // Literal colors used by hand-drawn backgrounds in scene files, mapped to diagram equivalents.
  const DIAG_REMAP = {
    '#55595f': DIAG.road, '#8e9398': '#ececea', '#a9c98f': '#ffffff', '#93b878': '#f3f3f1', '#7a7f86': '#dedede',
    '#9a9590': '#ececea', '#bdb8ae': '#d6d6d4', '#d6d2c8': '#9a9a9a', '#f3f3f0': '#1b1b1b', '#f2c230': '#1b1b1b',
    '#7d8187': DIAG.road, '#5f6368': '#1b1b1b', '#4a90c2': '#d7e8f4', '#9aa1a8': '#6b6b6b', '#e9eef4': '#ffffff',
  };
  const INK = '#151515';
  const tint = (hex, amt = 0.8) => {
    const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#ffffff';
    const n = parseInt(m[1], 16), ch = s => Math.round(((n >> s) & 255) * (1 - amt) + 255 * amt);
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  };
  // Which legend entry a vehicle kind belongs to.
  const UNIT_CLASS = kind => ({
    truck: 'truck', semi: 'truck', dump: 'truck', garbage: 'truck', utility: 'truck', tow: 'truck', plow: 'truck', fire: 'truck', oversize: 'truck',
    bus: 'bus', school: 'bus', moto: 'moto', bike: 'bike', tractor: 'farm', paver: 'farm', train: 'train',
  }[kind] || 'auto');

  // Small icons for the on-screen legend (34×22 viewBox).
  const LEGEND = {
    auto: ['Motor vehicle (unit)', `<rect x="2" y="5" width="30" height="13" fill="#fff" stroke="${INK}" stroke-width="2"/><polygon points="29,11.5 21,7.5 21,15.5" fill="${INK}"/><text x="11" y="15" font-size="9" font-weight="800" text-anchor="middle" fill="${INK}">1</text>`],
    truck: ['Truck', `<rect x="1" y="5" width="32" height="13" fill="#fff" stroke="${INK}" stroke-width="2"/><line x1="24" y1="5" x2="24" y2="18" stroke="${INK}" stroke-width="2"/><polygon points="31,11.5 26,8 26,15" fill="${INK}"/>`],
    bus: ['Bus', `<rect x="1" y="5" width="32" height="13" fill="#fff" stroke="${INK}" stroke-width="2"/><text x="13" y="15" font-size="8" font-weight="800" text-anchor="middle" fill="${INK}">BUS</text><polygon points="31,11.5 25,8 25,15" fill="${INK}"/>`],
    moto: ['Motorcycle / moped', `<rect x="6" y="8" width="22" height="7" fill="#fff" stroke="${INK}" stroke-width="2"/><polygon points="27,11.5 21,9 21,14" fill="${INK}"/>`],
    bike: ['Bicycle', `<polygon points="28,11.5 8,4 8,19" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="14" cy="11.5" r="3" fill="none" stroke="${INK}" stroke-width="1.6"/>`],
    farm: ['Farm / road equipment', `<rect x="4" y="4" width="24" height="15" fill="#fff" stroke="${INK}" stroke-width="2"/><polygon points="10,15 14,7 18,15" fill="#ff7a00" stroke="${INK}"/>`],
    train: ['Train', `<line x1="1" y1="8" x2="33" y2="8" stroke="${INK}" stroke-width="2"/><line x1="1" y1="15" x2="33" y2="15" stroke="${INK}" stroke-width="2"/><rect x="6" y="5" width="22" height="13" fill="#fff" stroke="${INK}" stroke-width="2"/>`],
    ped: ['Person', `<circle cx="17" cy="11.5" r="6.5" fill="#fff" stroke="${INK}" stroke-width="2"/><line x1="17" y1="11.5" x2="25" y2="11.5" stroke="${INK}" stroke-width="2"/>`],
    poi: ['Point of impact', `<circle cx="17" cy="11.5" r="8" fill="#fff" stroke="#b3140c" stroke-width="2"/><path d="M 12 6.5 L 22 16.5 M 22 6.5 L 12 16.5" stroke="#b3140c" stroke-width="2.4"/>`],
    damage: ['Vehicle damage', `<rect x="2" y="5" width="30" height="13" fill="#fff" stroke="${INK}" stroke-width="2"/><rect x="24" y="5" width="8" height="13" fill="${INK}"/>`],
    debris: ['Debris', `<path d="M 9 8 L 14 4 L 18 9 L 24 6 L 27 12 L 22 18 L 15 15 L 9 18 L 7 13 Z" fill="${INK}"/>`],
  };

  function diagVehicle(kind, color, o) {
    const k = KIND[kind] || KIND.car;
    const L = k.L, Wd = k.W;
    const fill = tint(color, 0.82);
    const box = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${INK}" stroke-width="2.5"/>`;
    const tri = (L2, W2) => `<polygon points="${L2 / 2 - 4},0 ${L2 / 2 - 4 - Math.min(18, W2 * 0.6)},${-W2 * 0.3} ${L2 / 2 - 4 - Math.min(18, W2 * 0.6)},${W2 * 0.3}" fill="${INK}"/>`;
    const cab = (L2, W2, len) => `<line x1="${L2 / 2 - len}" y1="${-W2 / 2}" x2="${L2 / 2 - len}" y2="${W2 / 2}" stroke="${INK}" stroke-width="2"/>`;
    switch (kind) {
      case 'bike': return `<polygon points="${L / 2},0 ${-L / 2},${-Wd / 2 - 3} ${-L / 2},${Wd / 2 + 3}" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="-3" cy="0" r="3.5" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
      case 'moto': return box(-L / 2, -Wd / 2, L, Wd) + tri(L, Wd) +
        `<circle cx="-4" cy="0" r="5" fill="${o.helmet === false ? '#c48b5c' : INK}" data-part="helmet"/>` +
        (o.passenger ? `<circle cx="-13" cy="0" r="4" fill="${o.passengerHelmet === false ? '#c48b5c' : INK}"/>` : '') +
        `<circle cx="${L / 2 - 4}" cy="-6" r="2.5" fill="#ffb21f" opacity="0" data-part="sigL"/><circle cx="${L / 2 - 4}" cy="6" r="2.5" fill="#ffb21f" opacity="0" data-part="sigR"/>
         <rect x="${L / 2 - 2}" y="-2" width="3" height="4" fill="#fff6c8" data-part="head"/><rect x="${-L / 2 - 1}" y="-2" width="3" height="4" fill="#6e1111" data-part="tail"/>`;
      case 'train': {
        let s = `<line x1="${-L / 2 - 40}" y1="${-Wd / 2 - 4}" x2="${L / 2 + 40}" y2="${-Wd / 2 - 4}" stroke="${INK}" stroke-width="2"/><line x1="${-L / 2 - 40}" y1="${Wd / 2 + 4}" x2="${L / 2 + 40}" y2="${Wd / 2 + 4}" stroke="${INK}" stroke-width="2"/>`;
        s += box(L / 2 - 90, -Wd / 2, 90, Wd) + tri(L, Wd);
        for (let i = 0; i < 5; i++) s += box(L / 2 - 96 - (i + 1) * 106, -Wd / 2 + 1, 100, Wd - 2);
        return s;
      }
      case 'trailer': return `<g transform="translate(${L / 2 - 33},0)">${box(-32, -15, 64, 30)}${tri(64, 30)}${lightsFor(64, 30)}</g>` +
        box(-L / 2, -Wd / 2, L - 66, Wd) + `<line x1="${L / 2 - 84}" y1="0" x2="${L / 2 - 64}" y2="0" stroke="${INK}" stroke-width="3"/>
        <g data-part="chains"><path d="M ${L / 2 - 84} -9 L ${L / 2 - 64} -6 M ${L / 2 - 84} 9 L ${L / 2 - 64} 6" stroke="${INK}" stroke-width="1.6" stroke-dasharray="3 2"/></g>`;
      default: break;
    }
    let s = box(-L / 2, -Wd / 2, L, Wd) + tri(L, Wd);
    const big = ['truck', 'semi', 'dump', 'garbage', 'utility', 'tow', 'plow', 'fire', 'ambulance', 'bus', 'school'];
    if (kind === 'semi') s += cab(L, Wd, 48);
    else if (big.includes(kind)) s += cab(L, Wd, 30);
    if (kind === 'pickup' || kind === 'lumber') s += `<rect x="${-L / 2 + 4}" y="${-Wd / 2 + 5}" width="28" height="${Wd - 10}" fill="none" stroke="${INK}" stroke-width="1.4"/>`;
    if (kind === 'bus' || kind === 'school') s += `<text x="${-L / 2 + 8}" y="5" font-size="13" font-weight="800" fill="${INK}" font-family="system-ui,Segoe UI,Arial">${kind === 'school' ? 'SCHOOL BUS' : 'BUS'}</text>`;
    if (kind === 'plow') s += `<polygon points="${L / 2 - 4},${-Wd / 2 - 10} ${L / 2 + 6},${-Wd / 2 - 10} ${L / 2 + 12},${Wd / 2 + 8} ${L / 2 + 2},${Wd / 2 + 8}" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    if (kind === 'tractor' || kind === 'paver') s += `<polygon points="-30,8 -22,-8 -14,8" fill="#ff7a00" stroke="${INK}" stroke-width="1.5"/>`;
    if (kind === 'oversize') s += `<text x="-20" y="6" text-anchor="middle" font-size="14" font-weight="800" fill="${INK}" font-family="system-ui,Segoe UI,Arial">WIDE LOAD</text><rect x="${-L / 2 + 10}" y="${-Wd / 2 - 3}" width="14" height="10" fill="#e3261f"/><rect x="${-L / 2 + 10}" y="${Wd / 2 - 7}" width="14" height="10" fill="#e3261f"/>`;
    if (kind === 'lumber') s += `<g data-part="load"><rect x="${-L / 2 - 46}" y="-10" width="86" height="20" fill="#fff" stroke="${INK}" stroke-width="1.6"/><path d="M ${-L / 2 - 46} -3 h 86 M ${-L / 2 - 46} 3 h 86" stroke="${INK}" stroke-width="1"/>
      <rect x="${-L / 2 - 58}" y="-8" width="14" height="14" fill="#e3261f" data-part="flag"/><circle cx="${-L / 2 - 49}" cy="0" r="6" fill="#ff3b30" opacity="0" data-part="lantern"/></g>`;
    if (kind === 'police') s += bar(-4, 0, Wd - 6);
    if (kind === 'ambulance') s += bar(L / 2 - 34, 0, Wd - 8, '#e0262b', '#ffffff');
    if (kind === 'fire') s += bar(L / 2 - 30, 0, Wd - 8, '#ff2a2a', '#ffffff');
    if (['plow', 'garbage', 'utility', 'tow', 'paver', 'tractor'].includes(kind)) s += bar(kind === 'tractor' ? -2 : L / 2 - 36, 0, Math.min(14, Wd - 8), '#ffb000', '#ffb000', 6);
    if (kind === 'school') s += `<circle cx="${L / 2 - 3}" cy="${-Wd / 2 + 5}" r="4" fill="#ff2a1a" opacity=".15" data-part="sbA"/><circle cx="${L / 2 - 3}" cy="${Wd / 2 - 5}" r="4" fill="#ff2a1a" opacity=".15" data-part="sbB"/>
      <circle cx="${-L / 2 + 3}" cy="${-Wd / 2 + 5}" r="4" fill="#ff2a1a" opacity=".15" data-part="sbA"/><circle cx="${-L / 2 + 3}" cy="${Wd / 2 - 5}" r="4" fill="#ff2a1a" opacity=".15" data-part="sbB"/>
      <circle cx="${L / 2 - 9}" cy="${-Wd / 2 + 5}" r="3.2" fill="#ffb000" opacity=".15" data-part="sbY"/><circle cx="${L / 2 - 9}" cy="${Wd / 2 - 5}" r="3.2" fill="#ffb000" opacity=".15" data-part="sbY"/>
      <g data-part="arm" opacity="0"><rect x="${L / 2 - 34}" y="${-Wd / 2 - 18}" width="3" height="18" fill="#555"/><polygon points="${octagon(L / 2 - 32.5, -Wd / 2 - 26, 11)}" fill="#c8102e" stroke="#fff" stroke-width="1.5"/></g>`;
    return s + lightsFor(L, kind === 'oversize' ? 40 : Wd);
  }

  function diagPerson(kind, o) {
    const fill = { officer: '#1f2a44', worker: '#ff7b1a', flagger: '#ff7b1a', guard: '#c6e83a' }[kind] || '#ffffff';
    const s = (kind === 'child' ? 0.75 : 1) * (o.scale || 1.35);
    let extra = '';
    if (kind === 'guard') extra = `<g data-part="handSign"><polygon points="${octagon(14, 14, 8)}" fill="#c8102e" stroke="#fff" stroke-width="1.5"/></g>`;
    if (kind === 'flagger') extra = `<g data-part="paddleStop"><polygon points="${octagon(15, 16, 9)}" fill="#c8102e" stroke="#fff" stroke-width="1.5"/></g><g data-part="paddleSlow" opacity="0"><polygon points="15,7 24,16 15,25 6,16" fill="#ff8c1a" stroke="#222" stroke-width="1.2"/></g>`;
    return `<g transform="scale(${s})"><circle r="8" fill="${fill}" stroke="${INK}" stroke-width="2"/><line x1="8" y1="0" x2="14" y2="0" stroke="${INK}" stroke-width="2"/>${extra}</g>`;
  }

  function vehicleSVG(kind, color, o) {
    if (CUR.diagram) return diagVehicle(kind, color, o || {});
    const k = KIND[kind] || KIND.car;
    const L = k.L, Wd = k.W;
    switch (kind) {
      case 'pickup': return carBody(L, Wd, color, { roof: 0 }) +
        `<rect x="${-L / 2 + 3}" y="${-Wd / 2 + 4}" width="30" height="${Wd - 8}" rx="2" fill="rgba(0,0,0,.28)"/>` + lightsFor(L, Wd);
      case 'lumber': return carBody(L, Wd, color, { roof: 0 }) +
        `<rect x="${-L / 2 + 3}" y="${-Wd / 2 + 4}" width="30" height="${Wd - 8}" rx="2" fill="rgba(0,0,0,.28)"/>
         <g data-part="load"><rect x="${-L / 2 - 46}" y="-9" width="86" height="6" fill="#d8b47a" stroke="#9c7a45"/><rect x="${-L / 2 - 46}" y="-2" width="86" height="6" fill="#d8b47a" stroke="#9c7a45"/><rect x="${-L / 2 - 46}" y="5" width="86" height="6" fill="#d8b47a" stroke="#9c7a45"/>
         <rect x="${-L / 2 - 58}" y="-8" width="14" height="14" fill="#e3261f" data-part="flag"/><circle cx="${-L / 2 - 49}" cy="0" r="6" fill="#ff3b30" opacity="0" data-part="lantern"/></g>` + lightsFor(L, Wd);
      case 'police': return carBody(L, Wd, '#f4f4f2', { roof: 0 }) +
        `<rect x="${-L / 2}" y="${-Wd / 2}" width="${L * 0.36}" height="${Wd}" rx="8" fill="#1f2a44"/><rect x="${L / 2 - 14}" y="${-Wd / 2}" width="14" height="${Wd}" rx="8" fill="#1f2a44"/>` +
        bar(-4, 0, Wd - 6) + lightsFor(L, Wd);
      case 'hearse': return carBody(L, Wd, '#202226', { roof: 0.06 }) + lightsFor(L, Wd);
      case 'truck': return cabBox(L, Wd, color, '#e9e7e2') + lightsFor(L, Wd);
      case 'dump': return cabBox(L, Wd, color, '#8b8f94') + `<rect x="${-L / 2 + 6}" y="${-Wd / 2 + 5}" width="${L - 46}" height="${Wd - 10}" fill="#6f655a" data-part="cargo"/>` + lightsFor(L, Wd);
      case 'semi': return `
        <rect x="${-L / 2}" y="${-Wd / 2}" width="172" height="${Wd}" rx="2" fill="${o.trailer || '#e8e6e1'}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
        <rect x="${-L / 2 + 172 + 4}" y="${-Wd / 2 + 2}" width="${L - 176}" height="${Wd - 4}" rx="6" fill="${color}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
        <rect x="${L / 2 - 12}" y="${-Wd / 2 + 5}" width="7" height="${Wd - 10}" rx="2" fill="#22313f" opacity=".85"/>` + lightsFor(L, Wd);
      case 'bus': return `<rect x="${-L / 2}" y="${-Wd / 2}" width="${L}" height="${Wd}" rx="6" fill="${color}" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
        <rect x="${-L / 2 + 10}" y="${-Wd / 2 + 6}" width="${L - 30}" height="${Wd - 12}" rx="3" fill="#fff" opacity=".2"/>
        <rect x="${L / 2 - 12}" y="${-Wd / 2 + 4}" width="8" height="${Wd - 8}" rx="2" fill="#22313f" opacity=".85"/>` + lightsFor(L, Wd);
      case 'school': return `<rect x="${-L / 2}" y="${-Wd / 2}" width="${L}" height="${Wd}" rx="6" fill="#f5b400" stroke="rgba(0,0,0,.4)" stroke-width="1.2"/>
        <rect x="${-L / 2 + 6}" y="-2" width="${L - 26}" height="4" fill="#222"/>
        <rect x="${L / 2 - 12}" y="${-Wd / 2 + 4}" width="8" height="${Wd - 8}" rx="2" fill="#22313f" opacity=".85"/>
        <circle cx="${L / 2 - 3}" cy="${-Wd / 2 + 5}" r="4" fill="#ff2a1a" opacity=".15" data-part="sbA"/><circle cx="${L / 2 - 3}" cy="${Wd / 2 - 5}" r="4" fill="#ff2a1a" opacity=".15" data-part="sbB"/>
        <circle cx="${-L / 2 + 3}" cy="${-Wd / 2 + 5}" r="4" fill="#ff2a1a" opacity=".15" data-part="sbA"/><circle cx="${-L / 2 + 3}" cy="${Wd / 2 - 5}" r="4" fill="#ff2a1a" opacity=".15" data-part="sbB"/>
        <circle cx="${L / 2 - 9}" cy="${-Wd / 2 + 5}" r="3.2" fill="#ffb000" opacity=".15" data-part="sbY"/><circle cx="${L / 2 - 9}" cy="${Wd / 2 - 5}" r="3.2" fill="#ffb000" opacity=".15" data-part="sbY"/>
        <g data-part="arm" opacity="0"><rect x="${L / 2 - 34}" y="${-Wd / 2 - 18}" width="3" height="18" fill="#555"/><polygon points="${octagon(L / 2 - 32.5, -Wd / 2 - 26, 11)}" fill="#c8102e" stroke="#fff" stroke-width="1.5"/></g>` + lightsFor(L, Wd);
      case 'ambulance': return cabBox(L, Wd, '#f4f4f2', '#f4f4f2', 26) +
        `<rect x="${-L / 2}" y="-3" width="${L - 28}" height="6" fill="#d62828"/>` + bar(L / 2 - 34, 0, Wd - 8, '#e0262b', '#ffffff') + lightsFor(L, Wd);
      case 'fire': return cabBox(L, Wd, '#c81d25', '#c81d25', 34) +
        `<rect x="${-L / 2 + 8}" y="-5" width="${L - 52}" height="10" rx="2" fill="#d6d6d6"/><rect x="${-L / 2 + 8}" y="-1" width="${L - 52}" height="2" fill="#999"/>` + bar(L / 2 - 30, 0, Wd - 8, '#ff2a2a', '#ffffff') + lightsFor(L, Wd);
      case 'plow': return cabBox(L - 12, Wd, '#e46f12', '#e46f12', 30) +
        `<rect x="${-L / 2 + 6}" y="${-Wd / 2 + 5}" width="${L - 58}" height="${Wd - 10}" fill="#9a5a24"/>
         <polygon points="${L / 2 - 10},${-Wd / 2 - 12} ${L / 2 + 2},${-Wd / 2 - 12} ${L / 2 + 10},${Wd / 2 + 10} ${L / 2 - 2},${Wd / 2 + 10}" fill="#f1c40f" stroke="#7a6206"/>` +
        bar(L / 2 - 36, 0, Wd - 8, '#ffb000', '#ffb000') + lightsFor(L - 12, Wd);
      case 'garbage': return cabBox(L, Wd, '#2f7d4f', '#2f7d4f', 28) + `<rect x="${-L / 2 + 6}" y="${-Wd / 2 + 5}" width="${L - 44}" height="${Wd - 10}" rx="4" fill="#256b42"/>` + bar(L / 2 - 32, 0, Wd - 8, '#ffb000', '#ffb000') + lightsFor(L, Wd);
      case 'utility': return cabBox(L, Wd, '#f4f4f2', '#f4f4f2', 28) + `<rect x="${-L / 2 + 10}" y="-4" width="${L - 40}" height="8" fill="#e8a317"/><rect x="${-L / 2 + 4}" y="-9" width="16" height="18" rx="2" fill="#e8a317"/>` + bar(L / 2 - 32, 0, Wd - 8, '#ffb000', '#ffb000') + lightsFor(L, Wd);
      case 'tow': return cabBox(L, Wd, color, '#3b3f45', 30) + `<rect x="${-L / 2 - 6}" y="-3" width="40" height="6" fill="#222"/>` + bar(L / 2 - 34, 0, Wd - 8, '#ffb000', '#ffb000') + lightsFor(L, Wd);
      case 'paver': return `<rect x="${-L / 2}" y="${-Wd / 2}" width="${L}" height="${Wd}" rx="4" fill="#f1c40f" stroke="rgba(0,0,0,.4)"/><rect x="-10" y="-14" width="22" height="28" fill="#333"/>` + bar(-28, 0, Wd - 10, '#ffb000', '#ffb000');
      case 'moto': return `
        <rect x="${-L / 2}" y="-3" width="${L}" height="6" rx="3" fill="#2a2d33"/>
        <rect x="${-L / 2 + 6}" y="-5" width="${L - 14}" height="10" rx="4" fill="${color}"/>
        <rect x="${L / 2 - 12}" y="${-Wd / 2 - 3}" width="3" height="${Wd + 6}" rx="1" fill="#222"/>
        <ellipse cx="-2" cy="0" rx="7" ry="9" fill="#3a3f47"/>
        <circle cx="0" cy="0" r="6" fill="${o.helmet === false ? '#c48b5c' : '#111'}" data-part="helmet"/>
        ${o.passenger ? `<ellipse cx="-13" cy="0" rx="6" ry="8" fill="#5a4a6a"/><circle cx="-12" cy="0" r="5" fill="${o.passengerHelmet === false ? '#c48b5c' : '#222'}"/>` : ''}
        <rect x="${L / 2 - 2}" y="-2" width="3" height="4" fill="#fff6c8" data-part="head"/>
        <rect x="${-L / 2 - 1}" y="-2" width="3" height="4" fill="#6e1111" data-part="tail"/>
        <circle cx="${L / 2 - 4}" cy="-6" r="2.5" fill="#ffb21f" opacity="0" data-part="sigL"/><circle cx="${L / 2 - 4}" cy="6" r="2.5" fill="#ffb21f" opacity="0" data-part="sigR"/>`;
      case 'bike': return `
        <rect x="${-L / 2}" y="-2" width="${L}" height="4" rx="2" fill="#333"/>
        <rect x="${L / 2 - 8}" y="-8" width="2.5" height="16" fill="#333"/>
        <ellipse cx="-3" cy="0" rx="6" ry="9" fill="${color}"/><circle cx="-1" cy="0" r="5.5" fill="#f2c94c" stroke="#333" stroke-width="1"/>`;
      case 'tractor': return `
        <rect x="-30" y="-21" width="22" height="9" rx="2" fill="#222"/><rect x="-30" y="12" width="22" height="9" rx="2" fill="#222"/>
        <rect x="14" y="-16" width="13" height="6" rx="2" fill="#222"/><rect x="14" y="10" width="13" height="6" rx="2" fill="#222"/>
        <rect x="-26" y="-12" width="54" height="24" rx="4" fill="${color || '#3a8d3a'}" stroke="rgba(0,0,0,.4)"/>
        <rect x="-24" y="-11" width="20" height="22" rx="3" fill="#cfe6c8" opacity=".55"/>
        <polygon points="-36,-7 -36,7 -44,0" fill="#ff7a00" stroke="#c0392b" stroke-width="1.5"/>` + bar(-14, 0, 14, '#ffb000', '#ffb000', 6);
      case 'lsv': return carBody(L, Wd, color, { roof: 0.35 }) + lightsFor(L, Wd);
      case 'trailer': return `
        <rect x="${-L / 2}" y="${-Wd / 2}" width="${L - 66}" height="${Wd}" rx="3" fill="#cfcac0" stroke="rgba(0,0,0,.35)"/>
        <rect x="${L / 2 - 66 - 18}" y="-2" width="20" height="4" fill="#333"/>
        <g data-part="chains"><path d="M ${L / 2 - 84} -9 Q ${L / 2 - 76} -4 ${L / 2 - 64} -6" stroke="#bbb" stroke-width="2" fill="none" stroke-dasharray="3 2"/><path d="M ${L / 2 - 84} 9 Q ${L / 2 - 76} 4 ${L / 2 - 64} 6" stroke="#bbb" stroke-width="2" fill="none" stroke-dasharray="3 2"/></g>
        <g transform="translate(${L / 2 - 33},0)">${carBody(64, 30, color, { roof: 0 })}<rect x="-30" y="-11" width="28" height="22" rx="2" fill="rgba(0,0,0,.28)"/>${lightsFor(64, 30)}</g>`;
      case 'oversize': return `
        <rect x="${-L / 2}" y="-20" width="${L - 50}" height="40" rx="2" fill="#5b6067"/>
        <rect x="${-L / 2 + 10}" y="${-Wd / 2}" width="${L - 80}" height="${Wd}" rx="4" fill="#d9cdb5" stroke="#8a7a5a" stroke-width="2"/>
        <text x="${-L / 2 + 10 + (L - 80) / 2}" y="5" text-anchor="middle" font-size="13" font-weight="800" fill="#222">WIDE LOAD</text>
        <rect x="${L / 2 - 48}" y="-18" width="48" height="36" rx="6" fill="${color}" stroke="rgba(0,0,0,.35)"/>
        <rect x="${L / 2 - 12}" y="-13" width="7" height="26" rx="2" fill="#22313f"/>
        <rect x="${-L / 2 + 10}" y="${-Wd / 2 - 3}" width="14" height="10" fill="#e3261f"/><rect x="${-L / 2 + 10}" y="${Wd / 2 - 7}" width="14" height="10" fill="#e3261f"/>` + lightsFor(L, 40);
      case 'train': {
        let cars = `<rect x="${L / 2 - 90}" y="${-Wd / 2}" width="90" height="${Wd}" rx="8" fill="#1f3c88" stroke="#0c1a3d" stroke-width="2"/>
          <rect x="${L / 2 - 26}" y="${-Wd / 2 + 5}" width="16" height="${Wd - 10}" rx="3" fill="#cfe2ff" opacity=".8"/>
          <rect x="${L / 2 - 80}" y="-3" width="50" height="6" fill="#f2c230"/>`;
        for (let i = 0; i < 5; i++) {
          const x = L / 2 - 96 - (i + 1) * 106;
          cars += `<rect x="${x}" y="${-Wd / 2 + 1}" width="100" height="${Wd - 2}" rx="3" fill="${['#7a4b2a', '#556b2f', '#7a4b2a', '#6c757d', '#8b3a3a'][i]}" stroke="#2b2b2b" stroke-width="1.5"/>`;
        }
        return cars;
      }
      default: { // car, suv, van
        return carBody(L, Wd, color) + lightsFor(L, Wd);
      }
    }
  }
  function octagon(cx, cy, r) {
    const p = [];
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + i * Math.PI / 4;
      p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return p.join(' ');
  }

  function personSVG(kind, o) {
    if (CUR.diagram) return diagPerson(kind, o);
    const shirt = o.color || ({ ped: '#5b6fb5', worker: '#ff7b1a', officer: '#1f2a44', guard: '#c6e83a', flagger: '#ff7b1a', child: '#e05d8e', driver: '#5b6fb5' }[kind] || '#5b6fb5');
    const head = o.skin || '#e0b48c';
    const hat = kind === 'worker' || kind === 'flagger' ? '#ffd21a' : kind === 'officer' ? '#141c30' : null;
    const s = (kind === 'child' ? 0.75 : 1) * (o.scale || 1.35);
    let extra = '';
    if (kind === 'guard') extra = `<g data-part="handSign"><rect x="6" y="9" width="2.5" height="10" fill="#555"/><polygon points="${octagon(14, 18, 9)}" fill="#c8102e" stroke="#fff" stroke-width="1.5"/></g>`;
    if (kind === 'flagger') extra = `<g><rect x="6" y="9" width="2.5" height="12" fill="#555"/><g data-part="paddleStop"><polygon points="${octagon(14, 22, 10)}" fill="#c8102e" stroke="#fff" stroke-width="1.5"/></g><g data-part="paddleSlow" opacity="0"><polygon points="14,11 25,22 14,33 3,22" fill="#ff8c1a" stroke="#222" stroke-width="1.2"/></g></g>`;
    if (kind === 'officer') extra = `<rect x="-2" y="-12" width="6" height="3" fill="#d4af37" opacity=".9"/>`;
    return `<g transform="scale(${s})">
      <ellipse cx="-1" cy="0" rx="8" ry="12" fill="${shirt}" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
      ${kind === 'worker' || kind === 'flagger' || kind === 'guard' ? `<path d="M -6 -9 L 4 9 M -6 9 L 4 -9" stroke="#e8f542" stroke-width="2.2" opacity=".9"/>` : ''}
      <circle cx="1" cy="0" r="6.5" fill="${hat || head}" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
      ${hat ? `<circle cx="2" cy="0" r="3.5" fill="${head}" opacity=".0"/>` : ''}
      ${extra}</g>`;
  }

  /* ---------------- Signs (drawn upright, never rotated) ---------------- */

  function signSVG(type, txt) {
    const post = `<circle cx="0" cy="0" r="3" fill="#555"/>`;
    const T = (s, y, size = 11, fill = '#111', weight = 800) =>
      `<text x="0" y="${y}" text-anchor="middle" font-size="${size}" font-weight="${weight}" fill="${fill}" font-family="system-ui,Segoe UI,Arial">${esc(s)}</text>`;
    switch (type) {
      case 'stop': return `<g transform="translate(0,-26)"><polygon points="${octagon(0, 0, 20)}" fill="#c8102e" stroke="#fff" stroke-width="2.5"/>${T('STOP', 4.5, 11.5, '#fff')}</g>${post}`;
      case 'yield': return `<g transform="translate(0,-28)"><polygon points="-22,-14 22,-14 0,22" fill="#fff" stroke="#c8102e" stroke-width="6" stroke-linejoin="round"/>${T('YIELD', -3, 8.5, '#c8102e')}</g>${post}`;
      case 'speed': return `<g transform="translate(0,-34)"><rect x="-19" y="-24" width="38" height="48" rx="4" fill="#fff" stroke="#111" stroke-width="2"/>${T('SPEED', -12, 7.5)}${T('LIMIT', -3.5, 7.5)}${T(txt, 18, 19)}</g>${post}`;
      case 'school': return `<g transform="translate(0,-34)"><polygon points="0,-24 22,-6 22,22 -22,22 -22,-6" fill="#c7e830" stroke="#111" stroke-width="2"/>${T('SCHOOL', 4, 7.5)}${T(txt || '', 16, 9)}</g>${post}`;
      case 'nopass': return `<g transform="translate(0,-26)"><polygon points="-26,-16 -26,16 26,0" fill="#ffc20e" stroke="#111" stroke-width="2"/>${T('NO', -2, 7.5)}${T('PASSING', 7, 6)}${T('ZONE', 15, 6)}</g>${post}`;
      case 'oneway': return `<g transform="translate(0,-22)"><rect x="-28" y="-11" width="56" height="22" fill="#111"/><polygon points="${txt === 'L' ? '24,-6 -10,-6 -10,-9 -24,0 -10,9 -10,6 24,6' : '-24,-6 10,-6 10,-9 24,0 10,9 10,6 -24,6'}" fill="#fff"/>${T('ONE WAY', 3.5, 6.5, '#111')}</g>${post}`;
      case 'dne': return `<g transform="translate(0,-26)"><circle r="20" fill="#c8102e" stroke="#fff" stroke-width="2"/><rect x="-14" y="-3.5" width="28" height="7" fill="#fff"/>${T('DO NOT', -8, 6.5, '#fff')}${T('ENTER', 14, 6.5, '#fff')}</g>${post}`;
      case 'rr': return `<g transform="translate(0,-30)"><g transform="rotate(45)"><rect x="-26" y="-5" width="52" height="10" fill="#fff" stroke="#111" stroke-width="1.5"/></g><g transform="rotate(-45)"><rect x="-26" y="-5" width="52" height="10" fill="#fff" stroke="#111" stroke-width="1.5"/></g>${T('RAILROAD', -12, 5.5)}${T('CROSSING', 16, 5.5)}</g>${post}`;
      case 'work': return `<g transform="translate(0,-32)"><polygon points="0,-24 24,0 0,24 -24,0" fill="#ff8c1a" stroke="#111" stroke-width="2"/>${T(txt ? txt.split('|')[0] : 'ROAD', -2, 7.5)}${T(txt ? txt.split('|')[1] || '' : 'WORK', 8, 7.5)}</g>${post}`;
      case 'warn': return `<g transform="translate(0,-32)"><polygon points="0,-24 24,0 0,24 -24,0" fill="#ffc20e" stroke="#111" stroke-width="2"/>${T(txt ? txt.split('|')[0] : '', -2, 7)}${T(txt ? txt.split('|')[1] || '' : '', 8, 7)}</g>${post}`;
      case 'merge': return `<g transform="translate(0,-32)"><polygon points="0,-24 24,0 0,24 -24,0" fill="#ffc20e" stroke="#111" stroke-width="2"/><path d="M 0 16 L 0 -14 M 0 -14 L -5 -7 M 0 -14 L 5 -7 M -10 14 Q -9 2 -1 -3" stroke="#111" stroke-width="3" fill="none"/></g>${post}`;
      case 'noTurnRed': return `<g transform="translate(0,-32)"><rect x="-20" y="-24" width="40" height="48" rx="3" fill="#fff" stroke="#111" stroke-width="2"/>${T('NO', -10, 8.5)}${T('TURN', 0, 8.5)}${T('ON', 10, 8.5)}<circle cx="0" cy="18" r="5" fill="#e0262b"/></g>${post}`;
      case 'camera': return `<g transform="translate(0,-30)"><rect x="-30" y="-20" width="60" height="40" rx="3" fill="#fff" stroke="#111" stroke-width="2"/>${T('SPEED', -7, 8)}${T('CAMERA', 3, 8)}${T('IN USE', 13, 8)}</g>${post}`;
      case 'hov': return `<g transform="translate(0,-30)"><rect x="-26" y="-22" width="52" height="44" rx="3" fill="#fff" stroke="#111" stroke-width="2"/><polygon points="-20,-14 -12,-18 -4,-14 -12,-10" fill="none" stroke="#111" stroke-width="2"/>${T('HOV 2+', 2, 9)}${T(txt || '7-9 AM', 15, 7)}</g>${post}`;
      case 'bridge': return `<g transform="translate(0,-34)"><rect x="-26" y="-24" width="52" height="48" rx="3" fill="#fff" stroke="#111" stroke-width="2"/>${T('BRIDGE', -12, 7.5)}${T(txt ? txt.split('|')[0] : '', 2, 10)}${T(txt ? txt.split('|')[1] || '' : '', 16, 9)}</g>${post}`;
      case 'clear': return `<g transform="translate(0,-30)"><polygon points="0,-24 24,0 0,24 -24,0" fill="#ffc20e" stroke="#111" stroke-width="2"/>${T(txt || "13'-6\"", 4, 9)}</g>${post}`;
      case 'exit': return `<g transform="translate(0,-26)"><rect x="-30" y="-14" width="60" height="28" rx="4" fill="#0b6e3d" stroke="#fff" stroke-width="2"/>${T(txt || 'EXIT', 5, 10, '#fff')}</g>${post}`;
      case 'flagger': return `<g transform="translate(0,-32)"><polygon points="0,-24 24,0 0,24 -24,0" fill="#ff8c1a" stroke="#111" stroke-width="2"/>${T('FLAGGER', 3, 7)}</g>${post}`;
      case 'text': default: return `<g transform="translate(0,-24)"><rect x="${-Math.max(30, String(txt).length * 4.2)}" y="-14" width="${Math.max(60, String(txt).length * 8.4)}" height="28" rx="3" fill="#fff" stroke="#111" stroke-width="2"/>${T(txt, 4.5, 11)}</g>${post}`;
    }
  }

  /* ---------------- Props (static scenery and objects) ---------------- */

  function propSVG(type, o, r) {
    if (CUR.diagram) {
      // Plain outlines, the way a sketch shows landmarks.
      if (type === 'tree') return `<g transform="scale(${o.s || 1})"><circle r="20" fill="#fff" stroke="${INK}" stroke-width="2"/><circle r="5" fill="none" stroke="${INK}" stroke-width="1.5"/></g>`;
      if (type === 'house' || type === 'bldg') {
        const w = o.w || (type === 'house' ? 90 : 160), h = o.h || (type === 'house' ? 70 : 110);
        return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#fff" stroke="${INK}" stroke-width="2"/>` +
          (type === 'house' ? `<path d="M ${-w / 2} ${-h / 2} L ${-w / 2 + h / 2} 0 L ${w / 2 - h / 2} 0 L ${w / 2} ${-h / 2} M ${-w / 2} ${h / 2} L ${-w / 2 + h / 2} 0 M ${w / 2 - h / 2} 0 L ${w / 2} ${h / 2}" stroke="${INK}" stroke-width="1.2" fill="none"/>` : '') +
          (o.label ? `<text x="0" y="6" text-anchor="middle" font-size="18" font-weight="700" fill="${INK}" font-family="system-ui,Segoe UI,Arial">${esc(o.label)}</text>` : '');
      }
    }
    switch (type) {
      case 'tree': {
        const s = o.s || 1, c = o.c || ['#4f8a3c', '#5d9946', '#467d36'][Math.floor((r ? r() : 0.3) * 3)];
        return `<g transform="scale(${s})"><circle cx="4" cy="5" r="24" fill="rgba(0,0,0,.12)"/><circle r="22" fill="${c}"/><circle cx="-7" cy="-6" r="10" fill="#fff" opacity=".08"/></g>`;
      }
      case 'house': {
        const w = o.w || 90, h = o.h || 70, c = o.c || '#b55d4c';
        return `<rect x="${-w / 2 + 4}" y="${-h / 2 + 5}" width="${w}" height="${h}" fill="rgba(0,0,0,.14)"/>
          <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${c}" stroke="rgba(0,0,0,.3)"/>
          <polygon points="${-w / 2},${-h / 2} ${w / 2},${-h / 2} ${w / 2 - h / 2},0 ${-w / 2 + h / 2},0" fill="#fff" opacity=".12"/>
          <line x1="${-w / 2 + h / 2}" y1="0" x2="${w / 2 - h / 2}" y2="0" stroke="rgba(0,0,0,.3)" stroke-width="2"/>`;
      }
      case 'bldg': {
        const w = o.w || 160, h = o.h || 110, c = o.c || '#9aa3ad';
        return `<rect x="${-w / 2 + 5}" y="${-h / 2 + 6}" width="${w}" height="${h}" fill="rgba(0,0,0,.16)"/>
          <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${c}" stroke="rgba(0,0,0,.3)"/>
          <rect x="${-w / 2 + 10}" y="${-h / 2 + 10}" width="${w - 20}" height="${h - 20}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
          ${o.label ? `<text x="0" y="6" text-anchor="middle" font-size="18" font-weight="700" fill="rgba(255,255,255,.9)" font-family="system-ui,Segoe UI,Arial">${esc(o.label)}</text>` : ''}`;
      }
      case 'hydrant': return `<circle r="9" fill="#d62828" stroke="#7a0e0e" stroke-width="2"/><circle r="4" fill="#ffdd57"/>`;
      case 'cone': return `<rect x="-9" y="-9" width="18" height="18" rx="2" fill="#333" opacity=".6"/><circle r="8" fill="#ff7a00"/><circle r="4.5" fill="#fff"/><circle r="2.5" fill="#ff7a00"/>`;
      case 'barrel': return `<circle r="11" fill="#ff7a00" stroke="#fff" stroke-width="3"/><circle r="4" fill="#fff"/>`;
      case 'mailbox': return `<rect x="-3" y="-3" width="6" height="6" fill="#555"/><rect x="-10" y="-6" width="20" height="12" rx="5" fill="#3d4a5c"/>`;
      case 'hose': return `<path d="${o.d}" stroke="#d9c63a" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${o.d}" stroke="#a89420" stroke-width="2" fill="none" stroke-dasharray="6 6"/>`;
      case 'flare': return `<circle r="10" fill="#ff3b1f" opacity=".35"/><circle r="4" fill="#ffd27a"/>`;
      case 'scale': return `<rect x="${-(o.w || 260) / 2}" y="-34" width="${o.w || 260}" height="68" fill="#8d949b" stroke="#5c6268" stroke-width="3"/><path d="M ${-(o.w || 260) / 2 + 20} -34 v 68 M ${(o.w || 260) / 2 - 20} -34 v 68" stroke="#5c6268" stroke-width="3"/>`;
      case 'snowbank': return `<ellipse rx="${o.rx || 60}" ry="${o.ry || 22}" fill="#f4f7fb" stroke="#cdd6e0" stroke-width="2"/>`;
      case 'debris': return `<circle cx="-8" cy="3" r="5" fill="#7b6a58"/><circle cx="5" cy="-4" r="7" fill="#8e7b66"/><circle cx="10" cy="8" r="4" fill="#6a5a4a"/>`;
      case 'person-down': return `<ellipse rx="16" ry="7" fill="#5b6fb5" stroke="rgba(0,0,0,.35)"/><circle cx="18" cy="0" r="6" fill="#e0b48c"/>`;
      case 'ramp': return `<rect x="-20" y="-14" width="40" height="28" rx="3" fill="#2a6bd8" opacity=".85"/><text x="0" y="6" text-anchor="middle" font-size="16" fill="#fff" font-weight="700">♿</text>`;
      default: return '';
    }
  }

  /* ---------------- Actors ---------------- */

  class Actor {
    constructor(scene, o) {
      this.s = scene; this.o = o;
      this.kind = o.kind || 'car';
      this.tr = new Tracks();
      this.path = o.path || null;
      if (!this.path) {
        const a = o.at || [0, 0, 0];
        this.path = new Path(a[0], a[1]).face(a[2] || 0);
      }
      const layer = o.layer === 'under' ? scene.L.under : scene.L.actors;
      this.g = el('g', {}, layer);
      this.body = el('g', {}, this.g);
      this.isPerson = ['ped', 'worker', 'officer', 'guard', 'flagger', 'child', 'driver'].includes(this.kind);
      if (o.svg) frag(o.svg, this.body);
      else if (this.isPerson) frag(personSVG(this.kind, o), this.body);
      else frag(vehicleSVG(this.kind, o.color || C.gray, o), this.body);
      if (o.flag) {
        // Funeral flag: fluorescent orange with a black cross, on the front-left corner.
        const k = KIND[this.kind] || KIND.car;
        frag(`<line x1="${k.L / 2 - 14}" y1="${-k.W / 2}" x2="${k.L / 2 - 14}" y2="${-k.W / 2 - 14}" stroke="#333" stroke-width="2"/>
          <rect x="${k.L / 2 - 30}" y="${-k.W / 2 - 26}" width="16" height="14" fill="#ff6a00" stroke="#7a3300"/>
          <path d="M ${k.L / 2 - 22} ${-k.W / 2 - 24} v 10 M ${k.L / 2 - 27} ${-k.W / 2 - 20} h 10" stroke="#111" stroke-width="2"/>`, this.body);
      }
      if (o.hi) {
        const k = KIND[this.kind] || { L: 30, W: 30 };
        const ring = el('rect', { x: -k.L / 2 - 6, y: -k.W / 2 - 6, width: k.L + 12, height: k.W + 12, rx: 12, fill: 'none', stroke: scene.diagram ? '#2f6fd6' : '#ffffff', 'stroke-width': 3, opacity: 0.85 });
        this.body.insertBefore(ring, this.body.firstChild);
      }
      // In diagram style, vehicles are numbered units, as on a crash report.
      this.isVehicle = !this.isPerson && (o.svg ? /data-part="tail"/.test(o.svg) : true) && o.unit !== false;
      if (scene.diagram) {
        if (this.isPerson) scene.useLegend('ped');
        else if (this.isVehicle) {
          scene.useLegend(UNIT_CLASS(this.kind));
          if (this.kind !== 'train') this.unit = ++scene.units;
        }
      }
      this.parts = {};
      this.body.querySelectorAll('[data-part]').forEach(n => (this.parts[n.dataset.part] = this.parts[n.dataset.part] || []).push(n));
      // Unrotated decorations: label pill, sound waves.
      this.deco = el('g', {}, scene.L.labels);
      this.waves = el('g', { opacity: 0 }, this.deco);
      for (let i = 0; i < 3; i++) el('circle', { r: 20, fill: 'none', stroke: '#fff', 'stroke-width': 3 }, this.waves);
      this.labelG = el('g', {}, this.deco);
      this.labelRect = el('rect', { rx: 13, fill: 'rgba(20,26,34,.82)' }, this.labelG);
      this.labelText = el('text', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#fff', 'font-family': 'system-ui,Segoe UI,Arial' }, this.labelG);
      this._lastLabel = null;
      if (this.unit) {
        // Sit the number clear of the direction triangle: toward the rear on cars, just behind the cab on long units.
        const k = KIND[this.kind] || KIND.car;
        this.unitOff = k.L >= 100 && !o.svg ? k.L / 2 - (this.kind === 'semi' ? 64 : 44) : -k.L * 0.12;
        const n = this.unitText = el('text', { x: 0, y: 7, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 900, fill: INK, stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke', 'font-family': 'system-ui,Segoe UI,Arial' }, this.deco);
        n.textContent = this.unit;
      }
      // Night glow (beams + lamps) lives above the night overlay.
      this.glow = el('g', {}, scene.L.glow);
      const k = KIND[this.kind] || { L: 30, W: 20 };
      if (!this.isPerson && !o.svg && this.kind !== 'bike' && this.kind !== 'train') {
        const L = k.L, Wd = k.W;
        this.beamLow = el('polygon', { points: `${L / 2},${-Wd / 2 + 2} ${L / 2 + 230},${-Wd / 2 - 40} ${L / 2 + 230},${Wd / 2 + 40} ${L / 2},${Wd / 2 - 2}`, fill: 'url(#beam)', opacity: 0 }, this.glow);
        this.beamHigh = el('polygon', { points: `${L / 2},${-Wd / 2 + 2} ${L / 2 + 470},${-Wd / 2 - 110} ${L / 2 + 470},${Wd / 2 + 110} ${L / 2},${Wd / 2 - 2}`, fill: 'url(#beam)', opacity: 0 }, this.glow);
        this.tailGlow = el('g', { opacity: 0 }, this.glow);
        el('circle', { cx: -L / 2, cy: -Wd / 2 + 5, r: 9, fill: 'url(#redglow)' }, this.tailGlow);
        el('circle', { cx: -L / 2, cy: Wd / 2 - 5, r: 9, fill: 'url(#redglow)' }, this.tailGlow);
      }
      this.barGlow = el('circle', { r: 46, fill: 'url(#redglow)', opacity: 0 }, this.glow);
      this.barGlow2 = el('circle', { r: 46, fill: 'url(#blueglow)', opacity: 0 }, this.glow);
      if (o.label) this.set(0, 'label', o.label);
      if (o.lights) this.set(0, 'lights', o.lights);
      if (o.head) this.set(0, 'head', o.head);
      // from/until: hidden outside this time window (for actors that enter the scene on screen).
      if (o.from != null) this.set(0, 'show', false).set(o.from, 'show', true);
      if (o.until != null) this.set(o.until, 'show', false);
    }
    set(t, k, v) { this.tr.set(t, k, v); return this; }
    tween(k, keys) { this.tr.tween(k, keys); return this; }
    // Distance from the actor's center to the top of whatever sits above it (label pill or body).
    labelTop(t) {
      const k = KIND[this.kind] || { L: 30, W: 30 };
      const half = this.isPerson ? 18 : Math.max(k.W, 20) / 2;
      const has = this.tr.get('label', t, null) != null || this.tr.get('mph', t, null) != null;
      if (!has || this.o.labelBelow) return half;
      return (this.isPerson ? 30 : Math.max(k.W, 34) / 2 + 28) + (this.o.labelDy || 0) + 17;
    }
    mph(keys) { keys.forEach(([t, v]) => this.set(t, 'mph', v)); return this; }
    at(t) { return this.path.at(t); }

    render(t) {
      const p = this.path.at(t);
      const tr = this.tr;
      const show = tr.get('show', t, true);
      const op = tr.num('opacity', t, 1);
      this.g.setAttribute('transform', `translate(${p.x.toFixed(2)},${p.y.toFixed(2)})`);
      this.g.setAttribute('opacity', show ? op : 0);
      this.body.setAttribute('transform', `rotate(${p.h.toFixed(2)})`);
      this.glow.setAttribute('transform', `translate(${p.x.toFixed(2)},${p.y.toFixed(2)}) rotate(${p.h.toFixed(2)})`);
      this.glow.setAttribute('opacity', show ? op : 0);
      this.deco.setAttribute('transform', `translate(${p.x.toFixed(2)},${p.y.toFixed(2)})`);
      this.deco.setAttribute('opacity', show ? op : 0);

      const P = this.parts;
      const brake = tr.get('brake', t, false);
      const night = this.s.nightAt(t) > 0.3;
      const head = tr.get('head', t, night ? 'low' : 'off');
      (P.tail || []).forEach(n => n.setAttribute('fill', brake ? '#ff2b2b' : (head !== 'off' ? '#b51c1c' : '#6e1111')));
      (P.head || []).forEach(n => n.setAttribute('fill', head !== 'off' ? '#ffffff' : '#fff6c8'));
      const sig = tr.get('sig', t, null);
      const on = blink(t, 1.4);
      (P.sigL || []).forEach(n => n.setAttribute('opacity', (sig === 'L' || sig === 'H') && on ? 1 : 0));
      (P.sigR || []).forEach(n => n.setAttribute('opacity', (sig === 'R' || sig === 'H') && on ? 1 : 0));

      const lights = tr.get('lights', t, null);
      const fast = blink(t, 2.6);
      if (P.barA) {
        const a = lights ? (fast ? 1 : 0.25) : 0.35, b = lights ? (fast ? 0.25 : 1) : 0.35;
        P.barA.forEach(n => n.setAttribute('opacity', a));
        P.barB.forEach(n => n.setAttribute('opacity', b));
      }
      const glowCol = { police: ['#ff2a2a', '#2a5bff'], fire: ['#ff2a2a', '#ff2a2a'], amber: ['#ffb000', '#ffb000'], ambulance: ['#ff2a2a', '#ffffff'] }[lights];
      if (glowCol) {
        this.barGlow.setAttribute('fill', glowCol[0] === '#ffb000' ? 'url(#amberglow)' : 'url(#redglow)');
        this.barGlow.setAttribute('opacity', fast ? 0.75 : 0.15);
        this.barGlow2.setAttribute('fill', glowCol[1] === '#2a5bff' ? 'url(#blueglow)' : glowCol[1] === '#ffb000' ? 'url(#amberglow)' : 'url(#whiteglow)');
        this.barGlow2.setAttribute('opacity', fast ? 0.15 : 0.75);
      } else { this.barGlow.setAttribute('opacity', 0); this.barGlow2.setAttribute('opacity', 0); }

      if (P.sbA) { // school bus lights: 'red' flashing pair, 'amber' pre-warning
        const sb = tr.get('bus', t, null);
        const r = sb === 'red', y = sb === 'amber';
        P.sbA.forEach(n => n.setAttribute('opacity', r ? (fast ? 1 : 0.15) : 0.15));
        P.sbB.forEach(n => n.setAttribute('opacity', r ? (fast ? 0.15 : 1) : 0.15));
        P.sbY.forEach(n => n.setAttribute('opacity', y ? (fast ? 1 : 0.2) : 0.15));
        P.arm.forEach(n => n.setAttribute('opacity', r ? 1 : 0));
        if (r) { this.barGlow.setAttribute('fill', 'url(#redglow)'); this.barGlow.setAttribute('opacity', fast ? 0.6 : 0.2); }
      }
      if (P.handSign) P.handSign.forEach(n => n.setAttribute('opacity', tr.get('sign', t, true) ? 1 : 0));
      if (P.paddleStop) {
        const pd = tr.get('paddle', t, 'stop');
        P.paddleStop.forEach(n => n.setAttribute('opacity', pd === 'stop' ? 1 : 0));
        P.paddleSlow.forEach(n => n.setAttribute('opacity', pd === 'slow' ? 1 : 0));
      }
      if (P.lantern) P.lantern.forEach(n => n.setAttribute('opacity', tr.get('lantern', t, false) ? (on ? 1 : 0.7) : 0));
      if (P.flag) P.flag.forEach(n => n.setAttribute('opacity', tr.get('flag', t, true) ? 1 : 0));
      if (P.load) P.load.forEach(n => n.setAttribute('opacity', tr.get('load', t, true) ? 1 : 0));
      if (P.chains) P.chains.forEach(n => n.setAttribute('opacity', tr.get('chains', t, true) ? 1 : 0));
      if (this.damage) for (const d of this.damage) d.n.setAttribute('opacity', t >= d.t ? 1 : 0);
      if (this.unitText) {
        const r = p.h * Math.PI / 180;
        this.unitText.setAttribute('x', (Math.cos(r) * this.unitOff).toFixed(1));
        this.unitText.setAttribute('y', (Math.sin(r) * this.unitOff + 7).toFixed(1));
      }

      if (this.beamLow) {
        const n = this.s.nightAt(t);
        this.beamLow.setAttribute('opacity', head === 'low' ? 0.55 * n + 0.05 : 0);
        this.beamHigh.setAttribute('opacity', head === 'high' ? 0.7 * n + 0.05 : 0);
        this.tailGlow.setAttribute('opacity', (head !== 'off' ? 0.7 : 0) * n + (brake ? 0.9 : 0));
      }

      const waves = tr.get('waves', t, null);
      if (waves) {
        this.waves.setAttribute('opacity', 1);
        const col = waves === 'siren' ? '#ffffff' : waves === 'horn' ? '#ffe680' : waves;
        [...this.waves.children].forEach((c, i) => {
          const ph = ((t * 1.2 + i / 3) % 1);
          c.setAttribute('r', 30 + ph * 110);
          c.setAttribute('opacity', (1 - ph) * 0.8);
          c.setAttribute('stroke', col);
        });
      } else this.waves.setAttribute('opacity', 0);

      let label = tr.get('label', t, null);
      const mph = tr.get('mph', t, null);
      if (mph != null) label = (label ? label + ' · ' : '') + mph + ' mph';
      if (label !== this._lastLabel) {
        this._lastLabel = label;
        this.labelText.textContent = label || '';
        const w = label ? label.length * 11.8 + 26 : 0;
        const k = KIND[this.kind] || { L: 30, W: 30 };
        let off = (this.isPerson ? 30 : Math.max(k.W, 34) / 2 + 28) + (this.o.labelDy || 0);
        if (this.o.labelBelow) off = -off + 4;
        this.labelRect.setAttribute('x', -w / 2); this.labelRect.setAttribute('y', -off - 17);
        this.labelRect.setAttribute('width', w); this.labelRect.setAttribute('height', 30);
        this.labelText.setAttribute('x', 0); this.labelText.setAttribute('y', -off + 5);
        this.labelG.setAttribute('opacity', label ? 1 : 0);
      }
      const lc = tr.get('labelColor', t, null);
      this.labelRect.setAttribute('fill', lc === 'bad' ? 'rgba(214,58,47,.92)' : lc === 'good' ? 'rgba(31,157,85,.92)' : lc === 'warn' ? 'rgba(216,138,15,.94)' : 'rgba(20,26,34,.82)');
    }
  }

  /* ---------------- Scene ---------------- */

  class Scene {
    // opts.mode: 'diagram' draws plan-view scenes as a crash-report diagram; anything else is the illustrated style.
    constructor(svg, def, opts = {}) {
      this.svg = svg; this.def = def;
      this.wantDiagram = opts.mode === 'diagram';
      this.diagram = false; this.units = 0; this.legend = [];
      svg.innerHTML = '';
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      this.rand = rng(def.sec);
      this.defs = el('defs', {}, svg);
      this.defs.innerHTML = `
        <linearGradient id="beam" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff7c2" stop-opacity=".95"/><stop offset="1" stop-color="#fff7c2" stop-opacity="0"/></linearGradient>
        <radialGradient id="redglow"><stop offset="0" stop-color="#ff3030" stop-opacity=".95"/><stop offset="1" stop-color="#ff3030" stop-opacity="0"/></radialGradient>
        <radialGradient id="blueglow"><stop offset="0" stop-color="#3a66ff" stop-opacity=".95"/><stop offset="1" stop-color="#3a66ff" stop-opacity="0"/></radialGradient>
        <radialGradient id="amberglow"><stop offset="0" stop-color="#ffb000" stop-opacity=".95"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient>
        <radialGradient id="whiteglow"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#bcdcf3"/><stop offset="1" stop-color="#eaf4fb"/></linearGradient>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="rgba(255,255,255,.0)"/><rect width="6" height="14" fill="rgba(255,255,255,.55)"/></pattern>`;
      this.L = {};
      for (const n of ['bg', 'marks', 'zones', 'under', 'actors', 'night', 'glow', 'labels', 'fx']) this.L[n] = el('g', {}, svg);
      this.nightRect = el('rect', { x: -2000, y: -2000, width: W + 4000, height: H + 4000, fill: '#0b1530', opacity: 0 }, this.L.night);
      this.actors = []; this.fx = []; this.says = []; this.dyn = [];
      this.tr = new Tracks();
      this.dur = def.dur || 12;
      this.lanes = {};
      const saved = { ...C };
      try {
        def.build(this.api());
      } finally {
        Object.assign(C, saved);
        CUR.diagram = false;
      }
      this.says.sort((a, b) => a.t - b.t);
      if (this.diagram) this.finishDiagram();
    }
    useLegend(key) { if (LEGEND[key] && !this.legend.includes(key)) this.legend.push(key); }
    legendItems() { return this.legend.map(k => ({ key: k, label: LEGEND[k][0], icon: LEGEND[k][1] })); }

    finishDiagram() {
      // Recolor hand-drawn background pieces from scene files to the diagram palette.
      for (const layer of [this.L.bg, this.L.marks]) {
        layer.querySelectorAll('[fill],[stroke]').forEach(n => {
          for (const a of ['fill', 'stroke']) {
            const v = (n.getAttribute(a) || '').toLowerCase();
            if (DIAG_REMAP[v]) n.setAttribute(a, DIAG_REMAP[v]);
          }
        });
        // White lettering painted on pavement or lots would vanish on the light diagram ground.
        layer.querySelectorAll('text').forEach(n => {
          if (/^(#fff|#ffffff|white)$/i.test(n.getAttribute('fill') || '')) n.setAttribute('fill', INK);
        });
      }
      // Damage: a filled block on each unit at the spot nearest each point of impact.
      for (const b of this.fx.filter(f => f instanceof Boom)) {
        for (const a of this.actors) {
          if (!a.isVehicle || a.kind === 'train') continue;
          const k = KIND[a.kind] || KIND.car, p = a.at(b.t);
          const r = -p.h * Math.PI / 180, dx = b.x - p.x, dy = b.y - p.y;
          const lx = dx * Math.cos(r) - dy * Math.sin(r), ly = dx * Math.sin(r) + dy * Math.cos(r);
          const hx = k.L / 2, hy = k.W / 2;
          if (Math.abs(lx) > hx + 26 || Math.abs(ly) > hy + 26) continue;
          const s = Math.min(14, k.W * 0.45);
          let cx = clamp(lx, -hx + s / 2, hx - s / 2), cy = clamp(ly, -hy + s / 2, hy - s / 2);
          // Push the block against whichever edge faces the impact.
          if (hx - Math.abs(lx) < hy - Math.abs(ly)) cx = Math.sign(lx || 1) * (hx - s / 2);
          else cy = Math.sign(ly || 1) * (hy - s / 2);
          const n = el('rect', { x: cx - s / 2, y: cy - s / 2, width: s, height: s, fill: INK, opacity: 0 }, a.body);
          (a.damage = a.damage || []).push({ t: b.t, n });
          this.useLegend('damage');
        }
        this.useLegend('poi'); this.useLegend('debris');
      }
    }
    nightAt(t) { return this.tr.num('night', t, 0); }

    api() {
      const s = this;
      const api = {
        W, H, LANE, FT, C, rand: s.rand,
        P: (x, y, t) => new Path(x, y, t),
        bg: (type, o = {}) => {
          // Only plan-view (top-down map) scenes become diagrams; side views, interiors, and the dash stay illustrated.
          const map = ['road', 'cross', 'rail', 'freeway'].includes(type) || !!o.map;
          if (s.wantDiagram && map) {
            s.diagram = CUR.diagram = true;
            Object.assign(C, DIAG);
            if (type === 'blank') o = { ...o, fill: DIAG.grass };
          } else if (!s.diagram) CUR.diagram = false;
          BG[type](s, o || {});
          // Map scenes are framed a little tighter than the full world so vehicles read at projector size.
          const z = { road: 1150, rail: 1150, cross: 1250, freeway: 1320 }[type];
          if (z && !s.viewKeys) s.viewKeys = [[0, o.vx || 800, o.vy || 450, o.zoom || z]];
          return api;
        },
        car: o => { const a = new Actor(s, o); s.actors.push(a); return a; },
        person: o => { const a = new Actor(s, o); s.actors.push(a); return a; },
        thing: o => { const a = new Actor(s, o); s.actors.push(a); return a; },
        sign: (x, y, type, txt, o = {}) => {
          const g = frag(signSVG(type, txt), o.layer === 'actors' ? s.L.actors : s.L.labels, { transform: `translate(${x},${y}) scale(${o.scale || 1.25})` });
          if (o.t0 != null || o.t1 != null) s.dyn.push({ g, t0: o.t0 ?? -1, t1: o.t1 ?? 1e9 });
          return g;
        },
        prop: (x, y, type, o = {}) => {
          const g = frag(propSVG(type, o, s.rand), s.L[o.layer || (o.top ? 'actors' : 'marks')], { transform: `translate(${x},${y}) rotate(${o.rot || 0})` });
          if (o.t0 != null || o.t1 != null) s.dyn.push({ g, t0: o.t0 ?? -1, t1: o.t1 ?? 1e9 });
          return g;
        },
        raw: (markup, o = {}) => {
          const g = frag(markup, s.L[o.layer || 'marks']);
          if (o.t0 != null || o.t1 != null) s.dyn.push({ g, t0: o.t0 ?? -1, t1: o.t1 ?? 1e9, fade: o.fade });
          return g;
        },
        light: (x, y, keys, o = {}) => { s.fx.push(new Signal(s, x, y, keys, o)); return api; },
        gate: (x, y, keys, o = {}) => { s.fx.push(new Gate(s, x, y, keys, o)); return api; },
        say: (t, text, kind = 'info') => { s.says.push({ t, text, kind }); return api; },
        note: (t0, t1, x, y, text, kind = 'info', o = {}) => { s.fx.push(new Note(s, t0, t1, x, y, text, kind, o)); return api; },
        dim: (t0, t1, x1, y1, x2, y2, text, o = {}) => { s.fx.push(new Dim(s, t0, t1, x1, y1, x2, y2, text, o)); return api; },
        mark: (t0, t1, x, y, type = 'x', o = {}) => { s.fx.push(new Mark(s, t0, t1, x, y, type, o)); return api; },
        zone: (t0, t1, shape, color = C.bad, label, o = {}) => { s.fx.push(new Zone(s, t0, t1, shape, color, label, o)); return api; },
        boom: (t, x, y, o = {}) => { s.fx.push(new Boom(s, t, x, y, o)); return api; },
        trail: (t0, t1, d, color = '#ffffff', o = {}) => { s.fx.push(new Trail(s, t0, t1, d, color, o)); return api; },
        text: (t0, t1, x, y, str, o = {}) => { s.fx.push(new Label(s, t0, t1, x, y, str, o)); return api; },
        night: keys => { s.tr.tween('night', typeof keys === 'number' ? [[0, keys]] : keys); return api; },
        view: keys => { s.viewKeys = keys; return api; },
        lane: s.lanes,
        stopAt: (dir, kind = 'car') => s.lanes.stopAt(dir, kind),
      };
      return api;
    }

    render(t) {
      for (const a of this.actors) a.render(t);
      for (const f of this.fx) f.render(t);
      for (const d of this.dyn) {
        const vis = t >= d.t0 && t <= d.t1;
        d.g.setAttribute('opacity', vis ? (d.fade ? fade(t, d.t0, d.t1, d.fade) : 1) : 0);
      }
      this.nightRect.setAttribute('opacity', this.nightAt(t) * (this.diagram ? 0.5 : 0.72));
      if (this.bgTick) this.bgTick(t);
      if (this.viewKeys) {
        const k = this.viewKeys;
        let v = k[0].slice(1);
        if (t >= k[k.length - 1][0]) v = k[k.length - 1].slice(1);
        else for (let i = 0; i < k.length - 1; i++) {
          if (t >= k[i][0] && t < k[i + 1][0]) {
            const u = EASE.io((t - k[i][0]) / (k[i + 1][0] - k[i][0]));
            v = [0, 1, 2].map(j => lerp(k[i][j + 1], k[i + 1][j + 1], u));
          }
        }
        const [x, y, w] = v;
        this.svg.setAttribute('viewBox', `${(x - w / 2).toFixed(1)} ${(y - w * H / W / 2).toFixed(1)} ${w.toFixed(1)} ${(w * H / W).toFixed(1)}`);
      }
    }
    caption(t) {
      let c = null;
      for (const s of this.says) if (s.t <= t + 1e-6) c = s;
      return c;
    }
  }

  /* ---------------- FX objects ---------------- */

  const KC = k => ({ bad: C.bad, good: C.good, warn: C.warn, info: C.info }[k] || k || C.info);

  class Note {
    constructor(s, t0, t1, x, y, text, kind, o) {
      Object.assign(this, { s, t0, t1, x, y, kind, o });
      this.lines = String(text).split('\n');
      this.g = el('g', { opacity: 0 }, s.L.fx);
      this.line = el('line', { stroke: KC(kind), 'stroke-width': 3 }, this.g);
      this.dot = el('circle', { r: 6, fill: KC(kind), stroke: '#fff', 'stroke-width': 2 }, this.g);
      const fs = o.size || 22;
      const w = Math.max(...this.lines.map(l => l.length)) * fs * 0.53 + 30;
      const h = this.lines.length * (fs + 6) + 16;
      this.w = w; this.h = h;
      this.box = el('g', {}, this.g);
      el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: KC(kind), stroke: '#fff', 'stroke-width': 2.5 }, this.box);
      this.lines.forEach((l, i) => {
        const tx = el('text', { x: 0, y: -h / 2 + 8 + (i + 0.78) * (fs + 6), 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: '#fff', 'font-family': 'system-ui,Segoe UI,Arial' }, this.box);
        tx.textContent = l;
      });
    }
    render(t) {
      const a = fade(t, this.t0, this.t1);
      this.g.setAttribute('opacity', a);
      if (!a) return;
      let x = this.x, y = this.y, dy = this.o.dy ?? -90;
      if (this.o.follow) {
        const f = this.o.follow, p = f.at(t);
        x = p.x; y = p.y;
        // Keep the note clear of the actor's own label pill.
        if (!this.o.dx) dy = Math.min(dy, -(f.labelTop(t) + 10 + this.h / 2));
      }
      const bx = x + (this.o.dx ?? 0), by = y + dy;
      this.box.setAttribute('transform', `translate(${bx},${by})`);
      const showPtr = this.o.ptr !== false;
      this.line.setAttribute('x1', x); this.line.setAttribute('y1', y);
      this.line.setAttribute('x2', bx); this.line.setAttribute('y2', by);
      this.line.setAttribute('opacity', showPtr ? 1 : 0);
      this.dot.setAttribute('cx', x); this.dot.setAttribute('cy', y);
      this.dot.setAttribute('opacity', showPtr ? 1 : 0);
    }
  }

  class Dim {
    constructor(s, t0, t1, x1, y1, x2, y2, text, o) {
      Object.assign(this, { s, t0, t1, x1, y1, x2, y2, o });
      const col = o.color || '#ffffff';
      this.g = el('g', { opacity: 0 }, s.L.fx);
      const ang = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(ang) * 10, ny = Math.cos(ang) * 10;
      el('line', { x1, y1, x2, y2, stroke: '#000', 'stroke-opacity': 0.35, 'stroke-width': 7 }, this.g);
      el('line', { x1, y1, x2, y2, stroke: col, 'stroke-width': 3, 'stroke-dasharray': o.dash ? '10 7' : '' }, this.g);
      for (const [x, y] of [[x1, y1], [x2, y2]]) el('line', { x1: x - nx, y1: y - ny, x2: x + nx, y2: y + ny, stroke: col, 'stroke-width': 3 }, this.g);
      if (text) {
        const mx = (x1 + x2) / 2 + (o.lx || 0), my = (y1 + y2) / 2 + (o.ly ?? -18);
        const w = text.length * 11 + 22;
        el('rect', { x: mx - w / 2, y: my - 16, width: w, height: 30, rx: 8, fill: o.bg || 'rgba(20,26,34,.88)' }, this.g);
        el('text', { x: mx, y: my + 6, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: '#fff', 'font-family': 'system-ui,Segoe UI,Arial' }, this.g).textContent = text;
      }
    }
    render(t) { this.g.setAttribute('opacity', fade(t, this.t0, this.t1)); }
  }

  class Mark {
    constructor(s, t0, t1, x, y, type, o) {
      Object.assign(this, { s, t0, t1, x, y, o });
      const r = o.r || 34;
      this.g = el('g', { opacity: 0 }, s.L.fx);
      this.inner = el('g', {}, this.g);
      el('circle', { r, fill: type === 'x' ? C.bad : C.good, stroke: '#fff', 'stroke-width': 4 }, this.inner);
      el('path', { d: type === 'x' ? `M ${-r * .4} ${-r * .4} L ${r * .4} ${r * .4} M ${r * .4} ${-r * .4} L ${-r * .4} ${r * .4}` : `M ${-r * .45} 0 L ${-r * .12} ${r * .35} L ${r * .5} ${-r * .38}`, stroke: '#fff', 'stroke-width': r * 0.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, this.inner);
    }
    render(t) {
      const a = fade(t, this.t0, this.t1);
      this.g.setAttribute('opacity', a);
      let x = this.x, y = this.y;
      if (this.o.follow) {
        const f = this.o.follow, p = f.at(t);
        let dy = this.o.dy || 0;
        if (!this.o.dx && dy < 0) dy = Math.min(dy, -(f.labelTop(t) + 8 + (this.o.r || 34)));
        x = p.x + (this.o.dx || 0); y = p.y + dy;
      }
      const pop = clamp((t - this.t0) / 0.25, 0, 1);
      const sc = 0.6 + 0.4 * EASE.out(pop) + (pop < 1 ? 0.15 * Math.sin(pop * Math.PI) : 0);
      this.g.setAttribute('transform', `translate(${x},${y}) scale(${sc.toFixed(3)})`);
    }
  }

  class Zone {
    constructor(s, t0, t1, shape, color, label, o) {
      Object.assign(this, { s, t0, t1, o });
      this.g = el('g', { opacity: 0 }, s.L.zones);
      const st = { fill: color, 'fill-opacity': o.fo ?? 0.28, stroke: color, 'stroke-width': 3, 'stroke-dasharray': o.dash === false ? '' : '12 8' };
      let lx, ly;
      if (shape.rect) { const [x, y, w, h] = shape.rect; el('rect', { x, y, width: w, height: h, rx: 6, ...st }, this.g); lx = x + w / 2; ly = y + h / 2; }
      else if (shape.circle) { const [cx, cy, r] = shape.circle; el('circle', { cx, cy, r, ...st }, this.g); lx = cx; ly = cy; }
      else if (shape.poly) { el('polygon', { points: shape.poly.map(p => p.join(',')).join(' '), ...st }, this.g); lx = shape.poly.reduce((a, p) => a + p[0], 0) / shape.poly.length; ly = shape.poly.reduce((a, p) => a + p[1], 0) / shape.poly.length; }
      if (label) {
        const tg = el('g', {}, s.L.fx);
        this.lg = tg;
        const x = lx + (o.lx || 0), y = ly + (o.ly || 0);
        const w = label.length * 10.5 + 20;
        el('rect', { x: x - w / 2, y: y - 15, width: w, height: 28, rx: 7, fill: color, opacity: 0.92 }, tg);
        el('text', { x, y: y + 5.5, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#fff', 'font-family': 'system-ui,Segoe UI,Arial' }, tg).textContent = label;
      }
    }
    render(t) {
      const a = fade(t, this.t0, this.t1);
      this.g.setAttribute('opacity', a);
      if (this.lg) this.lg.setAttribute('opacity', a);
    }
  }

  class Boom {
    constructor(s, t, x, y, o) {
      Object.assign(this, { s, t, x, y, o });
      this.g = el('g', { opacity: 0 }, s.L.fx);
      if (s.diagram) {
        // Point of impact (circled X) with debris scattered just past it. Both stay for the rest of the scene.
        const R = '#b3140c';
        this.g.innerHTML = `<path d="M 26 18 L 33 13 L 38 19 L 45 16 L 48 23 L 42 30 L 34 27 L 28 31 L 25 25 Z" fill="${INK}" opacity=".85"/>
          <circle cx="18" cy="34" r="3.5" fill="${INK}"/><circle cx="40" cy="4" r="3" fill="${INK}"/>
          <circle r="11" fill="#fff" fill-opacity=".85" stroke="${R}" stroke-width="3"/><path d="M -6.5 -6.5 L 6.5 6.5 M 6.5 -6.5 L -6.5 6.5" stroke="${R}" stroke-width="3.2" stroke-linecap="round"/>`;
        this.persist = true;
        return;
      }
      const pts = [];
      for (let i = 0; i < 16; i++) { const r = i % 2 ? 22 : 48, a = i * Math.PI / 8; pts.push((r * Math.cos(a)).toFixed(1) + ',' + (r * Math.sin(a)).toFixed(1)); }
      el('polygon', { points: pts.join(' '), fill: '#ffd23f', stroke: '#e8591a', 'stroke-width': 4 }, this.g);
      el('text', { x: 0, y: 7, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 900, fill: '#b5321a', 'font-family': 'system-ui,Segoe UI,Arial' }, this.g).textContent = o.text || 'CRASH';
    }
    render(t) {
      const d = t - this.t;
      if (this.persist) {
        if (d < 0) { this.g.setAttribute('opacity', 0); return; }
        const sc = d < 0.3 ? 1.6 - d * 2 : 1;
        this.g.setAttribute('opacity', 1);
        this.g.setAttribute('transform', `translate(${this.x},${this.y}) scale(${sc.toFixed(3)})`);
        return;
      }
      const hold = this.o.hold ?? 1.2;
      if (d < 0 || d > hold + 0.4) { this.g.setAttribute('opacity', 0); return; }
      const sc = d < 0.2 ? d / 0.2 * 1.15 : 1;
      this.g.setAttribute('opacity', d > hold ? 1 - (d - hold) / 0.4 : 1);
      this.g.setAttribute('transform', `translate(${this.x},${this.y}) scale(${sc.toFixed(3)})`);
    }
  }

  class Trail {
    constructor(s, t0, t1, d, color, o) {
      Object.assign(this, { s, t0, t1, o });
      this.g = el('g', { opacity: 0 }, s.L.zones);
      el('path', { d, stroke: color, 'stroke-width': o.w || 5, fill: 'none', 'stroke-dasharray': o.dash || '14 10', 'stroke-linecap': 'round', opacity: 0.9 }, this.g);
      if (o.arrow !== false) {
        // Arrowhead at the end of the path.
        const p = el('path', { d, fill: 'none' }, this.g);
        const len = p.getTotalLength ? p.getTotalLength() : 0;
        if (len) {
          const a = p.getPointAtLength(len), b = p.getPointAtLength(Math.max(0, len - 12));
          const ang = Math.atan2(a.y - b.y, a.x - b.x) * 180 / Math.PI;
          el('polygon', { points: '0,0 -18,-10 -18,10', fill: color, transform: `translate(${a.x},${a.y}) rotate(${ang})` }, this.g);
        }
      }
    }
    render(t) { this.g.setAttribute('opacity', fade(t, this.t0, this.t1)); }
  }

  class Label {
    constructor(s, t0, t1, x, y, str, o) {
      Object.assign(this, { s, t0, t1, o });
      this.g = el('g', { opacity: 0, transform: `translate(${x},${y}) rotate(${o.rot || 0})` }, s.L[o.layer || 'fx']);
      const tx = el('text', { x: 0, y: 0, 'text-anchor': o.anchor || 'middle', 'font-size': o.size || 26, 'font-weight': o.weight || 800, fill: o.color || '#fff', 'font-family': 'system-ui,Segoe UI,Arial', 'letter-spacing': o.ls || 0, stroke: o.stroke || 'none', 'stroke-width': o.sw || 0, 'paint-order': 'stroke' }, this.g);
      tx.textContent = str;
    }
    render(t) { this.g.setAttribute('opacity', fade(t, this.t0, this.t1) * (this.o.op ?? 1)); }
  }

  class Signal {
    // keys: [[t, state]], state in R Y G FR FY off, or arrow forms: 'R+GL' (red ball + green left arrow), 'GL', 'YL'
    constructor(s, x, y, keys, o) {
      Object.assign(this, { s, keys, o });
      this.g = el('g', { transform: `translate(${x},${y}) scale(${o.scale || 1.15})` }, s.L.labels);
      const n = o.arrow ? 4 : 3;
      const vert = o.dir !== 'h';
      const w = vert ? 30 : n * 26 + 6, h = vert ? n * 26 + 6 : 30;
      el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 7, fill: '#1c1f24', stroke: '#000', 'stroke-width': 2 }, this.g);
      this.c = {};
      const cols = ['R', 'Y', 'G', 'A'].slice(0, n);
      cols.forEach((k, i) => {
        const cx = vert ? 0 : -w / 2 + 16 + i * 26, cy = vert ? -h / 2 + 16 + i * 26 : 0;
        if (k === 'A') {
          this.c.A = el('path', { d: `M ${cx + 8} ${cy} L ${cx - 6} ${cy} M ${cx - 6} ${cy} L ${cx} ${cy - 6} M ${cx - 6} ${cy} L ${cx} ${cy + 6}`, stroke: '#2f3b2f', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, this.g);
        } else this.c[k] = el('circle', { cx, cy, r: 10, fill: '#333' }, this.g);
      });
    }
    render(t) {
      const o = this.o;
      this.g.setAttribute('opacity', t >= (o.t0 ?? -1) && t <= (o.t1 ?? 1e9) ? 1 : 0);
      let st = 'off';
      for (const [tt, v] of this.keys) if (tt <= t + 1e-9) st = v;
      const on = blink(t, 1.0);
      const lit = { R: st === 'R' || st.startsWith('R+') || (st === 'FR' && on), Y: st === 'Y' || (st === 'FY' && on) || st === 'YL', G: st === 'G' };
      this.c.R.setAttribute('fill', lit.R ? '#ff3b30' : '#4a1d1b');
      this.c.Y.setAttribute('fill', lit.Y ? '#ffcc00' : '#4a4115');
      this.c.G.setAttribute('fill', lit.G ? '#34d058' : '#173d22');
      if (this.c.A) this.c.A.setAttribute('stroke', st.includes('GL') ? '#34d058' : st === 'YL' ? '#ffcc00' : '#2f3b2f');
    }
  }

  class Gate {
    // Railroad gate arm. keys: [[t, 0..1]] tweened; 1 = down across the lane.
    constructor(s, x, y, keys, o) {
      Object.assign(this, { s, keys, o });
      this.tr = new Tracks(); this.tr.tween('d', keys);
      this.g = el('g', { transform: `translate(${x},${y})` }, s.L.labels);
      el('circle', { r: 9, fill: '#444' }, this.g);
      this.arm = el('g', {}, this.g);
      const len = o.len || 120;
      el('rect', { x: 0, y: -5, width: len, height: 10, rx: 4, fill: '#fff', stroke: '#222', 'stroke-width': 1.5 }, this.arm);
      for (let i = 0; i < len / 24; i++) el('rect', { x: 8 + i * 24, y: -5, width: 12, height: 10, fill: '#d62828' }, this.arm);
      this.l1 = el('circle', { cx: -14, cy: -10, r: 7, fill: '#5a1a1a' }, this.g);
      this.l2 = el('circle', { cx: -14, cy: 10, r: 7, fill: '#5a1a1a' }, this.g);
      this.rest = o.rest ?? -90; this.down = o.down ?? 0;
      this.flashKeys = o.flash || null;
    }
    render(t) {
      const d = this.tr.num('d', t, 0);
      const ang = lerp(this.rest, this.down, d);
      const len = this.o.len || 120;
      // Top-down: an arm pointing up is foreshortened.
      const sc = lerp(0.18, 1, d);
      this.arm.setAttribute('transform', `rotate(${this.down}) scale(${sc.toFixed(3)},1)`);
      let fl = false;
      if (this.flashKeys) for (const [tt, v] of this.flashKeys) if (tt <= t) fl = v;
      const on = blink(t, 1.2);
      this.l1.setAttribute('fill', fl && on ? '#ff3b30' : '#5a1a1a');
      this.l2.setAttribute('fill', fl && !on ? '#ff3b30' : '#5a1a1a');
      void ang; void len;
    }
  }

  /* ---------------- Backgrounds ---------------- */

  function dashLine(g, x1, y1, x2, y2, color, w = 4, dash = '28 26') {
    el('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': w, 'stroke-dasharray': dash }, g);
  }
  function solid(g, x1, y1, x2, y2, color, w = 4) { el('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': w }, g); }

  function scatter(s, g, region, n, items) {
    const r = s.rand;
    const [x0, y0, x1, y1] = region;
    if (x1 - x0 < 40 || y1 - y0 < 40) return;
    for (let i = 0; i < n; i++) {
      const it = items[Math.floor(r() * items.length)];
      const x = x0 + 30 + r() * Math.max(1, x1 - x0 - 60), y = y0 + 30 + r() * Math.max(1, y1 - y0 - 60);
      frag(propSVG(it, { s: 0.8 + r() * 0.6, c: it === 'house' ? ['#b55d4c', '#8c6f5a', '#6f7f99', '#9c8a6a'][Math.floor(r() * 4)] : undefined }, r), g, { transform: `translate(${x.toFixed(0)},${y.toFixed(0)}) rotate(${it === 'house' ? 0 : r() * 360})` });
    }
  }

  const BG = {};

  // Straight horizontal road. Lane helpers count from the RIGHT edge for each direction:
  // E(0) is the rightmost eastbound lane, W(0) the rightmost westbound lane.
  BG.road = (s, o) => {
    const g = s.L.bg;
    const y = o.y ?? 450, n = o.lanes ?? 1, med = o.median ?? 0, nW = o.lanesW ?? n;
    const oneway = !!o.oneway;
    const half = med / 2;
    const top = oneway ? y - n * LANE / 2 : y - half - nW * LANE;
    const bot = oneway ? y + n * LANE / 2 : y + half + n * LANE;
    const sh = o.shoulder ?? (o.curb ? 0 : 26);
    const park = o.parking ? 46 : 0;
    if (!o.noBase) el('rect', { x: 0, y: 0, width: W, height: H, fill: o.snow ? '#e9eef4' : C.grass }, g);
    if (o.curb) {
      const wk = o.walk ?? 46;
      el('rect', { x: 0, y: top - park - wk - 6, width: W, height: wk, fill: C.walk }, g);
      el('rect', { x: 0, y: bot + park + 6, width: W, height: wk, fill: C.walk }, g);
      el('rect', { x: 0, y: top - park - 6, width: W, height: 6, fill: C.curb }, g);
      el('rect', { x: 0, y: bot + park, width: W, height: 6, fill: C.curb }, g);
      for (let x = 0; x < W; x += 60) {
        solid(g, x, top - park - wk - 6, x, top - park - 6, 'rgba(0,0,0,.08)', 2);
        solid(g, x, bot + park + 6, x, bot + park + wk + 6, 'rgba(0,0,0,.08)', 2);
      }
    }
    el('rect', { x: 0, y: top - sh - park, width: W, height: bot - top + 2 * sh + 2 * park, fill: o.snow ? '#7a7f86' : C.road }, g);
    if (sh) {
      el('rect', { x: 0, y: top - sh, width: W, height: sh, fill: C.shoulder, opacity: 0.6 }, g);
      el('rect', { x: 0, y: bot, width: W, height: sh, fill: C.shoulder, opacity: 0.6 }, g);
    }
    if (med) {
      if (o.medianType === 'barrier') { el('rect', { x: 0, y: y - half, width: W, height: med, fill: C.road }, g); el('rect', { x: 0, y: y - 5, width: W, height: 10, fill: '#bfbcb6', stroke: '#8f8b84' }, g); }
      else if (o.medianType === 'twlt') { /* center turn lane — same pavement */ }
      else el('rect', { x: 0, y: y - half + 4, width: W, height: med - 8, fill: C.grassDark }, g);
    }
    const m = s.L.marks;
    if (!o.curb) { solid(m, 0, top + 3, W, top + 3, C.line, 4); solid(m, 0, bot - 3, W, bot - 3, C.line, 4); }
    else if (park) {
      solid(m, 0, top + 2, W, top + 2, 'rgba(255,255,255,.7)', 3);
      solid(m, 0, bot - 2, W, bot - 2, 'rgba(255,255,255,.7)', 3);
    }
    // Lane lines between lanes of the same direction.
    for (let i = 1; i < n; i++) dashLine(m, 0, bot - i * LANE, W, bot - i * LANE, C.line, 4);
    if (!oneway) for (let i = 1; i < nW; i++) dashLine(m, 0, top + i * LANE, W, top + i * LANE, C.line, 4);
    if (!oneway) {
      const ct = o.center || (n > 1 ? 'double' : 'dashed');
      if (med && o.medianType === 'twlt') {
        solid(m, 0, y - half + 3, W, y - half + 3, C.yellow, 4); dashLine(m, 0, y - half + 11, W, y - half + 11, C.yellow, 4);
        solid(m, 0, y + half - 3, W, y + half - 3, C.yellow, 4); dashLine(m, 0, y + half - 11, W, y + half - 11, C.yellow, 4);
      } else if (med) {
        solid(m, 0, y - half + 3, W, y - half + 3, C.yellow, 4); solid(m, 0, y + half - 3, W, y + half - 3, C.yellow, 4);
      } else if (ct === 'dashed') dashLine(m, 0, y, W, y, C.yellow, 4);
      else if (ct === 'double') { solid(m, 0, y - 4, W, y - 4, C.yellow, 3.5); solid(m, 0, y + 4, W, y + 4, C.yellow, 3.5); }
      else if (Array.isArray(ct)) {
        // Segments: [{x0,x1,type:'dashed'|'nopassE'|'nopassW'|'double'}]
        for (const sg of ct) {
          const north = sg.type === 'nopassW' || sg.type === 'double', south = sg.type === 'nopassE' || sg.type === 'double';
          if (sg.type === 'dashed') dashLine(m, sg.x0, y, sg.x1, y, C.yellow, 4);
          else {
            if (north) solid(m, sg.x0, y - 4, sg.x1, y - 4, C.yellow, 3.5); else dashLine(m, sg.x0, y - 4, sg.x1, y - 4, C.yellow, 3.5);
            if (south) solid(m, sg.x0, y + 4, sg.x1, y + 4, C.yellow, 3.5); else dashLine(m, sg.x0, y + 4, sg.x1, y + 4, C.yellow, 3.5);
          }
        }
      }
    }
    // Scenery strips above and below.
    if (o.scenery !== false && !CUR.diagram) {
      const items = o.city ? ['bldg'] : ['tree', 'tree', 'house'];
      const upper = [0, 0, W, top - sh - park - (o.curb ? 56 : 10)], lower = [0, bot + sh + park + (o.curb ? 56 : 10), W, H];
      if (o.city) {
        for (const reg of [upper, lower]) {
          if (reg[3] - reg[1] < 60) continue;
          for (let x = 20; x < W; x += 190) {
            const hh = Math.min(140, reg[3] - reg[1] - 20);
            frag(propSVG('bldg', { w: 170, h: hh, c: ['#9aa3ad', '#a38f7d', '#7f8fa6', '#b0a58f'][Math.floor(s.rand() * 4)] }), g, { transform: `translate(${x + 85},${reg === upper ? reg[3] - hh / 2 - 8 : reg[1] + hh / 2 + 8})` });
          }
        }
      } else {
        scatter(s, g, upper, Math.round((upper[3] - upper[1]) * W / 60000), items);
        scatter(s, g, lower, Math.round((lower[3] - lower[1]) * W / 60000), items);
      }
    }
    // Helpers are closures over this road, so a scene with two roads can snapshot them: ({ ...s.lane }).
    const L = s.lanes;
    L.top = top; L.bot = bot; L.y = y;
    L.E = i => bot - LANE / 2 - i * LANE;
    L.W = i => top + LANE / 2 + i * LANE;
    L.shoulderE = bot + sh / 2; L.shoulderW = top - sh / 2;
    L.parkE = bot + park / 2; L.parkW = top - park / 2;
    L.curbE = bot + park; L.curbW = top - park;
    if (o.snow) {
      for (let i = 0; i < 160; i++) el('circle', { cx: s.rand() * W, cy: s.rand() * H, r: 1 + s.rand() * 2.5, fill: '#fff', opacity: 0.8 }, s.L.night);
    }
  };

  BG.freeway = (s, o) => {
    BG.road(s, { lanes: o.lanes ?? 3, median: o.median ?? 70, medianType: o.medianType || 'grass', shoulder: 40, scenery: o.scenery, y: o.y, snow: o.snow });
    const L = s.lanes, g = s.L.bg, m = s.L.marks;
    if (o.ramp === 'on') {
      const yb = L.bot;
      el('path', { d: `M -40 ${H + 40} C 250 ${yb + 150}, 420 ${yb + 32}, 700 ${yb + 32} L 1050 ${yb + 32} L 1250 ${yb}`, stroke: C.road, 'stroke-width': 64, fill: 'none' }, g);
      el('path', { d: `M -40 ${H + 40} C 250 ${yb + 150}, 420 ${yb + 32}, 700 ${yb + 32} L 1050 ${yb + 32} L 1250 ${yb}`, stroke: C.road, 'stroke-width': 64, fill: 'none' }, g);
      el('path', { d: `M 0 ${H + 4} C 270 ${yb + 176}, 420 ${yb + 64}, 700 ${yb + 64} L 1050 ${yb + 64} L 1250 ${yb + 30}`, stroke: C.line, 'stroke-width': 4, fill: 'none' }, m);
      dashLine(m, 700, yb, 1050, yb, C.line, 4, '14 14');
      L.ramp = { start: [-40, H + 40], c1: [250, yb + 150], c2: [420, yb + 32], merge: [700, yb + 32], end: [1050, yb + 32] };
      // Re-paint the solid edge line over the merge area as dashes.
      el('rect', { x: 700, y: yb - 6, width: 350, height: 8, fill: C.road }, m);
      dashLine(m, 700, yb - 3, 1050, yb - 3, C.line, 4, '14 14');
    }
  };

  // Four-way intersection. Lane helpers are lane-center coordinates; i counts from the right edge.
  BG.cross = (s, o) => {
    const g = s.L.bg, m = s.L.marks;
    const cx = o.cx ?? 800, cy = o.cy ?? 450, n = o.lanes ?? 1, nv = o.vlanes ?? n;
    const HW = n * LANE + (o.medH || 0) / 2, VW = nv * LANE;
    el('rect', { x: 0, y: 0, width: W, height: H, fill: C.grass }, g);
    const walk = o.walks !== false;
    if (walk) {
      el('rect', { x: 0, y: cy - HW - 52, width: W, height: 104 + 2 * HW, fill: C.walk }, g);
      el('rect', { x: cx - VW - 52, y: 0, width: 104 + 2 * VW, height: H, fill: C.walk }, g);
    }
    el('rect', { x: 0, y: cy - HW - 10, width: W, height: 2 * HW + 20, fill: C.road }, g);
    el('rect', { x: cx - VW - 10, y: 0, width: 2 * VW + 20, height: H, fill: C.road }, g);
    // Scenery in the four quadrants.
    if (o.scenery !== false && !CUR.diagram) {
      const pad = walk ? 60 : 20;
      const q = [[0, 0, cx - VW - pad, cy - HW - pad], [cx + VW + pad, 0, W, cy - HW - pad], [0, cy + HW + pad, cx - VW - pad, H], [cx + VW + pad, cy + HW + pad, W, H]];
      if (o.city) q.forEach(r => { if (r[2] - r[0] > 80 && r[3] - r[1] > 80) frag(propSVG('bldg', { w: r[2] - r[0] - 40, h: r[3] - r[1] - 40, c: ['#9aa3ad', '#a38f7d', '#7f8fa6', '#b0a58f'][Math.floor(s.rand() * 4)] }), g, { transform: `translate(${(r[0] + r[2]) / 2},${(r[1] + r[3]) / 2})` }); });
      else q.forEach(r => scatter(s, g, r, Math.round((r[2] - r[0]) * (r[3] - r[1]) / 45000), ['tree', 'tree', 'house']));
    }
    const sl = 48; // stop line distance beyond the box edge
    // Edge lines.
    for (const yy of [cy - HW, cy + HW]) { solid(m, 0, yy, cx - VW - sl + 8, yy, C.line, 3); solid(m, cx + VW + sl - 8, yy, W, yy, C.line, 3); }
    for (const xx of [cx - VW, cx + VW]) { solid(m, xx, 0, xx, cy - HW - sl + 8, C.line, 3); solid(m, xx, cy + HW + sl - 8, xx, H, C.line, 3); }
    // Center lines.
    const cl = o.center || 'double';
    const cline = (x1, y1, x2, y2) => {
      if (cl === 'dashed') dashLine(m, x1, y1, x2, y2, C.yellow, 4);
      else if (x1 === x2) { solid(m, x1 - 4, y1, x2 - 4, y2, C.yellow, 3.5); solid(m, x1 + 4, y1, x2 + 4, y2, C.yellow, 3.5); }
      else { solid(m, x1, y1 - 4, x2, y2 - 4, C.yellow, 3.5); solid(m, x1, y1 + 4, x2, y2 + 4, C.yellow, 3.5); }
    };
    if (!o.onewayH) { cline(0, cy, cx - VW - sl, cy); cline(cx + VW + sl, cy, W, cy); }
    if (!o.onewayV) { cline(cx, 0, cx, cy - HW - sl); cline(cx, cy + HW + sl, cx, H); }
    for (let i = 1; i < n; i++) {
      for (const yy of [cy - i * LANE, cy + i * LANE]) { dashLine(m, 0, yy, cx - VW - sl, yy, C.line); dashLine(m, cx + VW + sl, yy, W, yy, C.line); }
    }
    for (let i = 1; i < nv; i++) {
      for (const xx of [cx - i * LANE, cx + i * LANE]) { dashLine(m, xx, 0, xx, cy - HW - sl, C.line); dashLine(m, xx, cy + HW + sl, xx, H, C.line); }
    }
    // Stop lines (only on the right half of each approach) and crosswalks.
    if (o.stopLines !== false) {
      solid(m, cx - VW - sl, cy, cx - VW - sl, cy + HW, C.line, 7);   // eastbound approach
      solid(m, cx + VW + sl, cy - HW, cx + VW + sl, cy, C.line, 7);   // westbound
      solid(m, cx, cy + HW + sl, cx + VW, cy + HW + sl, C.line, 7);   // northbound
      solid(m, cx - VW, cy - HW - sl, cx, cy - HW - sl, C.line, 7);   // southbound
    }
    if (o.crosswalks !== false) {
      const zebra = (x, y, w, h, vertical) => {
        const nS = Math.floor((vertical ? h : w) / 16);
        for (let i = 0; i < nS; i++) {
          if (vertical) el('rect', { x, y: y + i * 16 + 3, width: w, height: 9, fill: C.line, opacity: 0.92 }, m);
          else el('rect', { x: x + i * 16 + 3, y, width: 9, height: h, fill: C.line, opacity: 0.92 }, m);
        }
      };
      zebra(cx - VW - 40, cy - HW, 28, 2 * HW, true);
      zebra(cx + VW + 12, cy - HW, 28, 2 * HW, true);
      zebra(cx - VW, cy - HW - 40, 2 * VW, 28, false);
      zebra(cx - VW, cy + HW + 12, 2 * VW, 28, false);
    }
    const L = s.lanes;
    Object.assign(L, { cx, cy, HW, VW, sl });
    L.E = i => cy + LANE / 2 + (n - 1 - i) * LANE;
    L.W = i => cy - LANE / 2 - (n - 1 - i) * LANE;
    L.N = i => cx + LANE / 2 + (nv - 1 - i) * LANE;
    L.S = i => cx - LANE / 2 - (nv - 1 - i) * LANE;
    // Center of a vehicle stopped with its front at the stop line.
    L.stopAt = (dir, kind = 'car') => {
      const h = (KIND[kind] || KIND.car).L / 2 + 4;
      return { E: cx - VW - sl - h, W: cx + VW + sl + h, N: cy + HW + sl + h, S: cy - HW - sl - h }[dir];
    };
    // Where a sign/signal for an approach sits (near-right corner).
    L.corner = dir => ({
      E: [cx - VW - 104, cy + HW + 80], W: [cx + VW + 104, cy - HW - 34],
      N: [cx + VW + 80, cy + HW + 104], S: [cx - VW - 80, cy - HW - 64],
    }[dir]);
  };

  BG.rail = (s, o) => {
    BG.road(s, { lanes: o.lanes ?? 1, center: o.center || 'double', scenery: o.scenery, y: o.y });
    const g = s.L.bg, m = s.L.marks;
    const tx = o.tx ?? 900;
    el('rect', { x: tx - 70, y: 0, width: 140, height: H, fill: C.ballast }, g);
    for (let y = -10; y < H + 10; y += 22) el('rect', { x: tx - 48, y, width: 96, height: 9, fill: C.tie }, g);
    const L = s.lanes;
    el('rect', { x: tx - 60, y: L.top - 26, width: 120, height: L.bot - L.top + 52, fill: '#7d8187' }, g);
    for (const dx of [-26, 26]) solid(m, tx + dx, 0, tx + dx, H, C.rail, 6);
    // Re-draw road markings over the crossing panel edges.
    el('rect', { x: tx - 60, y: L.top - 26, width: 120, height: L.bot - L.top + 52, fill: 'none', stroke: '#5f6368', 'stroke-width': 2 }, g);
    L.tx = tx;
    L.railW = tx - 26; L.railE = tx + 26;
  };

  // Side view: sky, ground, road surface at y=groundY.
  BG.side = (s, o) => {
    const g = s.L.bg;
    const gy = o.ground ?? 700;
    el('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#sky)' }, g);
    el('path', { d: `M 0 ${gy - 120} Q 300 ${gy - 220} 600 ${gy - 130} T 1200 ${gy - 150} T 1600 ${gy - 120} V ${gy} H 0 Z`, fill: '#cfe0c4', opacity: 0.9 }, g);
    el('rect', { x: 0, y: gy, width: W, height: H - gy, fill: '#8fb878' }, g);
    el('rect', { x: 0, y: gy, width: W, height: 44, fill: C.road }, g);
    for (let x = 0; x < W; x += 80) el('rect', { x, y: gy + 18, width: 40, height: 5, fill: C.yellow }, g);
    s.lanes.ground = gy;
  };

  // Big top-down cabin for seating/restraint scenes. Car faces +x.
  BG.cabin = (s, o) => {
    const g = s.L.bg;
    el('rect', { x: 0, y: 0, width: W, height: H, fill: o.fill || '#3b4552' }, g);
    for (let x = 0; x < W; x += 120) solid(g, x + (s.rand() * 60), 0, x + 40, H, 'rgba(255,255,255,.035)', 30);
    const body = o.color || '#2f6fd6';
    frag(`
      <rect x="300" y="190" width="1000" height="520" rx="140" fill="${body}" stroke="#0b1d3f" stroke-width="6"/>
      <rect x="330" y="215" width="940" height="470" rx="120" fill="#cfd5dc"/>
      <path d="M 1080 225 Q 1230 300 1230 450 Q 1230 600 1080 675" fill="#22313f" opacity=".85"/>
      <path d="M 450 230 Q 360 330 360 450 Q 360 570 450 670" fill="none" stroke="#22313f" stroke-width="36" opacity=".55"/>
      <rect x="1030" y="235" width="40" height="430" rx="10" fill="#4d5560"/>
      <rect x="500" y="200" width="12" height="40" fill="#0b1d3f"/><rect x="500" y="660" width="12" height="40" fill="#0b1d3f"/>
      <rect x="780" y="200" width="12" height="40" fill="#0b1d3f"/><rect x="780" y="660" width="12" height="40" fill="#0b1d3f"/>
      <rect x="1110" y="160" width="40" height="40" rx="8" fill="${body}" stroke="#0b1d3f" stroke-width="4"/>
      <rect x="1110" y="700" width="40" height="40" rx="8" fill="${body}" stroke="#0b1d3f" stroke-width="4"/>
      <text x="1290" y="458" font-size="22" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial" transform="rotate(90 1290 458)" text-anchor="middle">FRONT</text>
    `, g);
    // Seats: front row x≈900, rear row x≈620. Driver sits on the left side (top of screen).
    const seat = (x, y, w = 150, h = 120) => frag(`<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="22" fill="#5d6773" stroke="#3a424c" stroke-width="3"/><rect x="${x - w / 2}" y="${y - h / 2}" width="30" height="${h}" rx="12" fill="#4b5460"/>`, g);
    s.lanes.seats = { driver: [910, 335], front: [910, 565], rearL: [620, 320], rearM: [620, 450], rearR: [620, 580] };
    seat(910, 335); seat(910, 565);
    frag(`<rect x="530" y="250" width="190" height="400" rx="26" fill="#5d6773" stroke="#3a424c" stroke-width="3"/><rect x="530" y="250" width="34" height="400" rx="14" fill="#4b5460"/>`, g);
    frag(`<circle cx="1005" cy="335" r="46" fill="none" stroke="#1f242b" stroke-width="12"/><rect x="995" y="300" width="20" height="70" rx="6" fill="#1f242b"/>`, s.L.actors);
  };

  // Driver's-eye view for distraction scenes. The road scrolls with time.
  BG.dash = (s, o) => {
    const g = s.L.bg;
    el('rect', { x: 0, y: 0, width: W, height: 380, fill: 'url(#sky)' }, g);
    el('rect', { x: 0, y: 380, width: W, height: H - 380, fill: C.grass }, g);
    el('polygon', { points: `760,380 840,380 1500,900 100,900`, fill: C.road }, g);
    el('polygon', { points: `760,380 765,380 160,900 130,900`, fill: C.line }, g);
    el('polygon', { points: `835,380 840,380 1470,900 1440,900`, fill: C.line }, g);
    const dashes = el('g', {}, g);
    const segs = [];
    for (let i = 0; i < 8; i++) segs.push(el('polygon', { fill: C.yellow }, dashes));
    for (let i = 0; i < 6; i++) frag(propSVG('tree', { s: 1 }), g, { transform: `translate(${100 + i * 280},${360 - (i % 2) * 20})` });
    s.bgTick = t => {
      const speed = o.speed ?? 0.6;
      segs.forEach((p, i) => {
        const z = ((i / 8) + t * speed / 4) % 1; // 0 far → 1 near
        const z2 = Math.min(1, z + 0.045);
        const y1 = 380 + 520 * z * z, y2 = 380 + 520 * z2 * z2;
        const w1 = 3 + 14 * z * z, w2 = 3 + 14 * z2 * z2;
        p.setAttribute('points', `${800 - w1 / 2},${y1} ${800 + w1 / 2},${y1} ${800 + w2 / 2},${y2} ${800 - w2 / 2},${y2}`);
      });
    };
    // Dashboard and steering wheel are drawn by the scene (actors layer) so phones can sit on top.
    frag(`<path d="M 0 640 Q 800 560 1600 640 L 1600 900 L 0 900 Z" fill="#23272e"/>
      <path d="M 0 640 Q 800 560 1600 640" stroke="#3a4049" stroke-width="10" fill="none"/>
      <rect x="690" y="650" width="220" height="80" rx="16" fill="#111" stroke="#3a4049" stroke-width="4"/>
      <text x="800" y="702" text-anchor="middle" font-size="34" font-weight="800" fill="#7fd1ff" font-family="system-ui,Segoe UI,Arial">${o.mph ?? 45} mph</text>`, s.L.under);
    frag(`<circle cx="420" cy="860" r="190" fill="none" stroke="#15181d" stroke-width="40"/><rect x="390" y="700" width="60" height="180" rx="20" fill="#15181d"/>`, s.L.actors);
  };

  BG.blank = (s, o) => { el('rect', { x: 0, y: 0, width: W, height: H, fill: o.fill || '#2b3440' }, s.L.bg); };

  window.DL = { Scene, Path, KIND, C, W, H, LANE, FT, signSVG, propSVG, vehicleSVG, octagon, esc };
})();
