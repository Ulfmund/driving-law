/* Motorcycles, mopeds, and low-speed vehicles: MCL 257.658 – 257.661a; automated vehicles: 257.665 */
(function () {
  const { COL } = K;
  const F = 'font-family="system-ui,Segoe UI,Arial"';

  // Side-view rider on a motorcycle drawn by K.sideMoto at the same x / ground.
  function rider(x, gy, o = {}) {
    const dx = o.dx || 0, sc = o.sc || 1;
    const hx = x - 20 + dx, hy = gy - 72;
    const helmet = o.helmet
      ? `<path d="M ${hx + 14 * sc - 20 * sc} ${hy - 70 * sc} a ${21 * sc} ${21 * sc} 0 0 1 ${42 * sc} 0 v ${8 * sc} h ${-42 * sc} z" fill="${o.hc || '#1d1f23'}"/><rect x="${hx + 14 * sc + 4 * sc}" y="${hy - 74 * sc}" width="${18 * sc}" height="${9 * sc}" rx="3" fill="#7fb6e6" opacity=".85"/>`
      : `<path d="M ${hx + 14 * sc - 14 * sc} ${hy - 82 * sc} q ${14 * sc} ${-12 * sc} ${28 * sc} 0" stroke="#5a3a22" stroke-width="${8 * sc}" fill="none"/>`;
    return `<g>
      <path d="M ${hx} ${hy} L ${hx + 26 * sc} ${hy + 26 * sc} L ${hx + 30 * sc} ${gy - (o.feet != null ? o.feet : 36)}" stroke="#2d3b55" stroke-width="${15 * sc}" fill="none" stroke-linecap="round"/>
      <path d="M ${hx} ${hy} L ${hx + 12 * sc} ${hy - 56 * sc}" stroke="${o.shirt || '#5b6fb5'}" stroke-width="${24 * sc}" stroke-linecap="round"/>
      ${o.arm !== false ? `<path d="M ${hx + 10 * sc} ${hy - 46 * sc} L ${o.armX ?? hx + 58 * sc} ${o.armY ?? hy - 30 * sc}" stroke="${o.shirt || '#5b6fb5'}" stroke-width="${10 * sc}" stroke-linecap="round"/>` : ''}
      <circle cx="${hx + 14 * sc}" cy="${hy - 70 * sc}" r="${17 * sc}" fill="#e0b48c"/>
      ${helmet}
    </g>`;
  }

  LAW.add({
    sec: '658', div: 'moto', title: 'Motorcycle and moped riders, passengers, and helmets',
    penalty: 'civil', penaltyText: 'Civil infraction (MCL 257.656)',
    rule: [
      'Ride only **astride a permanent, regular seat**, and don’t carry more people than the motorcycle is designed and equipped for.',
      'Motorcycle operators and riders must wear an approved **crash helmet**. Moped and electric skateboard operators **under 19** must too.',
      'Exception: a person **21 or older** may ride without a helmet if they have had a motorcycle endorsement for **2+ years** or passed an approved safety course, **and** the operator or rider carries at least **$20,000** in first-party medical coverage for motorcycle crashes. A passenger 21+ may go without one if that coverage requirement is met.',
      'An **autocycle** with a roof meeting helmet standards is exempt from the helmet rule, but its occupants must wear seat belts.',
    ],
    dur: 13,
    build(s) {
      s.bg('side');
      const gy = s.lane.ground;
      const at = [300, 800, 1300];
      s.raw(K.sideMoto(at[0], gy, { color: '#c0392b' }) + rider(at[0], gy, { helmet: false, shirt: '#3f8f5c' }), { layer: 'actors' });
      s.raw(K.sideMoto(at[1], gy, { color: '#2f6fd6' }) + rider(at[1], gy, { helmet: false, shirt: '#8a5a3b' }), { layer: 'actors' });
      s.raw(K.sideMoto(at[2], gy, { color: '#7d8790' }) + rider(at[2], gy, { helmet: true, shirt: '#2b2e33' }) + rider(at[2], gy, { helmet: true, dx: -46, shirt: '#8457c4', armX: at[2] - 30, armY: gy - 120 }), { layer: 'actors' });
      const card = (x, lines, t0) => s.raw(`<g transform="translate(${x},250)"><rect x="-190" y="-90" width="380" height="${40 + lines.length * 34}" rx="14" fill="#18202a" stroke="rgba(255,255,255,.2)" stroke-width="2"/>
        ${lines.map((l, i) => `<text x="0" y="${-50 + i * 34}" text-anchor="middle" font-size="${i ? 22 : 26}" font-weight="${i ? 600 : 800}" fill="#fff" ${F}>${l}</text>`).join('')}</g>`, { t0, layer: 'fx', fade: 0.3 });
      card(at[0], ['Age 19, no helmet', 'Under 21: helmet required'], 0.4);
      s.mark(1.6, 13, at[0], 400, 'x', { r: 40 });
      card(at[1], ['Age 30, no helmet', '2+ yrs endorsement ✓', '$20,000 medical coverage ✓'], 4);
      s.mark(5.6, 13, at[1], 400, 'ok', { r: 40 });
      card(at[2], ['Rider + passenger', 'Both helmeted', 'Seat & footrest for each'], 8.4);
      s.mark(9.6, 13, at[2], 400, 'ok', { r: 40 });
      s.say(0, 'Motorcycle riders must wear an approved crash helmet, with one exception.')
        .say(1.6, 'This 19-year-old has no helmet. Under 21, there’s no exception.', 'bad')
        .say(4, 'This rider is 30, has had a motorcycle endorsement for over 2 years, and carries $20,000 in medical coverage, so the helmet is optional.', 'good')
        .say(8.4, 'Carry only as many people as the bike is built for, each astride a permanent seat.', 'good')
        .say(10.8, 'Moped and electric skateboard riders under 19 must also wear helmets.');
    },
  });

  LAW.add({
    sec: '658a', div: 'moto', title: 'Motorcycle seats and footrests',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A motorcycle must have adequate **seats and securely attached footrests or pegs** for each designated seating position.',
      'A passenger may not ride unless their **feet can rest on the assigned footrests**, except someone who can’t reach them because of a permanent physical disability.',
    ],
    dur: 9,
    build(s) {
      s.bg('side');
      const gy = s.lane.ground;
      s.view([[0, 810, 540, 1250]]);
      s.raw(K.sideMoto(480, gy) + rider(480, gy, { helmet: true }) + rider(480, gy, { helmet: true, dx: -42, sc: 0.62, shirt: '#e05d8e', feet: 70, armX: 440, armY: gy - 110 }), { layer: 'actors' });
      s.raw(`<circle cx="490" cy="${gy - 36}" r="7" fill="#ffd34d"/><line x1="452" y1="${gy - 66}" x2="490" y2="${gy - 38}" stroke="#ffd34d" stroke-width="3" stroke-dasharray="6 5"/>`, { layer: 'fx' });
      s.text(0.6, 9, 480, 300, 'Feet can’t reach the pegs', { size: 30, color: '#18202a' });
      s.mark(1.4, 9, 480, 360, 'x', { r: 40 });
      s.raw(K.sideMoto(1140, gy, { color: '#2f6fd6' }) + rider(1140, gy, { helmet: true }) + rider(1140, gy, { helmet: true, dx: -46, shirt: '#8457c4', armX: 1110, armY: gy - 120 }), { layer: 'actors' });
      s.text(4, 9, 1140, 300, 'Feet on the footrests', { size: 30, color: '#18202a' });
      s.mark(4.6, 9, 1140, 360, 'ok', { r: 40 });
      s.say(0, 'Every seating position needs a seat and securely attached footrests.')
        .say(1.4, 'This child passenger’s feet don’t reach the pegs, so they may not ride.', 'bad')
        .say(4.4, 'This passenger can rest their feet on the footrests.', 'good')
        .say(6.6, 'The only exception is a person who can’t reach them because of a permanent physical disability.');
    },
  });

  LAW.add({
    sec: '658b', div: 'moto', title: 'Helmets in low-speed vehicles',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Anyone operating or riding in a **low-speed vehicle** (a small electric vehicle with a top speed of 20–25 mph) must wear a crash helmet meeting State Police rules.',
      'Exception: the vehicle has a **roof** that meets federal roof-crush standards (49 CFR 571.500).',
    ],
    dur: 9,
    build(s) {
      s.bg('side');
      const gy = s.lane.ground;
      const lsv = (x, roof, helmet) => `<g>
        ${K.wheel(x - 90, gy, 26)}${K.wheel(x + 90, gy, 26)}
        <rect x="${x - 140}" y="${gy - 90}" width="280" height="50" rx="16" fill="#eceae4" stroke="#888" stroke-width="2"/>
        <rect x="${x - 60}" y="${gy - 130}" width="70" height="44" rx="10" fill="#3c4a5a"/>
        ${roof ? `<rect x="${x - 120}" y="${gy - 230}" width="230" height="16" rx="6" fill="#eceae4" stroke="#888" stroke-width="2"/><rect x="${x - 112}" y="${gy - 220}" width="8" height="130" fill="#888"/><rect x="${x + 96}" y="${gy - 220}" width="8" height="130" fill="#888"/>` : ''}
        ${rider(x + 30, gy - 20, { helmet, shirt: '#2a9d9a', arm: true, armX: x + 70, armY: gy - 130, feet: 60 })}
      </g>`;
      s.view([[0, 800, 540, 1250]]);
      s.raw(lsv(480, false, false), { layer: 'actors' });
      s.text(0.4, 9, 480, 300, 'No roof, no helmet', { size: 30, color: '#18202a' });
      s.mark(1.2, 9, 480, 360, 'x', { r: 40 });
      s.raw(lsv(1120, true, false), { layer: 'actors' });
      s.text(3.8, 9, 1120, 300, 'Approved roof, no helmet', { size: 30, color: '#18202a' });
      s.mark(4.6, 9, 1120, 360, 'ok', { r: 40 });
      s.say(0, 'Low-speed vehicles look like golf carts but are street-legal on many local roads.')
        .say(1.2, 'Without a qualifying roof, everyone on board must wear a crash helmet.', 'bad')
        .say(4, 'With a roof meeting the federal roof-crush standard, helmets aren’t required.', 'good');
    },
  });

  LAW.add({
    sec: '659', div: 'moto', title: 'No hitching rides on vehicles',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A person riding a **bicycle, moped, motorcycle**, coaster, roller skates, sled, or toy vehicle may not attach it, or themselves, to a streetcar or other vehicle on a roadway.',
    ],
    dur: 8,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      s.car({ kind: 'truck', color: '#7d8790', path: s.P(-200, L.E(0), 0).to(1800, L.E(0), 7.4) });
      const m = s.car({ kind: 'moto', color: '#d0452f', label: 'Holding onto the truck', path: s.P(-200 - 80, L.E(0) + 10, 0).to(1800 - 80, L.E(0) + 10, 7.4) });
      m.set(0, 'labelColor', 'bad');
      s.mark(2.2, 7.4, 0, 0, 'x', { follow: m });
      s.say(0, 'A moped rider grabs the back of a moving truck to get pulled along.', 'bad')
        .say(2.4, 'Attaching yourself, or your bike, moped, motorcycle, skates, or sled, to a moving vehicle is prohibited.', 'bad');
    },
  });

  LAW.add({
    sec: '660', div: 'moto', title: 'Motorcycles, mopeds, and low-speed vehicles in traffic',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A **motorcycle is entitled to the full use of a lane**, and no motor vehicle may be driven so as to deprive it of that.',
      'Motorcycles, mopeds, low-speed vehicles, and similar devices may not ride **more than 2 abreast** or **pass between lines of traffic** (no lane-splitting). They may pass on the left in an unoccupied lane.',
      'Mopeds and low-speed vehicles ride as near the right side as practicable, and may not be driven on sidewalks.',
      'Low-speed vehicles may not exceed **25 mph** or use roads with limits over **35 mph**, except to cross them.',
    ],
    dur: 14,
    build(s) {
      s.bg('road', { lanes: 2, vy: 500 });
      const L = s.lane;
      s.car({ kind: 'moto', color: '#2f6fd6', label: 'Motorcycle', labelBelow: true, path: s.P(-100, L.E(0), 0).to(1760, L.E(0), 5.4) });
      const c = s.car({ kind: 'car', color: COL.red, path: s.P(-300, L.E(1), 0).to(380, L.E(1), 1.6).curve(480, L.E(1), 560, L.E(0) - 20, 2.2).to(1100, L.E(0) - 20, 3.4).curve(1200, L.E(0) - 20, 1260, L.E(1), 3.8).to(1800, L.E(1), 4.8) });
      c.set(2, 'label', 'Squeezes into the bike’s lane').set(2, 'labelColor', 'bad').set(3.8, 'label', null);
      s.mark(2.4, 4.4, 820, L.bot + 90, 'x');
      [[200, L.E(1)], [330, L.E(1)], [210, L.E(0)], [340, L.E(0)], [470, L.E(0)], [460, L.E(1)]].forEach(([x, y], i) => {
        const v = s.car({ kind: i % 2 ? 'suv' : 'car', color: [COL.gray, COL.white, COL.gold, COL.teal, COL.purple, COL.green][i], from: 5.4, path: s.P(x + 200, y, 5.4).to(x + 380, y, 9.6) });
        v.set(5.4, 'brake', true);
      });
      const sp = s.car({ kind: 'moto', color: '#e3a72a', from: 5.4, path: s.P(-80, L.y + 64, 5.6).to(1760, L.y + 64, 9) });
      sp.set(5.8, 'label', 'Lane-splitting').set(5.8, 'labelColor', 'bad').set(8.2, 'label', null);
      s.mark(7, 9.4, 760, L.top - 70, 'x');
      s.car({ kind: 'moto', color: '#3f8f5c', from: 9.6, path: s.P(-80, L.E(0) - 14, 9.6).to(1760, L.E(0) - 14, 13.6) });
      const two = s.car({ kind: 'moto', color: '#8457c4', from: 9.6, label: 'Two abreast: OK', labelBelow: true, path: s.P(-80, L.E(0) + 14, 9.6).to(1760, L.E(0) + 14, 13.6) });
      two.set(0, 'labelColor', 'good');
      s.say(0, 'A motorcycle is entitled to the full use of its lane.')
        .say(2, 'Squeezing a car into the motorcycle’s lane deprives it of that.', 'bad')
        .say(5.8, 'Riding between lines of traffic, or lane-splitting, is not allowed in Michigan.', 'bad')
        .say(9.8, 'Riding up to 2 abreast in a lane is allowed. 3 or more is not.', 'good')
        .say(11.8, 'Low-speed vehicles: 25 mph max, and only on roads with limits of 35 mph or less (except to cross).');
    },
  });

  LAW.add({
    sec: '661a', div: 'moto', title: 'Motorcycle handlebar height',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A motorcycle or moped may not be operated on a public highway with handlebars higher than **30 inches** above the lowest point of the undepressed saddle to the highest point of the operator’s hand grip.',
    ],
    dur: 8,
    build(s) {
      s.bg('side');
      const gy = s.lane.ground;
      const ppi = K.PX / 12;
      s.view([[0, 820, 560, 1000]]);
      s.raw(K.sideMoto(480, gy, { bar: 38, color: '#c0392b' }), { layer: 'actors' });
      s.raw(K.sideMoto(1120, gy, { bar: 14, color: '#2f6fd6' }), { layer: 'actors' });
      const seat = gy - 64;
      s.dim(0.6, 8, 600, seat, 600, seat - 38 * ppi, '38 in', { color: '#d63a2f', lx: 52, ly: 0, bg: '#d63a2f' });
      s.dim(0.6, 8, 600 + 40, seat, 600 + 40, seat - 30 * ppi, '30 in max', { color: '#ffd34d', lx: 70, ly: 0 });
      s.dim(2.8, 8, 1240, seat, 1240, seat - 14 * ppi, '14 in', { color: '#1f9d55', lx: 52, ly: 0, bg: '#1f9d55' });
      s.raw(`<line x1="380" y1="${seat}" x2="680" y2="${seat}" stroke="#18202a" stroke-width="2" stroke-dasharray="8 6"/><line x1="1020" y1="${seat}" x2="1300" y2="${seat}" stroke="#18202a" stroke-width="2" stroke-dasharray="8 6"/>`, { layer: 'fx' });
      s.mark(1.4, 8, 480, 420, 'x', { r: 40 });
      s.mark(3.4, 8, 1120, 420, 'ok', { r: 40 });
      s.say(0, 'Measure from the lowest point of the seat (not pressed down) to the top of the hand grips.')
        .say(1.4, '“Ape hanger” bars 38 inches above the seat exceed the 30-inch maximum.', 'bad')
        .say(3.4, 'Standard bars, 14 inches up, are fine.', 'good');
    },
  });

  LAW.add({
    sec: '665', div: 'av', title: 'Automated vehicles',
    penalty: 'none', penaltyText: 'Rules for operation and testing',
    rule: [
      'An **automated motor vehicle** may be operated on Michigan streets and highways.',
      'When an automated driving system capable of operating without a human is engaged, **the system is considered the driver** for purposes of the traffic laws.',
      'Before testing on public roads, a manufacturer or upfitter must prove insurance, and test operators must be authorized, licensed, and able to monitor and take control, or the vehicle must be able to reach a minimal-risk condition on its own.',
      'Truck **platoons** may operate after a plan is filed with the State Police and MDOT.',
    ],
    dur: 10,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      s.sign(...L.corner('E'), 'stop'); s.sign(...L.corner('W'), 'stop');
      const sensor = `<g>${DL.vehicleSVG('car', '#eceae4', {})}<circle cx="-4" cy="0" r="8" fill="#2a2f36"/><circle cx="-4" cy="0" r="4" fill="#5ad0ff"/></g>`;
      const av = s.thing({ svg: sensor, label: 'No one in the driver’s seat', path: s.P(-100, L.E(0), 0).to(L.stopAt('E'), L.E(0), 2.6, 'out').wait(4.6).to(1760, L.E(0), 7.6, 'in') });
      void av;
      s.car({ kind: 'car', color: COL.gold, path: s.P(L.N(0), 1000, 1.6).to(L.N(0), -120, 5) });
      s.raw(`<g transform="translate(1180,240)"><rect x="-230" y="-70" width="460" height="140" rx="16" fill="#18202a" stroke="#5ad0ff" stroke-width="3"/>
        <text y="-18" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" ${F}>Automated driving system</text>
        <text y="22" text-anchor="middle" font-size="24" font-weight="600" fill="#5ad0ff" ${F}>= the legal “driver”</text></g>`, { t0: 2.8, layer: 'fx', fade: 0.4 });
      s.say(0, 'An automated vehicle with no human driver approaches a stop sign.')
        .say(2.8, 'When an automated driving system is engaged, the system itself is the driver under the traffic laws.', 'info')
        .say(5, 'It must stop, yield, and obey every rule a human driver would.', 'good')
        .say(7.6, 'Testing on public roads requires insurance and authorized monitors who can take control if needed.');
    },
  });
})();
