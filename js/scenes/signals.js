/* Traffic signs, signals, and markings: MCL 257.611 – 257.616a */
(function () {
  const { COL } = K;

  LAW.add({
    sec: '611', div: 'sig', title: 'Obey traffic control devices; no cutting through property',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Drivers must obey traffic control devices (signs, signals, markings) unless a police officer directs otherwise.',
      'You may not drive across private property (a gas station, a parking lot) or public property that isn’t a road **to avoid** a traffic control device.',
    ],
    dur: 12,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      // Gas station on the southwest corner, with driveways onto both roads.
      s.raw(`<rect x="370" y="566" width="314" height="300" fill="#8e9398"/>
        <rect x="410" y="510" width="80" height="60" fill="#8e9398"/><rect x="680" y="640" width="60" height="80" fill="#8e9398"/>
        <rect x="420" y="740" width="220" height="90" rx="6" fill="#d8dde3" stroke="#6b7480" stroke-width="3"/>
        <text x="530" y="796" text-anchor="middle" font-size="30" font-weight="900" fill="#c62f25" font-family="system-ui,Segoe UI,Arial">GAS</text>
        <rect x="500" y="610" width="120" height="70" rx="4" fill="#c62f25" opacity=".85"/>`, { layer: 'bg' });
      s.light(...L.corner('E'), [[0, 'R'], [8.2, 'G']]);
      s.light(...L.corner('N'), [[0, 'G'], [7, 'Y'], [8.2, 'R']]);
      s.car({ kind: 'car', color: COL.gold, path: s.P(L.N(0), 1000, 0.3).to(L.N(0), -120, 4.4) });
      const r = s.car({
        kind: 'car', color: COL.red,
        path: s.P(-100, L.E(0), 0.4).to(400, L.E(0), 2.2).curve(450, L.E(0), 450, 560, 2.8).to(450, 620, 3.2)
          .curve(450, 680, 520, 680, 3.7).to(690, 680, 4.4).curve(L.S(0), 680, L.S(0), 750, 4.9).to(L.S(0), 1000, 5.8),
      });
      r.set(1.6, 'label', 'Cuts through the lot').set(1.6, 'labelColor', 'bad');
      s.trail(5.2, 12, `M 380 ${L.E(0)} L 400 ${L.E(0)} Q 450 ${L.E(0)} 450 560 L 450 620 Q 450 680 520 680 L 690 680 Q ${L.S(0)} 680 ${L.S(0)} 760`, '#d63a2f');
      s.mark(5.4, 12, 560, 640, 'x');
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-150, L.E(0), 2.6).to(L.stopAt('E'), L.E(0), 5.6, 'out').wait(8.4).to(1750, L.E(0), 12, 'in') });
      s.mark(6, 8.4, 0, 0, 'ok', { follow: b, dy: -70 });
      s.say(0, 'The light is red for eastbound traffic.')
        .say(1.5, 'This driver cuts through the gas station lot to skip the light.', 'bad')
        .say(5, 'Crossing private or public property to avoid a traffic control device is its own violation.', 'bad')
        .say(6.4, 'The other driver waits at the stop line.', 'good')
        .say(8.3, 'Green: now they may go.', 'good');
    },
  });

  LAW.add({
    sec: '611a', div: 'sig', title: 'Obey a flagger in a work zone',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A worker in a work zone may direct traffic if the road agency (MDOT, county road commission, or local authority) has authorized it and the worker is trained, equipped, and dressed as the traffic control manual requires.',
      'The road agency can allow the flagger to override existing signs or signals.',
      'A driver who fails to follow an authorized flagger’s directions, including one that overrides a sign or signal, is responsible for a civil infraction.',
    ],
    dur: 13.6,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      s.zone(0, 13.6, { rect: [700, L.E(0) - 30, 520, 60] }, '#d88a0f', 'LANE CLOSED', { ly: 0 });
      s.prop(650, L.E(0) + 14, 'cone'); s.prop(675, L.E(0) - 8, 'cone');
      for (let x = 700; x <= 1220; x += 46) s.prop(x, L.y + 10, 'cone');
      s.prop(1245, L.E(0) - 8, 'cone'); s.prop(1270, L.E(0) + 14, 'cone');
      s.person({ kind: 'worker', at: [860, L.E(0) + 8, 0] }); s.person({ kind: 'worker', at: [1060, L.E(0) - 4, 160] });
      s.sign(330, 590, 'flagger');
      const f = s.person({ kind: 'flagger', at: [630, L.bot + 30, 180] });
      f.set(0, 'paddle', 'stop').set(9.6, 'paddle', 'slow');
      s.note(0.4, 9.4, 630, L.bot + 30, 'STOP', 'bad', { dx: 0, dy: 110, size: 26 });
      s.note(9.7, 13.6, 630, L.bot + 30, 'SLOW', 'warn', { dx: 0, dy: 110, size: 26 });
      s.car({ kind: 'car', color: COL.gold, path: s.P(1750, L.W(0), 0.2).to(-120, L.W(0), 4.6) });
      const w2 = s.car({ kind: 'suv', color: COL.white, path: s.P(1760, L.W(0), 3.4).to(1440, L.W(0), 5, 'out').wait(7.2).to(-120, L.W(0), 11.5, 'in') });
      s.note(5, 7.2, 0, 0, 'Has to wait', 'warn', { follow: w2, dy: -90 });
      const b = s.car({ kind: 'car', color: COL.red, path: s.P(-120, L.E(0), 1.8).to(560, L.E(0), 3.8).curve(640, L.E(0), 700, L.W(0), 4.3).to(1180, L.W(0), 5.6).curve(1260, L.W(0), 1320, L.E(0), 6.1).to(1750, L.E(0), 7.2) });
      b.set(3.6, 'label', 'Ignores the flagger').set(3.6, 'labelColor', 'bad');
      s.mark(4.2, 7, 0, 0, 'x', { follow: b, dy: -80 });
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-120, L.E(0), 4.4).to(560, L.E(0), 6.8, 'out').wait(9.8).to(640, L.E(0), 10.2, 'in').curve(700, L.E(0), 760, L.W(0), 10.6).to(1180, L.W(0), 11.8).curve(1260, L.W(0), 1320, L.E(0), 12.2).to(1750, L.E(0), 13.4) });
      s.mark(7.1, 9.6, 0, 0, 'ok', { follow: a, dy: -70 });
      s.say(0, 'Road work has closed the eastbound lane, so the two directions take turns using one lane.')
        .say(1.6, 'An authorized flagger in proper gear is holding eastbound traffic with a STOP paddle.')
        .say(3.8, 'This driver ignores the flagger and drives into the one open lane.', 'bad')
        .say(5.4, 'Not following an authorized work zone flagger is a civil infraction, even if the flagger is overriding a posted sign or signal.', 'bad')
        .say(7, 'This driver stops and waits for oncoming traffic to clear.', 'good')
        .say(9.8, 'The paddle turns to SLOW, and the driver proceeds through.', 'good');
    },
  });

  LAW.add({
    sec: '612', div: 'sig', title: 'Traffic signals: green, yellow, red, and right on red',
    penalty: 'mixed', penaltyText: 'Civil infraction · misdemeanor for endangering a wheelchair user',
    rule: [
      '**Green:** go straight or turn (unless a sign prohibits it), yielding to vehicles, pedestrians, and bicyclists lawfully in the intersection or an adjacent crosswalk.',
      '**Yellow:** stop before the crosswalk or stop line, but if you can’t stop safely you may go through cautiously.',
      '**Red:** stop before the crosswalk or stop line and wait for green. After a full stop you may turn **right on red** (or left on red onto a one-way street) unless a sign prohibits it, yielding to pedestrians, bicyclists, and other traffic.',
      '**Arrows:** a green arrow allows only that movement (yield to people in the crosswalk). Red and yellow arrows mean the same as the round lights, but only for that movement.',
      'Drivers must take precautions around a person using a **wheelchair or walking aid** at a crossing. Failing to is a misdemeanor.',
    ],
    dur: 16,
    build(s) {
      s.bg('cross', { lanes: 2, zoom: 1350 });
      const L = s.lane;
      s.light(...L.corner('E'), [[0, 'G'], [3.6, 'Y'], [5.6, 'R'], [13.6, 'G']]);
      s.light(...L.corner('N'), [[0, 'R'], [5.9, 'G'], [12.4, 'Y'], [13.6, 'R']]);
      s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(1), 0).to(1750, L.E(1), 4.2) });
      const b = s.car({ kind: 'car', color: COL.gold, path: s.P(-100, L.E(1), 2.2).to(L.stopAt('E'), L.E(1), 5.4, 'out').wait(13.8).to(1750, L.E(1), 16.4, 'in') });
      b.set(4.3, 'brake', true).set(13.8, 'brake', false);
      const c = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 4.6).to(1750, L.E(0), 8.6) });
      c.set(5.8, 'label', 'Runs the red').set(5.8, 'labelColor', 'bad').set(8, 'label', null);
      const n = s.car({ kind: 'suv', color: COL.white, path: s.P(L.N(0), L.stopAt('N'), 0).wait(6.2).to(L.N(0), 600, 6.7, 'in').wait(7.6).to(L.N(0), -120, 10.4, 'in') });
      n.set(6.6, 'brake', true).set(7.6, 'brake', false);
      s.mark(6.4, 8.4, 760, 380, 'x');
      const d = s.car({ kind: 'car', color: COL.purple, path: s.P(-100, L.E(0), 7.4).to(L.stopAt('E'), L.E(0), 9.6, 'out').wait(11.6).to(640, L.E(0), 11.9, 'in').curve(L.S(0), L.E(0), L.S(0), 630, 12.6).to(L.S(0), 1000, 13.6) });
      d.set(9.4, 'brake', true).set(11.6, 'brake', false).set(11.4, 'sig', 'R').set(12.6, 'sig', null);
      const p = s.person({ kind: 'ped', color: '#5a6e8c', label: 'Wheelchair user', path: s.P(L.cx - L.VW - 30, L.cy + L.HW + 26, 8.6).to(L.cx + L.VW + 30, L.cy + L.HW + 26, 12.6).wait(16) });
      void p;
      s.say(0, 'Green: go straight or turn, yielding to anyone already in the intersection or crosswalk.', 'good')
        .say(3.6, 'Yellow: stop before the stop line if you can do it safely. This driver can, and does.', 'warn')
        .say(5.6, 'Red: stop and stay stopped until green.')
        .say(6, 'This driver enters on red, nearly hitting cross traffic.', 'bad')
        .say(9.6, 'Right on red: stop completely, then turn if no sign forbids it, yielding to people crossing.')
        .say(10.4, 'Take extra care around a person using a wheelchair or walking aid. Failing to is a misdemeanor.', 'warn')
        .say(11.8, 'Once the crosswalk is clear, the turn is legal.', 'good');
    },
  });

  LAW.add({
    sec: '613d', div: 'sig', title: 'Stop for a school crossing guard',
    penalty: 'misd', penaltyText: 'Misdemeanor',
    rule: [
      'A driver must stop when a school crossing guard is **in the crossing** and holding a **STOP sign upright** where approaching traffic can see it.',
      'Failing to stop is a misdemeanor.',
      'If the vehicle is identified, the registered owner is presumed to have been the driver.',
      'Crossing guards have this authority only at their assigned crossing and during their assigned hours (MCL 257.613b).',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      let z = '';
      for (let y = L.top + 6; y < L.bot - 6; y += 16) z += `<rect x="880" y="${y}" width="44" height="9" fill="#f3f3f0"/>`;
      s.raw(z);
      s.sign(560, 580, 'school', 'CROSSING'); s.sign(1240, 320, 'school', 'CROSSING');
      const g = s.person({ kind: 'guard', label: 'Crossing guard', path: s.P(900, L.bot + 40, 0.6).to(900, L.y + 10, 1.8).wait(7.4).to(900, L.bot + 40, 8.6) });
      g.set(0, 'sign', true).set(8.6, 'sign', false);
      for (let i = 0; i < 3; i++) s.person({ kind: 'child', color: ['#e05d8e', '#3f8f5c', '#e3a72a'][i], path: s.P(912 + i * 6, L.bot + 60 + i * 26, 4.2 + i * 0.4).to(912 + i * 6, L.top - 50, 7.2 + i * 0.4) });
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(820, L.E(0), 2.8, 'out').wait(8.8).to(1750, L.E(0), 11, 'in') });
      s.mark(3, 7.4, 0, 0, 'ok', { follow: a, dy: -70 });
      const b = s.car({ kind: 'car', color: COL.red, path: s.P(1750, L.W(0), 1.4).to(-120, L.W(0), 5.6) });
      b.set(2.4, 'label', 'Doesn’t stop').set(2.4, 'labelColor', 'bad');
      s.mark(3.6, 6.2, 900, 330, 'x');
      s.say(0, 'A school crossing guard walks into the crosswalk holding a STOP sign upright.')
        .say(2.2, 'The eastbound driver stops.', 'good')
        .say(3, 'The westbound driver goes past the guard’s raised STOP sign.', 'bad')
        .say(4.8, 'That’s a misdemeanor. If the car is identified, its registered owner is presumed to be the driver.', 'warn')
        .say(8.6, 'With the children across and the sign lowered, traffic may go.', 'good');
    },
  });

  LAW.add({
    sec: '614', div: 'sig', title: 'Flashing red and flashing yellow signals',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      '**Flashing red** means stop: stop before the crosswalk or stop line, then proceed under the same rules as a stop sign.',
      '**Flashing yellow** means caution: you may proceed through the intersection or past the signal, but only with caution.',
    ],
    dur: 10.6,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      for (const d of ['E', 'W']) s.light(...L.corner(d), [[0, 'FY']]);
      for (const d of ['N', 'S']) s.light(...L.corner(d), [[0, 'FR']]);
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(480, L.E(0), 2.2).to(700, L.E(0), 3.4).to(1750, L.E(0), 6.6) });
      a.mph([[0, 35], [2.2, 25], [3.6, 35]]);
      const b = s.car({ kind: 'car', color: COL.gold, path: s.P(L.N(0), 1000, 0).to(L.N(0), L.stopAt('N'), 2.2, 'out').wait(5.4).to(L.N(0), -120, 8.4, 'in') });
      s.mark(2.4, 5.4, 0, 0, 'ok', { follow: b, dx: 60, dy: 0 });
      const d = s.car({ kind: 'car', color: COL.red, path: s.P(L.S(0), -120, 6.4).to(L.S(0), 1000, 10.2) });
      d.set(6.4, 'label', 'Ignores flashing red').set(6.4, 'labelColor', 'bad');
      s.mark(7.6, 10.4, 640, 330, 'x');
      s.say(0, 'Flashing yellow faces east–west traffic. Flashing red faces north–south traffic.')
        .say(1.6, 'Flashing yellow: you may go through, but slow down and proceed with caution.', 'good')
        .say(2.6, 'Flashing red: treat it exactly like a stop sign. Stop, then yield before going.', 'good')
        .say(6.8, 'This driver goes through the flashing red without stopping.', 'bad');
    },
  });

  LAW.add({
    sec: '616a', div: 'sig', title: 'Signal preemption devices (“light changers”)',
    penalty: 'mixed', penaltyText: 'Misdemeanor (possession) · felony (use)',
    rule: [
      'A **portable signal preemption device** is any device that can change a traffic signal to green out of sequence.',
      'Possessing one: misdemeanor, up to 90 days and/or $5,000.',
      'Using one: felony, up to 2 years / $10,000. If that causes a crash, up to 5 years / $15,000; serious injury, up to 10 years / $20,000; death, up to 15 years / $25,000.',
      'Selling one to, or buying one for, an unauthorized person: felony, up to 2 years / $10,000.',
      'Exempt: police, fire, EMS, and authorized emergency vehicles on duty (and shippers or manufacturers moving devices to them).',
    ],
    dur: 14,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      s.light(...L.corner('E'), [[0, 'R'], [2.8, 'G']]);
      s.light(...L.corner('N'), [[0, 'G'], [2.3, 'Y'], [2.8, 'R']]);
      const c = s.car({ kind: 'car', color: COL.red, label: 'Has a light changer', path: s.P(-100, L.E(0), 0).to(470, L.E(0), 2.3, 'out').to(1750, L.E(0), 6, 'in') });
      c.set(0, 'labelColor', 'bad').set(1, 'waves', '#ffffff').set(2.9, 'waves', null);
      s.note(1.1, 2.9, 0, 0, 'Strobe triggers the signal', 'bad', { follow: c, dy: -110 });
      const n = s.car({ kind: 'suv', color: COL.white, path: s.P(L.N(0), 1000, 0.6).to(L.N(0), L.stopAt('N'), 3.4, 'out').wait(14) });
      n.set(2.6, 'brake', true);
      s.raw(K.table(800, 450, [
        ['Possess', 'Misdemeanor · up to 90 days / $5,000', '#7d8790'],
        ['Use', 'Felony · up to 2 years / $10,000', '#d88a0f'],
        ['Use → crash', 'Felony · up to 5 years / $15,000', '#d0452f'],
        ['→ serious injury', 'Felony · up to 10 years / $20,000', '#b02a20'],
        ['→ death', 'Felony · up to 15 years / $25,000', '#7a160f'],
      ], { title: 'Signal preemption devices (MCL 257.616a)', w: 1100, lw: 250 }), { t0: 6.6, t1: 14, fade: 0.4, layer: 'fx' });
      s.say(0, 'The light is red for this driver, who has an illegal signal preemption device.')
        .say(1.2, 'The device flashes at the signal and forces it to turn green out of sequence.', 'bad')
        .say(2.6, 'Cross traffic suddenly gets a red and has to brake hard.', 'bad')
        .say(4.4, 'Only police, fire, and EMS may use these devices, and only on duty.', 'info')
        .say(6.8, 'Just possessing one is a crime. Using one is a felony, with longer sentences if anyone is hurt.', 'warn');
    },
  });
})();
