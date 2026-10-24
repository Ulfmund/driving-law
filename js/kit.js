/* Driving Law — section registry and drawing helpers shared by scene files. */
(function () {
  'use strict';
  const { C, octagon, esc } = DL;

  const DIVS = {
    gen: 'General provisions',
    sig: 'Traffic signs, signals & markings',
    acc: 'Accidents',
    owi: 'Intoxicated & reckless driving',
    spd: 'Speed restrictions',
    lane: 'Driving on the right · overtaking & passing',
    turn: 'Turning, starting & signals',
    row: 'Right-of-way',
    moto: 'Motorcycles, mopeds & low-speed vehicles',
    av: 'Automated vehicles',
    stop: 'Special stops required',
    park: 'Stopping, standing & parking',
    misc: 'Miscellaneous rules',
    equip: 'Equipment',
    size: 'Size, weight & load',
  };

  window.LAW = {
    list: [],
    add(def) { this.list.push(def); },
    divName: k => DIVS[k] || k,
  };

  // Palette for "other" traffic, so scenes vary without picking colors each time.
  const COL = { you: '#2f6fd6', red: '#d0452f', gold: '#e3a72a', gray: '#7d8790', green: '#3f8f5c', white: '#eceae4', purple: '#8457c4', teal: '#2a9d9a', black: '#2b2e33', orange: '#e46f12' };

  /* ---------- Side-view drawings. x = center, gy = ground line, 22 px per foot. ---------- */
  const PX = 22;
  const wheel = (x, gy, r) => `<circle cx="${x}" cy="${gy - r}" r="${r}" fill="#1d1f23"/><circle cx="${x}" cy="${gy - r}" r="${r * 0.45}" fill="#9aa1a8"/>`;

  function sideCar(x, gy, color = COL.you, o = {}) {
    const lift = o.lift || 0, L = 330;
    const y0 = gy - 30 - lift;
    return `<g>
      <path d="M ${x - L / 2} ${y0} L ${x - L / 2} ${y0 - 46} Q ${x - L / 2 + 10} ${y0 - 56} ${x - L / 2 + 50} ${y0 - 58} L ${x - 70} ${y0 - 62} L ${x - 30} ${y0 - 108} L ${x + 70} ${y0 - 108} L ${x + 110} ${y0 - 64} L ${x + L / 2 - 10} ${y0 - 54} Q ${x + L / 2} ${y0 - 40} ${x + L / 2} ${y0 - 18} L ${x + L / 2} ${y0} Z" fill="${color}" stroke="rgba(0,0,0,.4)" stroke-width="2"/>
      <path d="M ${x - 58} ${y0 - 64} L ${x - 24} ${y0 - 100} L ${x + 18} ${y0 - 100} L ${x + 18} ${y0 - 64} Z" fill="#22313f" opacity=".85"/>
      <path d="M ${x + 26} ${y0 - 64} L ${x + 26} ${y0 - 100} L ${x + 66} ${y0 - 100} L ${x + 98} ${y0 - 64} Z" fill="#22313f" opacity=".85"/>
      <rect x="${x + L / 2 - 14}" y="${y0 - 42}" width="12" height="10" rx="3" fill="#fff6c8"/>
      <rect x="${x - L / 2}" y="${y0 - 44}" width="9" height="12" rx="2" fill="#b51c1c"/>
      <rect x="${x - L / 2 - 6}" y="${y0 - 22}" width="14" height="16" rx="3" fill="#3a3f46" data-part="bumper"/>
      <rect x="${x + L / 2 - 8}" y="${y0 - 22}" width="14" height="16" rx="3" fill="#3a3f46"/>
      ${lift ? `<rect x="${x - 120}" y="${y0}" width="10" height="${lift + 4}" fill="#d0452f"/><rect x="${x + 110}" y="${y0}" width="10" height="${lift + 4}" fill="#d0452f"/>` : ''}
      ${wheel(x - 110, gy, 30)}${wheel(x + 110, gy, 30)}
    </g>`;
  }

  function sidePickup(x, gy, color = COL.red, o = {}) {
    const lift = o.lift || 0, L = 400;
    const y0 = gy - 36 - lift;
    return `<g>
      <path d="M ${x - L / 2} ${y0} L ${x - L / 2} ${y0 - 74} L ${x - 20} ${y0 - 74} L ${x - 20} ${y0 - 136} L ${x + 60} ${y0 - 136} L ${x + 100} ${y0 - 80} L ${x + L / 2 - 6} ${y0 - 72} Q ${x + L / 2} ${y0 - 60} ${x + L / 2} ${y0 - 30} L ${x + L / 2} ${y0} Z" fill="${color}" stroke="rgba(0,0,0,.4)" stroke-width="2"/>
      <path d="M ${x - 8} ${y0 - 82} L ${x - 8} ${y0 - 126} L ${x + 54} ${y0 - 126} L ${x + 86} ${y0 - 82} Z" fill="#22313f" opacity=".85"/>
      <rect x="${x - L / 2 - 6}" y="${y0 - 24}" width="16" height="18" rx="3" fill="#3a3f46"/>
      <rect x="${x + L / 2 - 10}" y="${y0 - 24}" width="16" height="18" rx="3" fill="#3a3f46"/>
      ${lift ? `<rect x="${x - L / 2 + 70}" y="${y0}" width="12" height="${lift + 6}" fill="#f2c230" stroke="#7a6206"/><rect x="${x + L / 2 - 95}" y="${y0}" width="12" height="${lift + 6}" fill="#f2c230" stroke="#7a6206"/>` : ''}
      ${wheel(x - L / 2 + 76, gy, 36)}${wheel(x + L / 2 - 90, gy, 36)}
    </g>`;
  }

  function sideMoto(x, gy, o = {}) {
    const hb = o.bar || 22; // handlebar height above seat, in inches (1 in ≈ 1.83 px at 22 px/ft)
    const seatY = gy - 64, barY = seatY - hb * PX / 12;
    return `<g>
      ${wheel(x - 70, gy, 32)}${wheel(x + 74, gy, 32)}
      <path d="M ${x - 70} ${gy - 32} L ${x - 20} ${gy - 60} L ${x + 40} ${gy - 60} L ${x + 74} ${gy - 32}" stroke="#2a2d33" stroke-width="9" fill="none"/>
      <rect x="${x - 10}" y="${gy - 84}" width="58" height="26" rx="10" fill="${o.color || '#c0392b'}"/>
      <rect x="${x - 54}" y="${seatY - 6}" width="56" height="12" rx="6" fill="#222"/>
      <path d="M ${x + 56} ${gy - 70} L ${x + 50} ${barY} L ${x + 34} ${barY - 6}" stroke="#222" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="${x + 76}" cy="${gy - 80}" r="9" fill="#fff6c8" stroke="#333" stroke-width="2"/>
    </g>`;
  }

  // Big phone and hand for the dash view.
  function phone(x, y, o = {}) {
    const rot = o.rot || 0;
    return `<g transform="translate(${x},${y}) rotate(${rot})">
      <rect x="-48" y="-90" width="96" height="180" rx="14" fill="#111" stroke="#555" stroke-width="3"/>
      <rect x="-40" y="-76" width="80" height="150" rx="6" fill="${o.screen || '#3c82f6'}"/>
      ${o.text ? `<rect x="-32" y="-60" width="64" height="18" rx="9" fill="#fff" opacity=".9"/><rect x="-24" y="-34" width="56" height="18" rx="9" fill="#a7f3d0" opacity=".95"/><rect x="-32" y="-8" width="50" height="18" rx="9" fill="#fff" opacity=".9"/>` : ''}
      ${o.nav ? `<path d="M -20 60 L -20 0 L 20 -40" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="20" cy="-40" r="8" fill="#ff4d4d"/>` : ''}
      ${o.call ? `<circle cx="0" cy="-20" r="24" fill="#fff" opacity=".85"/><circle cx="0" cy="44" r="16" fill="#22c55e"/>` : ''}
    </g>`;
  }
  function hand(x, y, rot = 0) {
    return `<g transform="translate(${x},${y}) rotate(${rot})"><ellipse cx="0" cy="40" rx="62" ry="46" fill="#d9a77c" stroke="#a87b56" stroke-width="3"/><rect x="-40" y="70" width="80" height="140" rx="30" fill="#5b6fb5"/></g>`;
  }
  function mount(x, y) {
    return `<g transform="translate(${x},${y})"><rect x="-10" y="80" width="20" height="60" fill="#333"/><rect x="-56" y="-98" width="112" height="196" rx="16" fill="none" stroke="#333" stroke-width="8"/></g>`;
  }

  /* ---------- Cabin occupants (top-down). Faces +x. ---------- */
  function occupant(x, y, o = {}) {
    const age = o.age || 'adult';
    const sc = { adult: 1, teen: 0.92, child: 0.75, kid: 0.82, toddler: 0.62, infant: 0.5 }[age] || 1;
    const shirt = o.color || '#5b6fb5';
    const belt = o.belt ? `<path d="M ${-40 * sc} ${-34 * sc} L ${30 * sc} ${34 * sc}" stroke="#111" stroke-width="${8 * sc}" stroke-linecap="round" opacity=".9"/><path d="M ${-34 * sc} ${30 * sc} L ${-34 * sc} ${-30 * sc}" stroke="#111" stroke-width="${7 * sc}" opacity=".8"/>` : '';
    return `<g transform="translate(${x},${y})">
      <ellipse cx="${-6 * sc}" cy="0" rx="${36 * sc}" ry="${52 * sc}" fill="${shirt}" stroke="rgba(0,0,0,.35)" stroke-width="2"/>
      <circle cx="${12 * sc}" cy="0" r="${26 * sc}" fill="#e0b48c" stroke="rgba(0,0,0,.35)" stroke-width="2"/>
      <path d="M ${-4 * sc} ${-22 * sc} Q ${-10 * sc} 0 ${-4 * sc} ${22 * sc}" stroke="#5a3a22" stroke-width="${12 * sc}" fill="none" opacity=".75"/>
      ${belt}
    </g>`;
  }
  // Child restraint seats. type: 'rear' (rear-facing), 'forward' (harness), 'booster'.
  function childSeat(x, y, type) {
    if (type === 'rear') return `<g transform="translate(${x},${y})"><rect x="-70" y="-56" width="130" height="112" rx="40" fill="#2c3e50" stroke="#1a252f" stroke-width="3"/><rect x="-60" y="-44" width="104" height="88" rx="30" fill="#3d5a73"/>
      <ellipse cx="0" cy="0" rx="26" ry="20" fill="#e05d8e"/><circle cx="-30" cy="0" r="17" fill="#e0b48c" stroke="rgba(0,0,0,.35)" stroke-width="2"/>
      <path d="M 10 -18 L -8 0 L 10 18" stroke="#f2c230" stroke-width="5" fill="none"/><text x="-4" y="76" text-anchor="middle" font-size="18" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial">REAR-FACING</text></g>`;
    if (type === 'forward') return `<g transform="translate(${x},${y})"><rect x="-60" y="-56" width="120" height="112" rx="36" fill="#7a2e3b" stroke="#4a1a23" stroke-width="3"/><rect x="-50" y="-44" width="96" height="88" rx="28" fill="#9c3b4b"/>
      <ellipse cx="-6" cy="0" rx="26" ry="32" fill="#3f8f5c"/><circle cx="14" cy="0" r="18" fill="#e0b48c" stroke="rgba(0,0,0,.35)" stroke-width="2"/>
      <path d="M -24 -20 L 4 -6 M -24 20 L 4 6 M 4 -6 L 4 6" stroke="#f2c230" stroke-width="5" fill="none"/><text x="0" y="76" text-anchor="middle" font-size="18" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial">HARNESS</text></g>`;
    return `<g transform="translate(${x},${y})"><rect x="-58" y="-60" width="112" height="120" rx="20" fill="#3c4a5a" stroke="#222" stroke-width="3"/>
      ${occupant(0, 0, { age: 'kid', color: '#e3a72a', belt: true })}<text x="0" y="84" text-anchor="middle" font-size="18" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial">BOOSTER</text></g>`;
  }

  // An officer-style "ticket" card that pops up on screen.
  function ticket(x, y, lines, o = {}) {
    const w = o.w || 360, h = 70 + lines.length * 32;
    return `<g transform="translate(${x},${y})">
      <rect x="${-w / 2 + 6}" y="${-h / 2 + 8}" width="${w}" height="${h}" rx="10" fill="rgba(0,0,0,.25)"/>
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="10" fill="#fffdf4" stroke="#c9b98a" stroke-width="2"/>
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="46" rx="10" fill="${o.color || '#26313d'}"/>
      <rect x="${-w / 2}" y="${-h / 2 + 30}" width="${w}" height="16" fill="${o.color || '#26313d'}"/>
      <text x="0" y="${-h / 2 + 31}" text-anchor="middle" font-size="20" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial">${esc(o.title || 'CITATION')}</text>
      ${lines.map((l, i) => `<text x="${-w / 2 + 20}" y="${-h / 2 + 80 + i * 32}" font-size="20" font-weight="600" fill="#26313d" font-family="system-ui,Segoe UI,Arial">${esc(l)}</text>`).join('')}
    </g>`;
  }

  // A boxed table of rows, used for penalty ladders and rule summaries drawn on the stage.
  // rows: [[left, right, color?]]
  function table(x, y, rows, o = {}) {
    const w = o.w || 1000, rh = o.rh || 62, lw = o.lw || 250;
    const h = (o.title ? 64 : 0) + rows.length * rh + 16;
    let out = `<g transform="translate(${x - w / 2},${y - h / 2})">
      <rect x="6" y="8" width="${w}" height="${h}" rx="16" fill="rgba(0,0,0,.3)"/>
      <rect width="${w}" height="${h}" rx="16" fill="#18202a" stroke="rgba(255,255,255,.18)" stroke-width="2"/>`;
    let yy = 8;
    if (o.title) { out += `<text x="${w / 2}" y="44" text-anchor="middle" font-size="27" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial">${esc(o.title)}</text>`; yy = 64; }
    rows.forEach(([a, b, c], i) => {
      const ry = yy + i * rh;
      out += `<rect x="12" y="${ry + 4}" width="${lw}" height="${rh - 8}" rx="10" fill="${c || '#2f6fd6'}"/>
        <text x="${12 + lw / 2}" y="${ry + rh / 2 + 8}" text-anchor="middle" font-size="${o.fs || 22}" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial">${esc(a)}</text>
        <text x="${lw + 32}" y="${ry + rh / 2 + 8}" font-size="${o.fs || 22}" font-weight="600" fill="#e8edf3" font-family="system-ui,Segoe UI,Arial">${esc(b)}</text>`;
    });
    return out + '</g>';
  }

  // One row of an on-stage checklist. ok: true (green check), false (red x), null (number badge).
  function checkRow(x, y, text, ok, o = {}) {
    const w = o.w || 520, h = o.h || 58;
    const col = ok === true ? '#1f9d55' : ok === false ? '#d63a2f' : '#2f6fd6';
    const icon = ok === true ? `<path d="M -9 0 L -3 7 L 10 -8" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      : ok === false ? `<path d="M -7 -7 L 7 7 M 7 -7 L -7 7" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`
        : `<text x="0" y="7" text-anchor="middle" font-size="20" font-weight="900" fill="#fff" font-family="system-ui,Segoe UI,Arial">${esc(o.n || '')}</text>`;
    const lines = String(text).split('\n');
    return `<g transform="translate(${x},${y})">
      <rect x="0" y="${-h / 2}" width="${w}" height="${h}" rx="12" fill="#18202a" stroke="rgba(255,255,255,.2)" stroke-width="2"/>
      <g transform="translate(30,0)"><circle r="17" fill="${col}"/>${icon}</g>
      ${lines.map((l, i) => `<text x="60" y="${7 + (i - (lines.length - 1) / 2) * 24}" font-size="${o.fs || 21}" font-weight="650" fill="#fff" font-family="system-ui,Segoe UI,Arial">${esc(l)}</text>`).join('')}
    </g>`;
  }
  const can = (x, y, label) => `<g transform="translate(${x},${y})"><circle r="17" fill="#d6b03a" stroke="#7a5f12" stroke-width="3"/><circle r="9" fill="#8a8f96"/><ellipse cx="3" cy="-2" rx="4" ry="2.5" fill="#333"/>${label ? `<text x="0" y="-26" text-anchor="middle" font-size="18" font-weight="900" fill="#fff" stroke="#000" stroke-width="4" paint-order="stroke" font-family="system-ui,Segoe UI,Arial">${esc(label)}</text>` : ''}</g>`;

  window.K = { COL, PX, sideCar, sidePickup, sideMoto, wheel, phone, hand, mount, occupant, childSeat, ticket, table, checkRow, can, octagon };
})();
