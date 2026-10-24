/* Size, weight, and load: MCL 257.717 – 257.725 */
(function () {
  const { COL } = K;
  const F = 'font-family="system-ui,Segoe UI,Arial"';
  const FT = DL.FT;

  LAW.add({
    sec: '717', div: 'size', title: 'Maximum vehicle width',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A vehicle or its load may not be wider than **96 inches (8 feet)**, with exceptions.',
      'With pneumatic tires, the width across the tires may be up to **102 inches (8½ feet)**, but the body or load still may not exceed 96 inches. School buses, buses, trailers, semitrailers, truck campers, and motor homes may have bodies up to 102 inches wide.',
      'Loads of concrete or metal pipe, agricultural products, or unprocessed logs and pulpwood may be up to **108 inches**. Outside mirrors don’t count toward width.',
      'Wider loads need a **special permit** (MCL 257.725). Farm implements of any width may move without a permit, but must minimize disruption and may not go left of center at night, in poor visibility, or where passing is restricted.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      const w = s.car({ kind: 'oversize', color: '#e46f12', label: '12 ft wide · no permit', path: s.P(-200, L.E(0) - 10, 0).to(1800, L.E(0) - 10, 6) });
      w.set(0, 'labelColor', 'bad');
      s.dim(1.6, 4.4, 680, L.E(0) - 42, 680, L.E(0) + 22, '12 ft', { color: '#ffd34d', lx: -70, ly: 0 });
      s.mark(2.2, 4.8, 900, L.top - 100, 'x');
      const t = s.car({ kind: 'semi', color: '#2b5ea8', label: '8½ ft · legal', from: 5.6, path: s.P(-260, L.E(0), 5.6).to(1800, L.E(0), 10.8) });
      t.set(0, 'labelColor', 'good');
      s.dim(7.2, 9.4, 760, L.E(0) - 22, 760, L.E(0) + 22, '8½ ft', { color: '#7cf2a8', lx: -70, ly: 0 });
      s.say(0, 'An oversized load 12 feet wide takes up more than its lane.', 'bad')
        .say(2.2, 'The general limit is 96 inches (8 ft) for the body or load, 102 inches across the tires. This needs a special permit.', 'bad')
        .say(5.8, 'A standard semitrailer at 102 inches (8½ feet) is within the limit for that type of vehicle.', 'good')
        .say(8.6, 'Farm equipment may be wider without a permit, but must stay right of center at night and in poor visibility.');
    },
  });

  LAW.add({
    sec: '718', div: 'size', title: 'Loads sticking out of a car',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A **passenger vehicle** may not carry a load extending beyond the line of the fenders on the **left** side at all.',
      'On the **right** side, a load may extend **no more than 6 inches** beyond the fenders.',
    ],
    dur: 8,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double', zoom: 900 });
      const L = s.lane;
      const left = `${DL.vehicleSVG('car', '#d0452f', {})}<rect x="-44" y="-30" width="66" height="14" rx="3" fill="#c49a68" stroke="#6d4c2c" stroke-width="2"/>`;
      const a = s.thing({ svg: left, label: 'Load sticks out on the left', path: s.P(-100, L.E(0), 0).to(1700, L.E(0), 3.8) });
      a.set(0, 'labelColor', 'bad');
      s.mark(1, 3.8, 800, L.top - 60, 'x');
      const right = `${DL.vehicleSVG('car', '#2f6fd6', {})}<rect x="-30" y="12" width="50" height="6" rx="2" fill="#c49a68" stroke="#6d4c2c" stroke-width="1.5"/>`;
      const b = s.thing({ svg: right, label: 'Within 6 in on the right', labelBelow: true, from: 4, path: s.P(-100, L.E(0), 4).to(1700, L.E(0), 8) });
      b.set(0, 'labelColor', 'good');
      s.mark(5, 8, 800, L.top - 60, 'ok');
      s.say(0, 'A load hanging over the left side of a car could strike oncoming traffic.', 'bad')
        .say(1.4, 'Nothing may extend beyond the left fenders of a passenger vehicle.', 'bad')
        .say(4.4, 'On the right side, a load may stick out up to 6 inches past the fenders.', 'good');
    },
  });

  LAW.add({
    sec: '719', div: 'size', title: 'Height limit: 13 feet 6 inches',
    penalty: 'civil', penaltyText: 'Civil infraction · owner liable for damage',
    rule: [
      'A vehicle, loaded or empty, may not be taller than **13 feet 6 inches**.',
      'The **owner** of a vehicle that strikes a lawfully built bridge or viaduct because of its height is **liable for all resulting damage and injury**, whether or not the clearance was posted.',
      'The section also sets **length** limits: generally 40 feet for a single vehicle, 45 feet for a bus or motor home, 50 feet for a semitrailer in a tractor-semitrailer combination, with longer limits for specified combinations.',
    ],
    dur: 10,
    build(s) {
      s.bg('side');
      const gy = s.lane.ground;
      const P = 20; // px per foot in this scene
      const clear = 13.5 * P;
      s.raw(`<rect x="980" y="${gy - clear}" width="30" height="${clear}" fill="#9aa1a8"/><rect x="1250" y="${gy - clear}" width="30" height="${clear}" fill="#9aa1a8"/>`, { layer: 'bg' });
      s.raw(`<rect x="980" y="${gy - clear - 70}" width="300" height="70" fill="#8d949b" stroke="#5c6268" stroke-width="3"/>
        <rect x="990" y="${gy - clear - 100}" width="280" height="30" fill="#7d8790"/>`, { layer: 'labels' });
      s.sign(900, gy - clear - 40, 'clear', "13'-6\"", { scale: 1.4 });
      const box = (h, col) => `<g><rect x="-260" y="${-h}" width="380" height="${h - 34}" rx="4" fill="#eceae4" stroke="#555" stroke-width="3"/>
        <rect x="124" y="${-150}" width="120" height="116" rx="10" fill="${col}" stroke="#333" stroke-width="3"/><rect x="190" y="-138" width="44" height="46" rx="6" fill="#22313f"/>
        ${K.wheel(-180, 0, 34)}${K.wheel(-110, 0, 34)}${K.wheel(190, 0, 34)}</g>`;
      s.thing({ svg: box(14 * P, '#d0452f'), path: s.P(-300, gy, 0).to(860, gy, 3, 'out').wait(10) });
      s.boom(3, 990, gy - clear, { text: 'CRUNCH', hold: 1.2 });
      s.dim(3.4, 10, 560, gy, 560, gy - 14 * P, '14 ft', { color: '#d63a2f', lx: -56, ly: 0, bg: '#d63a2f' });
      s.dim(0.6, 10, 1320, gy, 1320, gy - clear, "13'6\"", { color: '#18202a', lx: 60, ly: 0 });
      s.mark(3.6, 10, 760, gy - 14 * P - 70, 'x');
      s.say(0, 'A 14-foot-tall box truck heads toward an overpass with 13 feet 6 inches of clearance.')
        .say(3, 'It strikes the bridge.', 'bad')
        .say(4.2, 'The maximum vehicle height in Michigan is 13 feet 6 inches, loaded or empty.', 'warn')
        .say(6.6, 'The owner is liable for all damage and injuries caused, whether or not the clearance was posted.', 'warn');
    },
  });

  LAW.add({
    sec: '720', div: 'size', title: 'Secure your load',
    penalty: 'misd', penaltyText: 'Misdemeanor · up to 90 days / $500',
    rule: [
      'A vehicle must be built or loaded so its contents can’t **drop, sift, leak, blow off, or otherwise escape**. Tailgates, faucets, and taps must be closed, loaded or empty, with no holes or cracks material can escape through.',
      'A load that isn’t completely enclosed must be **covered with a firmly secured tarp** (or similar), or **fastened** to the vehicle with enough binders of adequate strength.',
      'Proof of actual spillage isn’t needed. Whoever loads a vehicle knowing it will be driven on a highway is also liable.',
      'Exceptions include certain farm products and residue, ice and snow removal vehicles, heavy items that can’t fall off, and work-zone equipment. Violations are misdemeanors (up to 90 days and/or $500).',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      const tk = s.car({ kind: 'dump', color: '#d88a0f', label: 'Uncovered gravel', path: s.P(-200, L.E(0), 0).to(1800, L.E(0), 6) });
      tk.set(0, 'labelColor', 'bad');
      const c = s.car({ kind: 'car', color: COL.you, path: s.P(-420, L.E(0), 0).to(1580, L.E(0), 6) });
      for (let i = 0; i < 9; i++) {
        const t0 = 0.8 + i * 0.5, x0 = -200 + (2000 / 6) * t0 - 60;
        s.thing({ svg: `<circle r="${3 + (i % 3)}" fill="#6b6f75"/>`, from: t0, until: t0 + 0.7, path: s.P(x0, L.E(0) + ((i % 3) - 1) * 8, t0).to(x0 - 30 + (i % 2) * 20, L.E(0) + ((i % 3) - 1) * 18, t0 + 0.7) });
      }
      s.note(2.4, 5, 0, 0, 'Rocks hitting the car behind', 'bad', { follow: c, dy: -110 });
      const cov = `${DL.vehicleSVG('dump', '#d88a0f', {})}<rect x="-54" y="-17" width="68" height="34" rx="3" fill="#3f6f3f"/><path d="M -54 -17 L 14 17 M -54 17 L 14 -17" stroke="#2c4f2c" stroke-width="2"/>`;
      const t2 = s.thing({ svg: cov, kind: 'dump', label: 'Tarp secured', from: 6.2, path: s.P(-200, L.E(0), 6.2).to(1800, L.E(0), 11) });
      t2.set(0, 'labelColor', 'good');
      s.say(0, 'A dump truck hauls gravel with no cover.', 'bad')
        .say(1.6, 'Stones bounce out and pelt the car behind. A cracked windshield, or worse.', 'bad')
        .say(4, 'Loads must not drop, sift, leak, or blow off. Spillage doesn’t even have to be proven.', 'warn')
        .say(6.6, 'An open load must be covered with a secured tarp or fastened down with binders.', 'good');
    },
  });

  LAW.add({
    sec: '721', div: 'size', title: 'Towing: hitches, safety chains, and flags',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A passenger vehicle or pickup may tow **only one** vehicle or trailer (a pickup with a proper fifth-wheel RV may tow one more under strict conditions, up to 75 feet total).',
      'The drawbar or connection may not exceed **15 feet**. If it’s a **chain, rope, or cable**, display a **red flag** at least 12 inches square on it.',
      'The towed vehicle must track within **3 inches** of the towing vehicle’s path, and be connected with **safety chains** (or devices) on each side of the coupling, strong enough to haul the load.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed', zoom: 1000 });
      const L = s.lane;
      const a = s.car({ kind: 'trailer', color: '#d0452f', label: 'No safety chains', path: s.P(-200, L.E(0), 0).to(1800, L.E(0), 4.4) });
      a.set(0, 'chains', false).set(0, 'labelColor', 'bad');
      s.mark(1.2, 4.4, 800, L.top - 70, 'x');
      const b = s.car({ kind: 'trailer', color: COL.you, label: 'Safety chains on both sides', from: 4.4, path: s.P(-200, L.E(0), 4.4).to(1800, L.E(0), 8) });
      b.set(0, 'labelColor', 'good');
      s.mark(5.4, 8, 800, L.top - 70, 'ok');
      s.car({ kind: 'pickup', color: COL.gray, from: 8, path: s.P(-100, L.E(0), 8).to(1300, L.E(0), 11) });
      s.thing({ svg: `${DL.vehicleSVG('car', '#8a8f96', {})}<line x1="32" y1="0" x2="76" y2="0" stroke="#c9b48a" stroke-width="3"/><rect x="48" y="-16" width="14" height="14" fill="#e3261f"/>`, label: 'Towed by rope, red flag', labelBelow: true, from: 8, path: s.P(-210, L.E(0), 8).to(1190, L.E(0), 11) });
      s.say(0, 'A trailer hitched with no safety chains. If the hitch fails, nothing holds it.', 'bad')
        .say(4.6, 'Safety chains on each side of the coupling, strong enough to haul the loaded trailer.', 'good')
        .say(8.2, 'Towing with a chain, rope, or cable: keep it 15 feet or shorter and tie a red flag at least 12 inches square on it.', 'good');
    },
  });

  LAW.add({
    sec: '724', div: 'size', title: 'Weigh stations and overweight loads',
    penalty: 'mixed', penaltyText: 'Civil infraction · misdemeanor for refusing an ordered weighing',
    rule: [
      'A police officer, or an authorized agent of MDOT or a county road commission, with reason to believe a vehicle is overweight may require the driver to **stop and be weighed** on portable or fixed scales, or drive to the nearest **weigh station**.',
      'If overweight, the driver may be held until enough load is **shifted or removed** to meet the axle limits. Overweight loads bring per-pound civil fines, and the vehicle may be held until fines are paid.',
      'A truck that **fails to stop at or bypasses** an open scale or weigh station: civil infraction. Knowingly refusing an ordered stop for portable-scale weighing: **misdemeanor**.',
    ],
    dur: 12,
    build(s) {
      s.bg('freeway', { lanes: 2, median: 60, medianType: 'grass' });
      const L = s.lane;
      s.raw(`<path d="M 300 ${L.bot} C 420 ${L.bot + 30}, 520 ${L.bot + 110}, 700 ${L.bot + 110} L 1000 ${L.bot + 110} C 1180 ${L.bot + 110}, 1280 ${L.bot + 30}, 1400 ${L.bot}" stroke="#55595f" stroke-width="56" fill="none"/>`, { layer: 'bg' });
      s.prop(850, L.bot + 110, 'scale', { w: 240 });
      s.prop(850, L.bot + 190, 'bldg', { w: 220, h: 70, c: '#7d8790', label: 'WEIGH STATION' });
      s.sign(220, L.bot + 90, 'text', 'WEIGH STATION OPEN');
      const t1 = s.car({ kind: 'semi', color: '#2b5ea8', label: 'Pulls in to weigh', path: s.P(-260, L.E(0), 0).to(300, L.E(0), 1.8).curve(420, L.E(0) + 4, 560, L.bot + 100, 2.8).to(850, L.bot + 110, 4, 'out').wait(12) });
      t1.set(1.2, 'sig', 'R').set(2.8, 'sig', null).set(0, 'labelColor', 'good');
      const disp = `<g transform="translate(1180,${L.top - 40})"><rect x="-190" y="-50" width="380" height="100" rx="12" fill="#111" stroke="#ff5a4f" stroke-width="4"/>
        <text y="-10" text-anchor="middle" font-size="22" font-weight="800" fill="#ddd" ${F}>GROSS 86,400 LBS</text><text y="30" text-anchor="middle" font-size="26" font-weight="900" fill="#ff5a4f" ${F}>OVER AXLE LIMIT</text></g>`;
      s.raw(disp, { t0: 4.4, layer: 'fx', fade: 0.3 });
      const t2 = s.car({ kind: 'semi', color: '#7a4b2a', label: 'Bypasses the open scale', path: s.P(-260, L.E(1), 4.6).to(1800, L.E(1), 9.6) });
      t2.set(0, 'labelColor', 'bad');
      const p = s.car({ kind: 'police', from: 6.4, path: s.P(-200, L.E(1), 6.4).to(1800, L.E(1), 10.6) });
      p.set(6.4, 'lights', 'police');
      s.say(0, 'The weigh station is open.')
        .say(1.6, 'This truck exits and rolls onto the scale.', 'good')
        .say(4.4, 'It’s over the axle limit, so the driver may have to shift or remove part of the load before going on, and the owner faces per-pound fines.', 'warn')
        .say(6.2, 'This truck bypasses the open scale: a civil infraction. Refusing an officer’s order to be weighed is a misdemeanor.', 'bad');
    },
  });

  LAW.add({
    sec: '725', div: 'size', title: 'Special permits for oversize or overweight loads',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'For good cause, MDOT, a county road commission, or a local authority (the “jurisdictional authority”) may issue a written **special permit** to move a vehicle or load exceeding the size or weight limits on roads it maintains.',
      'The application must describe the vehicle, load, and specific highways. The permit states the trips and dates it covers and may impose conditions (such as routes, times, escorts, lights) to protect safety and the roads, plus inspection fees or security for damage.',
      'MDOT fees: **$50** for a single trip, **$100** for multiple trips or an annual permit (other amounts for certain permits). Farm machinery permits cost only administrative costs.',
      'Operating without a required permit, or outside its terms, is a civil infraction.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      const lead = s.car({ kind: 'pickup', color: '#eceae4', label: 'Escort', path: s.P(-60, L.E(0), 0).to(1900, L.E(0), 9) });
      lead.set(0, 'lights', 'amber');
      const w = s.car({ kind: 'oversize', color: '#e46f12', label: 'Oversize load · permitted', path: s.P(-360, L.E(0) - 10, 0).to(1600, L.E(0) - 10, 9) });
      w.set(0, 'labelColor', 'good').set(0, 'lights', 'amber');
      const tail = s.car({ kind: 'pickup', color: '#eceae4', label: 'Escort', path: s.P(-620, L.E(0), 0).to(1340, L.E(0), 9) });
      tail.set(0, 'lights', 'amber');
      s.raw(`<g transform="translate(1130,260) rotate(-3)"><rect x="-220" y="-110" width="440" height="220" rx="12" fill="#fffdf4" stroke="#c9b98a" stroke-width="3"/>
        <rect x="-220" y="-110" width="440" height="50" rx="12" fill="#0b6e3d"/><rect x="-220" y="-76" width="440" height="16" fill="#0b6e3d"/>
        <text y="-76" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" ${F}>MDOT SPECIAL PERMIT</text>
        <text x="-196" y="-24" font-size="20" font-weight="600" fill="#26313d" ${F}>Load: 14 ft wide transformer</text>
        <text x="-196" y="10" font-size="20" font-weight="600" fill="#26313d" ${F}>Route: M-46 to I-69 only</text>
        <text x="-196" y="44" font-size="20" font-weight="600" fill="#26313d" ${F}>Daylight, weekdays · 2 escorts</text>
        <text x="-196" y="78" font-size="20" font-weight="600" fill="#26313d" ${F}>Single trip · fee $50</text></g>`, { t0: 2.4, layer: 'fx', fade: 0.4 });
      s.say(0, 'An oversize load moves with escort vehicles front and rear.')
        .say(2.4, 'It can only travel under a written special permit from the road authority.', 'good')
        .say(5, 'The permit lists the vehicle, load, route, and dates, and can set conditions like daylight-only travel or escorts.', 'info')
        .say(8, 'Going outside the permit’s terms, or moving the load without one, is a civil infraction.', 'warn');
    },
  });
})();
