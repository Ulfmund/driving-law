/* Miscellaneous rules: MCL 257.676 – 257.682c */
(function () {
  const { COL } = K;
  const F = 'font-family="system-ui,Segoe UI,Arial"';
  const FT = DL.FT;

  LAW.add({
    sec: '676', div: 'misc', title: 'Leaving a vehicle unattended',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Don’t leave a motor vehicle standing **unattended** on a highway without: setting the **parking brake or shifting into park**, **stopping the engine**, and **removing the ignition key** and taking it with you.',
      'On a **grade**, turn the **front wheels to the curb** or side of the road.',
      'Exception: a vehicle running with its **remote start** feature engaged.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, curb: true, parking: true, center: 'double', city: true });
      const L = s.lane;
      s.text(0, 11, 300, L.y + 8, '⬇ downhill ⬇', { size: 22, color: '#f3f3f0', rot: -90, op: 0.8 });
      s.raw(`<g transform="translate(828,${L.parkE - 16}) rotate(28)"><rect x="-8" y="-4" width="16" height="8" rx="2" fill="#111"/></g><g transform="translate(828,${L.parkE + 16}) rotate(28)"><rect x="-8" y="-4" width="16" height="8" rx="2" fill="#111"/></g>`, { t0: 8.8, layer: 'marks' });
      s.car({ kind: 'car', color: COL.you, at: [800, L.parkE, 0] });
      for (let i = 0; i < 3; i++) s.raw(`<circle cx="${752 - i * 22}" cy="${L.parkE + 8 - i * 6}" r="${8 + i * 4}" fill="#c9ced4" opacity="${0.7 - i * 0.18}"/>`, { t0: 0, t1: 4.6, fade: 0.3 });
      const d = s.person({ kind: 'driver', color: '#5b6fb5', path: s.P(800, L.curbE + 26, 0.6).to(1240, L.curbE + 26, 3.4) });
      d.set(3.6, 'show', false);
      s.note(0.6, 4.6, 800, L.parkE, 'Engine running, key inside', 'bad', { dy: -150 });
      s.mark(1.4, 4.6, 940, L.parkE - 160, 'x');
      const x0 = 380;
      s.raw(K.checkRow(x0, 220, 'In park / parking brake set', true, { w: 400 }), { t0: 5.2, layer: 'fx', fade: 0.3 });
      s.raw(K.checkRow(x0 + 420, 220, 'Engine off', true, { w: 400 }), { t0: 6.4, layer: 'fx', fade: 0.3 });
      s.raw(K.checkRow(x0, 290, 'Key removed and taken', true, { w: 400 }), { t0: 7.6, layer: 'fx', fade: 0.3 });
      s.raw(K.checkRow(x0 + 420, 290, 'On a hill: wheels to curb', true, { w: 400 }), { t0: 8.8, layer: 'fx', fade: 0.3 });
      s.say(0, 'A driver runs into a shop, leaving the car running with the key in it.', 'bad')
        .say(2.4, 'Leaving a vehicle unattended like this is a civil infraction (unless it’s a remote start).', 'bad')
        .say(5.2, 'Before walking away: shift into park or set the parking brake…', 'good')
        .say(6.4, '…stop the engine…', 'good')
        .say(7.6, '…remove the key and take it with you…', 'good')
        .say(8.8, '…and on a hill, turn the front wheels toward the curb.', 'good');
    },
  });

  LAW.add({
    sec: '677', div: 'misc', title: 'Obstructing the driver’s view or control',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Don’t drive when the load, or the number of people in the front seat, **obstructs your view** to the front or sides or **interferes with your control** of the vehicle.',
      'A passenger may not ride in a position that interferes with the driver’s view ahead or to the sides, or with the driver’s control.',
    ],
    dur: 10,
    build(s) {
      s.bg('cabin');
      const S = s.lane.seats;
      const crowd = K.occupant(...S.driver, { belt: false }) + K.occupant(985, 420, { age: 'teen', color: '#e05d8e' }) + K.occupant(...S.front, { color: '#3f8f5c' }) +
        `<g><rect x="930" y="600" width="110" height="80" rx="6" fill="#b08355" stroke="#6d4c2c" stroke-width="3"/><rect x="960" y="560" width="90" height="70" rx="6" fill="#c49a68" stroke="#6d4c2c" stroke-width="3"/></g>`;
      s.raw(crowd, { t0: 0, t1: 5.2, layer: 'actors', fade: 0.3 });
      s.raw(`<path d="M 1000 300 L 1300 160 M 1000 360 L 1300 600" stroke="#ffd34d" stroke-width="4" stroke-dasharray="10 8"/>`, { t0: 1.2, t1: 5.2, layer: 'fx', fade: 0.3 });
      s.mark(1.6, 5.2, 1180, 450, 'x', { r: 44 });
      s.raw(K.occupant(...S.driver, { belt: true }) + K.occupant(...S.front, { belt: true, color: '#3f8f5c' }) + K.occupant(...S.rearL, { belt: true, age: 'teen', color: '#e05d8e' }) +
        `<rect x="430" y="520" width="80" height="70" rx="6" fill="#c49a68" stroke="#6d4c2c" stroke-width="3"/>`, { t0: 5.4, layer: 'actors', fade: 0.3 });
      s.mark(6, 10, 1180, 450, 'ok', { r: 44 });
      s.say(0, 'Three people squeezed into the front, one pressed against the driver, and boxes piled on the dash.', 'bad')
        .say(1.6, 'They block the driver’s view to the front and sides and crowd the controls.', 'bad')
        .say(5.6, 'Everyone in a proper seat, cargo out of the way: the driver has a clear view and full control.', 'good');
    },
  });

  LAW.add({
    sec: '678', div: 'misc', title: 'No coasting downhill in neutral',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'When going **downhill**, a driver may not **coast with the gears in neutral**.',
      'A commercial vehicle driver may not coast downhill with the **clutch disengaged**.',
    ],
    dur: 9,
    build(s) {
      s.bg('blank', { fill: '#cfe6f7' });
      s.raw(`<rect width="1600" height="900" fill="url(#sky)"/><path d="M 0 360 L 1600 760 L 1600 900 L 0 900 Z" fill="#8fb878"/><path d="M 0 360 L 1600 760 L 1600 800 L 0 400 Z" fill="#55595f"/>
        <path d="M 0 380 L 1600 780" stroke="#f2c230" stroke-width="4" stroke-dasharray="40 30"/>`, { layer: 'bg' });
      const slope = (x) => 360 + (x / 1600) * 400;
      const carSvg = K.sideCar(0, 0, COL.red);
      const c1 = s.thing({ svg: carSvg, label: 'Gear: NEUTRAL', labelDy: 110, path: s.P(-200, slope(-200), 0).to(1800, slope(1800), 4.2, 'in') });
      c1.set(0, 'labelColor', 'bad').set(4.2, 'show', false);
      const c2 = s.thing({ svg: K.sideCar(0, 0, COL.you), label: 'Gear: DRIVE', labelDy: 110, from: 4.4, path: s.P(-200, slope(-200), 4.4).to(1800, slope(1800), 8.8) });
      c2.set(0, 'labelColor', 'good');
      const gear = (g, col) => `<g transform="translate(1280,170)"><rect x="-120" y="-90" width="240" height="180" rx="18" fill="#18202a"/><text x="-60" y="10" text-anchor="middle" font-size="34" font-weight="800" fill="#888" ${F}>P R</text><text x="40" y="22" text-anchor="middle" font-size="72" font-weight="900" fill="${col}" ${F}>${g}</text></g>`;
      s.raw(gear('N', '#ff5a4f'), { t0: 0, t1: 4.3, layer: 'fx' });
      s.raw(gear('D', '#7cf2a8'), { t0: 4.4, layer: 'fx' });
      s.say(0, 'Shifting into neutral to coast down a hill is prohibited.', 'bad')
        .say(2.4, 'In neutral, the engine can’t help slow the car, and the driver can’t accelerate out of trouble.', 'bad')
        .say(4.6, 'Stay in gear going downhill. Commercial drivers also may not coast with the clutch disengaged.', 'good');
    },
  });

  LAW.add({
    sec: '679', div: 'misc', title: 'Keep back from fire trucks',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Unless on official business, don’t follow a fire apparatus responding to an alarm **closer than 500 feet**.',
      'Don’t drive into, or park within, **500 feet** of where fire apparatus has stopped in answer to an alarm.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed', scenery: false });
      const L = s.lane;
      for (const [x, y] of [[200, 220], [520, 180], [300, 700], [700, 760]]) s.prop(x, y, 'tree', { s: 1.2 });
      const f = s.car({ kind: 'fire', path: s.P(-160, L.E(0), 0).to(1800, L.E(0), 4.8) });
      f.set(0, 'lights', 'fire').set(0, 'waves', 'siren');
      const r = s.car({ kind: 'car', color: COL.red, label: 'Tailing the fire truck', path: s.P(-340, L.E(0), 0.2).to(1660, L.E(0), 5) });
      r.set(0, 'labelColor', 'bad');
      s.mark(1.6, 4.4, 800, L.top - 90, 'x');
      s.prop(1180, 700, 'house', { w: 170, h: 130, c: '#9c6b4f' });
      s.raw(`<g transform="translate(1180,680)"><path d="M -40 10 Q -30 -60 0 -30 Q 10 -90 30 -20 Q 50 -60 50 10 Z" fill="#ff7a1a"/><path d="M -20 10 Q -10 -30 5 -10 Q 15 -45 30 10 Z" fill="#ffd23f"/></g>`, { t0: 5, layer: 'labels' });
      s.car({ kind: 'fire', from: 5, at: [1180, L.bot + 20, 0] }).set(0, 'lights', 'fire');
      const g = s.car({ kind: 'car', color: COL.gold, path: s.P(-100, L.E(0), 6).to(800, L.E(0), 7.8).curve(880, L.E(0), 920, L.bot + 20, 8.4, 'out').to(960, L.bot + 20, 8.7, 'out').wait(11) });
      g.set(8.6, 'label', 'Parks near the fire').set(8.6, 'labelColor', 'bad');
      s.mark(9, 11, 960, L.bot + 110, 'x');
      s.say(0, 'A fire truck races to an alarm with lights and siren.')
        .say(1.4, 'Following it closely is prohibited. Stay at least 500 feet back.', 'bad')
        .say(5.4, 'At the scene, don’t drive or park within 500 feet of where the fire trucks stopped.', 'warn')
        .say(8.6, 'This driver pulls in to watch, crowding the firefighters’ work area.', 'bad');
    },
  });

  LAW.add({
    sec: '679a', div: 'misc', title: 'Who may not use the freeway',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Not permitted on a **limited access highway** (freeway): motorcycles with engines **under 125 cc**, **mopeds**, **farm tractors** and other self-propelled farm implements, **pedestrians**, **bicycles**, and other nonmotorized traffic.',
      'Bicycles are allowed on paths built separately from the roadway and designated for bicycles.',
    ],
    dur: 10,
    build(s) {
      s.bg('freeway', { scenery: false });
      const L = s.lane;
      s.raw(`<rect x="0" y="${L.bot + 74}" width="1600" height="26" rx="12" fill="#9a9590"/>`, { layer: 'bg' });
      s.text(0, 10, 30, L.bot + 128, 'Separate bike path', { anchor: 'start', size: 20, color: '#1b2a1b' });
      const m = s.car({ kind: 'moto', color: '#e3a72a', label: 'Moped', path: s.P(-100, L.E(0), 0).to(1760, L.E(0), 8) });
      m.set(0, 'labelColor', 'bad');
      s.car({ kind: 'car', color: COL.gray, path: s.P(-200, L.E(0), 1.4).to(500, L.E(0), 3.6, 'out').curve(600, L.E(0), 680, L.E(1), 4.2).to(1760, L.E(1), 6.4) }).set(3.2, 'brake', true).set(4, 'brake', false);
      const t = s.car({ kind: 'tractor', color: '#3a8d3a', label: 'Farm tractor', path: s.P(200, L.bot + 18, 0).to(900, L.bot + 18, 10) });
      t.set(0, 'labelColor', 'bad');
      const p = s.person({ kind: 'ped', label: 'Pedestrian', path: s.P(1300, L.bot + 18, 0).to(1100, L.bot + 18, 10) });
      p.set(0, 'labelColor', 'bad');
      const b = s.car({ kind: 'bike', color: '#3f8f5c', label: 'Bike on its own path', labelBelow: true, path: s.P(-60, L.bot + 87, 0).to(1660, L.bot + 87, 10) });
      b.set(0, 'labelColor', 'good');
      s.car({ kind: 'car', color: COL.teal, path: s.P(-120, L.E(2), 0.4).to(1760, L.E(2), 4) });
      s.car({ kind: 'suv', color: COL.white, path: s.P(1760, L.W(1), 0).to(-120, L.W(1), 4.4) });
      s.mark(1.6, 10, 330, L.E(0) - 100, 'x', { r: 26 });
      s.mark(3, 10, 560, L.bot + 74, 'x', { r: 26 });
      s.mark(4.4, 10, 1190, L.bot - 50, 'x', { r: 26 });
      s.mark(5.8, 10, 860, L.bot + 150, 'ok', { r: 26 });
      s.say(0, 'Freeways are for motor vehicles that can keep up with traffic.')
        .say(1.4, 'Not allowed: mopeds and motorcycles under 125 cc…', 'bad')
        .say(3, '…farm tractors and self-propelled farm equipment…', 'bad')
        .say(4.4, '…and pedestrians, bicycles, and other nonmotorized traffic.', 'bad')
        .say(5.8, 'A bicycle path built separately from the roadway is fine.', 'good');
    },
  });

  LAW.add({
    sec: '680', div: 'misc', title: 'Don’t drive over a fire hose',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Don’t drive over an **unprotected fire department hose** laid on a street, private driveway, or streetcar track for use at a fire or fire alarm, without the consent of the fire department official in command.',
    ],
    dur: 9,
    build(s) {
      s.bg('road', { lanes: 1, curb: true, parking: true, city: true, center: 'double' });
      const L = s.lane;
      s.prop(900, L.curbW - 16, 'hydrant', { layer: 'labels' });
      s.car({ kind: 'fire', at: [1100, L.parkE, 0] }).set(0, 'lights', 'fire');
      s.prop(0, 0, 'hose', { d: `M 900 ${L.curbW - 10} C 905 ${L.y - 40}, 940 ${L.y + 40}, 960 ${L.parkE} L 1040 ${L.parkE}` });
      s.person({ kind: 'worker', color: '#2b2e33', label: 'Firefighter', at: [1020, L.curbE + 26, 180] });
      const a = s.car({ kind: 'car', color: COL.red, path: s.P(1760, L.W(0), 0.4).to(-120, L.W(0), 4.2) });
      a.set(1.4, 'label', 'Drives over the hose').set(1.4, 'labelColor', 'bad');
      s.mark(2.4, 5, 920, L.top - 100, 'x');
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 4.6).to(800, L.E(0), 6.6, 'out').wait(9) });
      b.set(6.2, 'brake', true);
      s.mark(6.8, 9, 0, 0, 'ok', { follow: b, dy: -70 });
      s.say(0, 'Firefighters have a hose stretched across the street from a hydrant.')
        .say(1.4, 'Driving over an unprotected fire hose can damage it and cut off water to the fire.', 'bad')
        .say(5.4, 'Stop and wait unless the fire official in command gives permission to cross.', 'good');
    },
  });

  LAW.add({
    sec: '682', div: 'misc', title: 'Stopping for school buses',
    penalty: 'civil', penaltyText: 'Civil infraction · $100–$500',
    rule: [
      'When **overtaking or meeting** a stopped school bus showing **two alternately flashing red lights**, stop **at least 20 feet** from the bus, and stay stopped until the bus moves again or the lights go off.',
      'On a highway divided by a raised median, barrier, or dividing section, drivers on the **other side** need not stop, **unless a crosswalk or pedestrian walkway** is present.',
      'Fine: **$100 to $500**. The registered owner is presumed to be the driver. Photos or video from a bus’s **stop-arm camera** can be used as evidence, and camera-based citations may be mailed.',
      'The area within 20 feet of the stopped bus is a “school bus zone,” where fines double (MCL 257.601b).',
    ],
    dur: 13,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      const bus = s.car({ kind: 'school', path: s.P(-160, L.E(0), 0).to(900, L.E(0), 2.2, 'out').wait(9.6).to(1800, L.E(0), 12, 'in') });
      bus.set(0.8, 'bus', 'amber').set(2.2, 'bus', 'red').set(9.4, 'bus', null).set(2, 'brake', true).set(9.6, 'brake', false);
      s.zone(2.4, 9.4, { rect: [825 - 20 * FT, L.top + 2, 150 + 40 * FT, L.bot - L.top - 4] }, '#d63a2f', 'SCHOOL BUS ZONE (20 FT)', { ly: -90, fo: 0.14 });
      for (let i = 0; i < 3; i++) s.person({ kind: 'child', color: ['#e05d8e', '#3f8f5c', '#e3a72a'][i], path: s.P(995 + i * 14, L.bot + 50 + i * 20, 3.4 + i * 0.5).to(995 + i * 14, L.top - 60, 7 + i * 0.5) });
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 1).to(680, L.E(0), 3.2, 'out').wait(9.9).to(1760, L.E(0), 12.8, 'in') });
      b.set(3, 'brake', true).set(9.9, 'brake', false);
      s.mark(3.6, 9.4, 0, 0, 'ok', { follow: b, dy: -70 });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(1760, L.W(0), 1.8).to(-120, L.W(0), 5) });
      r.set(2.4, 'label', 'Doesn’t stop').set(2.4, 'labelColor', 'bad');
      s.mark(3.2, 5.6, 1000, L.top - 150, 'x');
      const g = s.car({ kind: 'car', color: COL.gold, path: s.P(1760, L.W(0), 3.8).to(1130, L.W(0), 5.4, 'out').wait(9.6).to(-120, L.W(0), 12.4, 'in') });
      g.set(5, 'brake', true).set(9.6, 'brake', false);
      s.say(0, 'A school bus flashes its amber lights: it’s about to stop.')
        .say(2.2, 'Red lights flashing and stop arm out: traffic in both directions must stop at least 20 feet away.', 'good')
        .say(3, 'This oncoming driver doesn’t stop.', 'bad')
        .say(5.4, 'That’s a $100–$500 civil fine. Stop-arm camera footage can be used as evidence.', 'warn')
        .say(9.4, 'Wait until the bus moves again or its red lights turn off.', 'good');
    },
  });

  LAW.add({
    sec: '682a', div: 'misc', title: 'Flame and smoke devices',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'It’s a civil infraction to **install, sell, or distribute** a device meant to make a motor vehicle emit **flame or smoke**, or to **use** one on a motor vehicle on a Michigan highway.',
      'Highway maintenance vehicles are exempt.',
    ],
    dur: 7,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      const flame = `${DL.vehicleSVG('car', '#1f1f24', {})}
        <path d="M -32 6 Q -60 -2 -82 10 Q -64 12 -76 22 Q -54 16 -32 12 Z" fill="#ff7a1a"/><path d="M -32 8 Q -50 6 -62 12 Q -48 14 -32 11 Z" fill="#ffd23f"/>
        <circle cx="-110" cy="12" r="18" fill="#9aa1a8" opacity=".6"/><circle cx="-140" cy="4" r="24" fill="#9aa1a8" opacity=".45"/><circle cx="-176" cy="10" r="30" fill="#9aa1a8" opacity=".3"/>`;
      const c = s.thing({ svg: flame, label: 'Exhaust flamethrower', path: s.P(-200, L.E(0), 0).to(1800, L.E(0), 5.6) });
      c.set(0, 'labelColor', 'bad');
      s.mark(1.4, 7, 800, L.top - 100, 'x');
      s.say(0, 'This car has an aftermarket device that shoots flames and smoke from the exhaust.', 'bad')
        .say(2.6, 'Installing, selling, or using such a device on a highway is a civil infraction.', 'bad');
    },
  });

  LAW.add({
    sec: '682b', div: 'misc', title: 'Kids riding in a pickup bed',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A driver may not let anyone **under 18** ride in the **open bed of a pickup truck** on a highway, road, or street in a city, village, or township at more than **15 mph**.',
      'Exceptions: parades with a permit, military vehicles, authorized emergency vehicles, farm, construction, and similar work during the course of the work, and transporting search and rescue teams.',
    ],
    dur: 10,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      const kids = `${DL.vehicleSVG('pickup', '#c0392b', {})}
        <circle cx="-28" cy="-8" r="6" fill="#e0b48c"/><circle cx="-14" cy="7" r="6" fill="#e0b48c"/><circle cx="-29" cy="8" r="6" fill="#e0b48c"/>`;
      const a = s.thing({ svg: kids, path: s.P(-120, L.E(0), 0).to(1800, L.E(0), 4.6) });
      a.set(0, 'label', 'Teens in the bed · 30 mph').set(0, 'labelColor', 'bad');
      s.mark(1.4, 4.6, 800, L.top - 100, 'x');
      const b = s.thing({ svg: kids, from: 5, path: s.P(-120, L.E(0), 5).to(1100, L.E(0), 10) });
      b.set(5, 'label', 'Hayride · 10 mph').set(5, 'labelColor', 'good');
      s.mark(6.4, 10, 800, L.top - 100, 'ok');
      s.say(0, 'A pickup carries three 16-year-olds in its open bed through town at 30 mph.', 'bad')
        .say(2.2, 'Anyone under 18 may ride in an open pickup bed in a city, village, or township only at 15 mph or less.', 'bad')
        .say(5.2, 'At 10 mph, it’s allowed.', 'good')
        .say(7.6, 'Parades with permits, farm and construction work, and emergency vehicles are exempt entirely.');
    },
  });

  LAW.add({
    sec: '682c', div: 'misc', title: 'Commercial snowplows need an amber light',
    penalty: 'civil', penaltyText: 'Civil infraction · up to $100',
    rule: [
      'A person plowing snow or ice **for pay** on a public street or highway, or in a **parking lot open to the public**, must use at least one **flashing, rotating, or oscillating yellow or amber light** visible in a 360° arc from 500 feet.',
      'An owner or lessee may not knowingly let someone operate the plow without it. Fine: up to $100.',
    ],
    dur: 9,
    build(s) {
      s.bg('blank', { fill: '#e9eef4' });
      let lot = `<rect x="200" y="160" width="1200" height="580" fill="#7a7f86"/>`;
      for (let x = 260; x < 1360; x += 110) lot += `<rect x="${x}" y="170" width="4" height="120" fill="#f3f3f0"/><rect x="${x}" y="610" width="4" height="120" fill="#f3f3f0"/>`;
      s.raw(lot, { layer: 'bg' });
      s.view([[0, 800, 440, 1300]]);
      s.prop(800, 100, 'bldg', { w: 700, h: 120, c: '#a38f7d', label: 'GROCERY' });
      for (let i = 0; i < 160; i++) s.raw(`<circle cx="${(i * 97) % 1600}" cy="${(i * 53) % 900}" r="${1 + (i % 3)}" fill="#fff" opacity=".8"/>`, { layer: 'night' });
      const plow = `${DL.vehicleSVG('pickup', '#2b2e33', {})}<polygon points="40,-24 52,-24 58,24 46,24" fill="#f1c40f" stroke="#7a6206"/>`;
      const beacon = `<rect x="-14" y="-7" width="12" height="14" rx="3" fill="#222"/><circle cx="-8" cy="0" r="5" fill="#ffb000" opacity=".3" data-part="barA"/><circle cx="-8" cy="0" r="5" fill="#ffb000" opacity=".3" data-part="barB"/>`;
      const a = s.thing({ svg: plow, label: 'No warning light', path: s.P(300, 450, 0).to(1300, 450, 4.2) });
      a.set(0, 'labelColor', 'bad').set(4.3, 'show', false);
      s.mark(1.2, 4.2, 800, 330, 'x');
      const b = s.thing({ svg: plow + beacon, label: 'Amber beacon on', from: 4.4, path: s.P(1300, 520, 4.4).to(300, 520, 8.8) });
      b.set(4.4, 'lights', 'amber').set(4.4, 'labelColor', 'good');
      s.mark(5.6, 9, 800, 400, 'ok');
      s.say(0, 'A plow-for-hire clears a grocery store parking lot with no warning light.', 'bad')
        .say(1.6, 'Commercial plows on public roads or public parking lots must run a flashing amber or yellow light visible 500 feet away, in every direction.', 'bad')
        .say(4.6, 'With its amber beacon flashing, this plow is legal.', 'good');
    },
  });
})();
