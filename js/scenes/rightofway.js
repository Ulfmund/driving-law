/* Right-of-way: MCL 257.649 – 257.654 */
(function () {
  const { COL } = K;

  LAW.add({
    sec: '649', div: 'row', title: 'Right-of-way at intersections',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Yield to a vehicle that has **already entered** the intersection from a different road.',
      'When two vehicles enter from different roads at about the **same time**, the driver on the **left yields** to the driver on the right.',
      'At a **stop sign**, stop at the stop line (or crosswalk, or where you can see), then yield to vehicles in or close to the intersection. At a **yield sign**, slow down and yield, stopping if needed. At **merge** signs, yield and adjust speed to merge.',
      'If a traffic signal is **dark or malfunctioning**, stop, yield to vehicles that would be an immediate hazard, and proceed with ordinary care. This doesn’t apply to signals meant to flash yellow.',
      'A driver going at an **unlawful speed forfeits** any right-of-way they would otherwise have.',
    ],
    dur: 16,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      s.text(0, 5.6, L.cx, 130, 'No signs or signals', { size: 26, color: '#1b2a1b' });
      const a = s.car({ kind: 'car', color: COL.gold, path: s.P(-100, L.E(0), 0).to(L.stopAt('E') + 20, L.E(0), 2.4, 'out').wait(3.6).to(1760, L.E(0), 6, 'in') });
      a.set(2, 'brake', true).set(3.6, 'brake', false);
      s.note(2.2, 3.8, 0, 0, 'On the left: yields', 'info', { follow: a });
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(L.N(0), 1000, 0).to(L.N(0), 620, 2.2).to(L.N(0), -120, 4.4) });
      s.note(2.2, 3.4, 0, 0, 'On the right: goes first', 'good', { follow: b, dx: 230, dy: -40, ptr: false });
      for (const d of ['E', 'W', 'N', 'S']) s.light(...L.corner(d), [[0, 'off']], { t0: 6, t1: 11.6 });
      s.text(6, 11.6, L.cx, 130, 'Signal dark: treat like a stop sign', { size: 26, color: '#1b2a1b' });
      s.car({ kind: 'car', color: COL.teal, path: s.P(-100, L.E(0), 6).to(L.stopAt('E'), L.E(0), 8, 'out').wait(9.4).to(1760, L.E(0), 11.4, 'in') }).set(7.6, 'brake', true).set(9.4, 'brake', false);
      s.car({ kind: 'car', color: COL.purple, path: s.P(L.S(0), -120, 6.2).to(L.S(0), L.stopAt('S'), 8.2, 'out').wait(10.2).to(L.S(0), 1000, 12, 'in') }).set(7.8, 'brake', true).set(10.2, 'brake', false);
      s.sign(...L.corner('E'), 'yield', '', { t0: 12 });
      s.text(12, 16, L.cx, 130, 'Yield sign', { size: 26, color: '#1b2a1b' });
      const y = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 12).to(600, L.E(0), 13.6, 'out').to(1760, L.E(0), 16, 'in') });
      y.mph([[12, 35], [13.2, 10], [14, 30]]);
      s.car({ kind: 'suv', color: COL.white, path: s.P(L.N(0), 1000, 12).to(L.N(0), -120, 14.4) });
      s.say(0, 'Two cars reach an uncontrolled intersection at the same time.')
        .say(1.8, 'The driver on the left yields to the driver on the right.', 'good')
        .say(6.2, 'When a signal is dark or malfunctioning, stop, yield to anyone who would be a hazard, then go with care.', 'good')
        .say(12.2, 'At a yield sign, slow down and yield to cross traffic, stopping only if needed.', 'good')
        .say(14.4, 'And a driver going at an unlawful speed gives up any right-of-way they would have had.', 'warn');
    },
  });

  LAW.add({
    sec: '649a', div: 'row', title: 'Left turns into driveways',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A driver turning left across oncoming traffic **somewhere other than an intersection** (into a driveway, parking lot, or alley) must yield to all oncoming vehicles close enough to be an immediate hazard.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      s.raw(`<rect x="880" y="160" width="400" height="${L.top - 186}" fill="#8e9398"/><rect x="900" y="${L.top - 30}" width="90" height="34" fill="#8e9398"/>
        <text x="1080" y="250" text-anchor="middle" font-size="28" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial">STORE LOT</text>`, { layer: 'bg' });
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(900, L.E(0) - 8, 2.2, 'out').wait(4.4).curve(945, L.E(0) - 8, 945, L.top - 20, 5.2).to(945, 280, 5.8, 'out').wait(11) });
      a.set(0.6, 'sig', 'L').set(2, 'brake', true).set(4.4, 'brake', false).set(5.8, 'sig', null);
      s.note(2.4, 4.4, 0, 0, 'Waits for oncoming traffic', 'good', { follow: a });
      s.car({ kind: 'car', color: COL.gold, path: s.P(1760, L.W(0), 1.4).to(-120, L.W(0), 4.6) });
      const b = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 5.6).to(900, L.E(0) - 8, 7.6).curve(945, L.E(0) - 8, 945, L.top - 20, 8.3).to(945, 340, 8.8, 'out').wait(11) });
      b.set(6, 'sig', 'L').set(7.6, 'label', 'Turns in front of traffic').set(7.6, 'labelColor', 'bad');
      const w = s.car({ kind: 'suv', color: COL.white, path: s.P(1760, L.W(0), 6.6).to(1080, L.W(0), 8.2, 'out').wait(8.9).to(-120, L.W(0), 11, 'in') });
      w.set(7.6, 'brake', true).set(8.9, 'brake', false).set(7.6, 'waves', 'horn').set(8.6, 'waves', null);
      s.mark(8, 10.6, 1060, L.bot + 110, 'x');
      s.say(0, 'A driver wants to turn left into a store parking lot, mid-block.')
        .say(2.4, 'They wait, signaling, until oncoming traffic is no longer close enough to be a hazard.', 'good')
        .say(4.6, 'Then they turn.', 'good')
        .say(7.6, 'This driver turns across the path of an oncoming car, which has to brake hard.', 'bad');
    },
  });

  LAW.add({
    sec: '650', div: 'row', title: 'Left turns at intersections',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A driver turning left within an intersection must yield to oncoming vehicles that are in the intersection or so close as to be an immediate hazard.',
      'Having yielded and signaled, the driver may turn, and oncoming drivers must then yield to the turning vehicle.',
      'At a traffic signal, a driver turning left must let oncoming straight-through vehicles waiting for the green go first.',
    ],
    dur: 12,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      s.light(...L.corner('E'), [[0, 'G']]); s.light(...L.corner('W'), [[0, 'G']]);
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(L.cx - 30, L.E(0) - 6, 2.4, 'out').wait(4.6).curve(L.N(0), L.E(0) - 6, L.N(0), L.cy - L.HW - 30, 5.4).to(L.N(0), -120, 6.4) });
      a.set(0.4, 'sig', 'L').set(2.2, 'brake', true).set(4.6, 'brake', false).set(5.6, 'sig', null);
      s.note(2.4, 4.4, 0, 0, 'Yields to oncoming cars', 'good', { follow: a, dx: -220, dy: 90, ptr: true });
      s.car({ kind: 'car', color: COL.gold, path: s.P(1760, L.W(0), 1.2).to(-120, L.W(0), 4) });
      s.car({ kind: 'suv', color: COL.white, path: s.P(1760, L.W(0), 1.8).to(-120, L.W(0), 4.5) });
      const b = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 6.4).to(L.cx - 40, L.E(0) - 6, 8).curve(L.N(0), L.E(0) - 6, L.N(0), L.cy - L.HW - 30, 8.6).to(L.N(0), -120, 9.4) });
      b.set(6.6, 'sig', 'L').set(7.8, 'label', 'Doesn’t yield').set(7.8, 'labelColor', 'bad');
      const w = s.car({ kind: 'car', color: COL.teal, path: s.P(1760, L.W(0), 7).to(960, L.W(0), 8.3, 'out').wait(9).to(-120, L.W(0), 11, 'in') });
      w.set(7.9, 'brake', true).set(9, 'brake', false).set(7.9, 'waves', 'horn').set(8.8, 'waves', null);
      s.mark(8.2, 10.6, 1000, 300, 'x');
      s.say(0, 'Green light. This driver pulls into the intersection to turn left.')
        .say(2.4, 'They wait for oncoming cars that are close enough to be a hazard.', 'good')
        .say(4.6, 'Once it’s clear, they complete the turn.', 'good')
        .say(7.8, 'This driver turns across an oncoming car’s path without yielding.', 'bad');
    },
  });

  LAW.add({
    sec: '652', div: 'row', title: 'Entering the road from a driveway or alley',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A driver about to enter or cross a highway from an **alley, private road, or driveway** must come to a **full stop** before entering the highway and yield to vehicles approaching on it.',
    ],
    dur: 10,
    build(s) {
      s.bg('road', { lanes: 1, curb: true, center: 'double', scenery: false });
      const L = s.lane;
      s.raw(`<rect x="560" y="${L.curbE}" width="90" height="${900 - L.curbE}" fill="#8e9398"/><rect x="1000" y="${L.curbE}" width="90" height="${900 - L.curbE}" fill="#8e9398"/>`, { layer: 'bg' });
      s.prop(470, 760, 'house', { w: 130, h: 110 }); s.prop(1180, 760, 'house', { w: 130, h: 110, c: '#6f7f99' });
      for (const x of [200, 820, 1400]) s.prop(x, 700, 'tree');
      for (const x of [300, 900, 1300]) s.prop(x, 240, 'house', { c: '#9c8a6a' });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(605, 840, 0).to(605, L.E(0) + 30, 1.6).curve(605, L.E(0), 680, L.E(0), 2.1).to(1760, L.E(0), 4.6) });
      r.set(0.6, 'label', 'Doesn’t stop').set(0.6, 'labelColor', 'bad').set(3.4, 'label', null);
      const o = s.car({ kind: 'suv', color: COL.white, path: s.P(-100, L.E(0), 0.4).to(480, L.E(0), 2, 'out').wait(2.4).to(1760, L.E(0), 5.2, 'in') });
      o.set(1.6, 'brake', true).set(2.4, 'brake', false).set(1.6, 'waves', 'horn').set(2.4, 'waves', null);
      s.mark(1.8, 4, 605, L.top - 80, 'x');
      const g = s.car({ kind: 'car', color: COL.you, hi: true, from: 4.6, path: s.P(1045, 840, 4.6).to(1045, L.curbE + 36, 6, 'out').wait(7.6).curve(1045, L.E(0), 1120, L.E(0), 8.2).to(1760, L.E(0), 9.6) });
      g.set(5.6, 'brake', true).set(7.6, 'brake', false).set(6.6, 'sig', 'R').set(8.2, 'sig', null);
      s.note(6, 7.6, 0, 0, 'Full stop, then yields', 'good', { follow: g, dx: 230, dy: 0, ptr: false });
      s.car({ kind: 'car', color: COL.gold, path: s.P(-100, L.E(0), 5.4).to(1760, L.E(0), 7.6) });
      s.say(0, 'A driver backs out of the garage and heads down the driveway.')
        .say(1.4, 'They roll straight into the street without stopping, forcing a car to brake.', 'bad')
        .say(5.2, 'Coming from a driveway, alley, or private road: stop completely before entering…', 'good')
        .say(7.2, '…and yield to vehicles approaching on the road.', 'good');
    },
  });

  LAW.add({
    sec: '653', div: 'row', title: 'Pull over for emergency vehicles',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'When an authorized emergency vehicle approaches with a flashing red or blue light (visible 500 feet ahead) **and** a siren, bell, or whistle sounding, other drivers must yield the right-of-way.',
      'Immediately drive to a position **parallel to and as close as possible to the right-hand edge or curb**, clear of any intersection, and **stop** until it has passed, unless a police officer directs otherwise.',
      'The emergency driver must still drive with due regard for everyone’s safety.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 2, vy: 500 });
      const L = s.lane;
      const cars = [[200, L.E(1), COL.gold, true], [480, L.E(0), COL.white, true], [700, L.E(1), COL.red, false], [960, L.E(0), COL.teal, true]];
      cars.forEach(([x, y, col, good], i) => {
        const stopX = x + 300;
        const p = good
          ? s.P(x, y, 0).to(x + 220, y, 1.4).curve(x + 280, y, stopX, L.bot - 18, 2.4, 'out').wait(6).to(1760, L.bot - 18, 9.4, 'in')
          : s.P(x, y, 0).to(x + 380, y, 1.8).to(x + 520, y, 2.8, 'out').wait(3.4).to(1760, y, 6.2, 'in');
        const c = s.car({ kind: i === 1 ? 'suv' : 'car', color: col, path: p });
        if (good) c.set(1.2, 'sig', 'R').set(2.2, 'brake', true).set(6, 'brake', false);
        else c.set(1.2, 'label', 'Doesn’t pull over').set(1.2, 'labelColor', 'bad').set(2.4, 'brake', true).set(3.4, 'brake', false);
      });
      const amb = s.car({ kind: 'ambulance', path: s.P(-200, L.E(1), 0.8).to(900, L.E(1), 2.8).to(1010, L.E(1), 3.4, 'out').wait(3.6).curve(1100, L.E(1), 1150, L.y - 24, 4.2).to(1800, L.y - 24, 5.6) });
      amb.set(0, 'lights', 'ambulance').set(0, 'waves', 'siren');
      s.mark(2.8, 5.4, 1080, L.top - 90, 'x');
      s.say(0, 'An ambulance comes up from behind with lights flashing and siren on.')
        .say(1.4, 'Drivers must pull over to the right edge, parallel to it, and stop.', 'good')
        .say(2.8, 'This driver stays put in the left lane and blocks the ambulance.', 'bad')
        .say(5.8, 'Stay stopped until the emergency vehicle has passed, unless police direct otherwise.', 'good');
    },
  });

  LAW.add({
    sec: '653a', div: 'row', title: 'Move Over law for stopped emergency vehicles',
    penalty: 'mixed', penaltyText: '$400 civil fine · felony if a responder is hurt or killed',
    rule: [
      'Approaching a **stationary** emergency vehicle showing flashing red, blue, white, or amber lights:',
      'On a road with **2+ lanes** in your direction: slow to at least **10 mph below the posted limit** and **move over** at least one lane (or 2 vehicle widths), unless an officer directs otherwise.',
      'If you can’t safely move over (weather, road conditions, traffic), or there’s only one lane: slow to at least 10 mph below the limit and proceed with due care.',
      'Violation: civil infraction, **$400** fine. Causing **injury** to a responder: felony, up to 2 years/$1,000. Causing **death**: felony, up to 15 years/$7,500.',
      'Doesn’t apply to an emergency vehicle stopped across a median or barrier on a divided highway.',
    ],
    dur: 12,
    build(s) {
      s.bg('freeway', { lanes: 2, median: 60, medianType: 'barrier', zoom: 1250 });
      const L = s.lane;
      s.sign(300, L.bot + 90, 'speed', '70');
      s.car({ kind: 'police', at: [960, L.bot + 18, 0] }).set(0, 'lights', 'police');
      s.car({ kind: 'car', color: COL.gray, at: [1060, L.bot + 18, 0] }).set(0, 'sig', 'H');
      s.person({ kind: 'officer', at: [1012, L.bot - 6, 0] });
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(400, L.E(0), 1.8).curve(500, L.E(0), 600, L.E(1), 2.6).to(1760, L.E(1), 6.6) });
      b.mph([[0, 70], [1.8, 60]]).set(1.6, 'sig', 'L').set(2.8, 'sig', null);
      s.mark(3.6, 6.2, 0, 0, 'ok', { follow: b, dx: 0, dy: -80 });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 6.4).to(1760, L.E(0), 10) });
      r.mph([[0, 70]]).set(0, 'labelColor', 'bad');
      s.mark(8, 11, 960, L.bot + 100, 'x');
      s.say(0, 'A police car is stopped on the shoulder with its lights flashing.')
        .say(1.6, 'This driver moves over a lane and slows to at least 10 mph under the limit.', 'good')
        .say(6.6, 'This driver keeps going 70 in the lane right next to the officer.', 'bad')
        .say(8.6, 'That’s a $400 civil fine. Injuring a responder is a felony, and killing one carries up to 15 years.', 'warn');
    },
  });

  LAW.add({
    sec: '653b', div: 'row', title: 'Slow down for garbage, utility, and road crews',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'The Move Over rules also apply to a **stationary** garbage collection truck, **utility** service vehicle, or **road maintenance** vehicle showing flashing **amber** lights.',
      'With 2+ lanes in your direction: slow to at least **10 mph below** the posted limit and move over a lane (or 2 vehicle widths) if you can.',
      'With one lane, or when moving over isn’t possible: slow down by 10 mph and proceed with due care.',
      'Doesn’t apply to a vehicle stopped across a median or barrier on a divided highway.',
    ],
    dur: 10,
    build(s) {
      s.bg('road', { lanes: 1, curb: true, center: 'dashed' });
      const L = s.lane;
      s.sign(300, L.curbE + 80, 'speed', '35');
      s.car({ kind: 'garbage', at: [900, L.E(0) + 14, 0] }).set(0, 'lights', 'amber');
      s.person({ kind: 'worker', at: [830, L.curbE + 24, 90] });
      for (const x of [780, 990]) s.raw(`<rect x="${x - 14}" y="${L.curbE + 4}" width="28" height="30" rx="4" fill="#2f6b4f"/>`);
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(560, L.E(0), 2).to(700, L.W(0) + 6, 3.2).to(1100, L.W(0) + 6, 5).curve(1180, L.W(0) + 6, 1260, L.E(0), 5.6).to(1760, L.E(0), 6.8) });
      b.mph([[0, 35], [2, 25], [6, 35]]);
      s.mark(3.2, 6, 0, 0, 'ok', { follow: b });
      s.say(0, 'A garbage truck is stopped with its amber lights flashing while the crew works.')
        .say(1.8, 'This driver slows from 35 to 25, at least 10 below the limit, and gives the crew room.', 'good')
        .say(5.8, 'On roads with 2+ lanes in your direction, also move over a lane when it’s safe.', 'good');
    },
  });

  LAW.add({
    sec: '654', div: 'row', title: 'Funeral processions',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Vehicles in a funeral procession going to a place of burial have the **right-of-way at intersections** over all other vehicles except fire apparatus, ambulances, and police patrol vehicles.',
      'Each vehicle must display a **fluorescent orange flag** with a black cross, Star of David, or crescent and star (no names, only the word “funeral”). The first and last vehicles may carry an additional flag.',
      'Driving through a funeral procession is a civil infraction.',
    ],
    dur: 11,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      s.light(...L.corner('E'), [[0, 'R']]); s.light(...L.corner('N'), [[0, 'G']]);
      const xs = [0, 100, 200, 300, 470, 570, 670];
      xs.forEach((dx, i) => {
        const c = s.car({ kind: i === 0 ? 'hearse' : 'car', color: [COL.black, COL.gray, COL.white, COL.teal, COL.gold, COL.purple, COL.gray][i], flag: true, path: s.P(-100 - dx, L.E(0), 0).to(1900 - dx, L.E(0), 10) });
        c.set(0, 'sig', 'H');
        if (i === 0) c.set(0, 'label', 'Funeral procession');
      });
      const g = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(L.N(0), 1000, 0).to(L.N(0), L.stopAt('N'), 2, 'out').wait(9.4).to(L.N(0), -120, 11, 'in') });
      s.note(2.2, 5.8, 0, 0, 'Green light, but yields', 'good', { follow: g, dx: 220, dy: 0, ptr: false });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(L.S(0), -120, 4.6).to(L.S(0), 300, 5.6, 'out').wait(6.0).to(L.S(0), 1000, 7.2) });
      r.set(6, 'label', 'Cuts through').set(6, 'labelColor', 'bad');
      s.mark(6.4, 9, 640, 320, 'x');
      s.say(0, 'A funeral procession, every car flying an orange flag, heads to the cemetery.')
        .say(2.2, 'It has the right-of-way at intersections, even against this red light.', 'good')
        .say(6, 'Cutting through a gap in the procession is a civil infraction.', 'bad')
        .say(8.4, 'Only fire trucks, ambulances, and police cars take priority over the procession.');
    },
  });
})();
