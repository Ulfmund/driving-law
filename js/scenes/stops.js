/* Special stops required: MCL 257.667 – 257.671 */
(function () {
  const { COL } = K;
  const F = 'font-family="system-ui,Segoe UI,Arial"';
  const FT = DL.FT;

  // Shared railroad setup: crossbucks, optional gates and lights, and the 15–50 ft stop band for eastbound traffic.
  function crossing(s, o = {}) {
    s.bg('rail', { tx: 900 });
    const L = s.lane;
    const rail = L.railW;
    if (o.band) s.zone(o.band[0], o.band[1], { rect: [rail - 50 * FT, L.E(0) - 30, 35 * FT, 60] }, '#1f9d55', 'Stop here: 15–50 ft', { ly: 62, fo: 0.18 });
    if (o.gates) {
      s.gate(rail - 100, L.bot + 16, o.gates, { down: -90, len: 112, flash: o.flash });
      s.gate(L.railE + 100, L.top - 16, o.gates, { down: 90, len: 112, flash: o.flash });
    } else {
      s.sign(rail - 120, L.bot + 90, o.stopSign ? 'stop' : 'rr');
      s.sign(L.railE + 120, L.top - 40, o.stopSign ? 'stop' : 'rr');
      if (o.stopSign) { s.sign(rail - 190, L.bot + 90, 'rr'); }
    }
    return { L, rail };
  }
  const stopFront = (rail, ft) => rail - ft * FT; // front bumper x for a stop `ft` feet from the nearest rail

  LAW.add({
    sec: '667', div: 'stop', title: 'Stopping at railroad crossings',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Stop **not more than 50 feet and not less than 15 feet** from the nearest rail, and don’t proceed until it’s safe, when: a signal warns of an approaching train; a **gate is lowered** or a flagger signals; a train within about 1,500 feet sounds a signal and is an immediate hazard; or an approaching train is **plainly visible** and dangerously close.',
      'Never drive **through, around, or under** a crossing gate while it is closed, opening, or closing, or against a police officer’s direction.',
    ],
    dur: 13,
    build(s) {
      const { L, rail } = crossing(s, { gates: [[0, 0], [1.4, 0], [2.4, 1], [9.6, 1], [10.6, 0]], flash: [[1, true], [10.6, false]], band: [3, 9.6] });
      s.car({ kind: 'train', path: s.P(900, -760, 3.6).to(900, 1650, 9.4) });
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(stopFront(rail, 42) - 32, L.E(0), 3, 'out').wait(10.8).to(1760, L.E(0), 13, 'in') });
      b.set(2.4, 'brake', true).set(10.8, 'brake', false);
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(1760, L.W(0), 0.8).to(1060, L.W(0), 2.6).curve(1000, L.W(0), 960, L.E(0), 3).to(830, L.E(0), 3.3).curve(780, L.E(0), 720, L.W(0), 3.7).to(-120, L.W(0), 5.4) });
      r.set(2.4, 'label', 'Goes around the gate').set(2.4, 'labelColor', 'bad').set(4.6, 'label', null);
      s.mark(3.4, 6.4, 1010, L.top - 110, 'x');
      s.say(0, 'Lights begin flashing and the gates come down: a train is coming.')
        .say(2.4, 'This driver weaves around the lowered gate, seconds ahead of the train.', 'bad')
        .say(3.6, 'This driver stops between 15 and 50 feet from the nearest rail.', 'good')
        .say(6, 'Never drive through, around, or under a gate that’s down, opening, or closing.', 'warn')
        .say(10.6, 'Once the train has passed and the gates are up, proceed when it’s safe.', 'good');
    },
  });

  LAW.add({
    sec: '667a', div: 'stop', title: 'Cameras at railroad crossings',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'State or local authorities may install **unmanned traffic monitoring devices** at crossings that have flashing signals and gates, if the device is marked or a sign warns of it.',
      'Violations of MCL 257.667 caught on camera are civil infractions, but only **warnings** are issued for the first 30 days after installation.',
      'The registered owner is presumed to be the driver unless they swear they weren’t or show a stolen-vehicle report. Malfunctioning crossing signals are an affirmative defense.',
      'Citations may be mailed. Images must be destroyed 90 days after the citation is resolved.',
    ],
    dur: 11,
    build(s) {
      const { L } = crossing(s, { gates: [[0, 0], [1, 0], [2, 1], [11, 1]], flash: [[0.6, true]] });
      s.raw(`<g transform="translate(700,${L.bot + 110})"><rect x="-3" y="-60" width="6" height="60" fill="#555"/><rect x="-26" y="-84" width="52" height="30" rx="6" fill="#2a2f36"/><circle cx="14" cy="-69" r="9" fill="#5ad0ff"/></g>`, { layer: 'labels' });
      s.sign(480, L.bot + 100, 'text', 'PHOTO ENFORCED');
      s.raw(`<circle cx="700" cy="${L.bot + 40}" r="80" fill="#fff" opacity=".85"/>`, { t0: 3.0, t1: 3.25, layer: 'fx' });
      s.car({ kind: 'car', color: COL.gold, path: s.P(-100, L.E(0), 0).to(560, L.E(0), 2.6, 'out').wait(11) }).set(2.2, 'brake', true);
      const r = s.car({ kind: 'suv', color: COL.red, path: s.P(-100, L.E(0), 0.6).to(460, L.E(0), 2.2).curve(540, L.E(0), 600, L.W(0), 2.7).to(900, L.W(0), 3.3).curve(950, L.W(0), 990, L.E(0), 3.6).to(1760, L.E(0), 4.8) });
      r.set(2, 'label', 'Drives around the gates').set(2, 'labelColor', 'bad').set(4.4, 'label', null);
      s.raw(K.ticket(1200, 300, ['Rail crossing violation', 'Mailed to registered owner', 'Warning only in first 30 days'], { title: 'CAMERA CITATION', w: 440 }), { t0: 5.6, layer: 'fx', fade: 0.4 });
      s.say(0, 'This crossing has gates, flashing lights, and a posted camera.')
        .say(2.2, 'A driver swerves around the lowered gates.', 'bad')
        .say(3, 'The camera records the violation.', 'bad')
        .say(5.6, 'A citation can be mailed to the registered owner, who is presumed to have been driving.', 'warn')
        .say(8.4, 'For the first 30 days after a camera is installed, only warnings are issued.');
    },
  });

  LAW.add({
    sec: '668', div: 'stop', title: '“Stop” and “yield” railroad crossings',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Road agencies may designate some crossings as **stop crossings**, with STOP signs. There, drivers must stop **15 to 50 feet** from the tracks and cross only when it’s safe.',
      'At **yield crossings** (a YIELD sign, often on the crossbuck post), drivers must keep a reasonable speed for conditions and yield the right-of-way to trains.',
      'Failing to stop or yield as required is a civil infraction.',
    ],
    dur: 11,
    build(s) {
      const { L, rail } = crossing(s, { stopSign: true, band: [0.4, 5.6] });
      s.dim(1.2, 5.6, rail, L.E(0) + 70, rail - 15 * FT, L.E(0) + 70, '15 ft', { color: '#ffd34d', ly: 30 });
      s.dim(1.2, 5.6, rail, L.E(0) + 116, rail - 50 * FT, L.E(0) + 116, '50 ft', { color: '#ffd34d', ly: 30 });
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(stopFront(rail, 30) - 32, L.E(0), 2.6, 'out').wait(4.2).to(1760, L.E(0), 6.8, 'in') });
      b.set(2.2, 'brake', true).set(4.2, 'brake', false);
      s.note(2.6, 4.2, 0, 0, 'Stops, looks both ways', 'good', { follow: b });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 6.6).to(1760, L.E(0), 10.4) });
      r.set(6.8, 'label', 'Ignores the STOP sign').set(6.8, 'labelColor', 'bad');
      s.mark(8, 10.6, rail, L.top - 110, 'x');
      s.say(0, 'This crossing is designated a “stop” crossing, with STOP signs at the tracks.')
        .say(1.4, 'Drivers must stop 15 to 50 feet from the tracks, then cross only when it’s safe.', 'good')
        .say(6.8, 'Driving through without stopping is a civil infraction, even with no train in sight.', 'bad')
        .say(9, 'At yield crossings, keep a reasonable speed and yield to any train.');
    },
  });

  LAW.add({
    sec: '669', div: 'stop', title: 'Buses and hazmat trucks stop at every crossing',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Before crossing railroad tracks, drivers of vehicles carrying **16+ passengers** (including the driver), vehicles carrying **passengers for hire**, and vehicles required to display **hazardous materials** placards must:',
      'turn on **hazard lights**, **stop 15–50 feet** from the nearest rail, **look and listen** both ways, and proceed only when safe, **without shifting gears** while crossing.',
      'No stop is required where a police officer or traffic signal directs traffic to proceed, at inactive (covered or removed) tracks, or at crossings marked **EXEMPT**.',
    ],
    dur: 12,
    build(s) {
      const { L, rail } = crossing(s, { band: [0.4, 12] });
      const bus = s.car({ kind: 'school', path: s.P(-200, L.E(0), 0).to(stopFront(rail, 30) - 75, L.E(0), 2.8, 'out').wait(5).to(1800, L.E(0), 7.6, 'in') });
      bus.set(1.6, 'sig', 'H').set(2.6, 'brake', true).set(5, 'brake', false).set(6.4, 'sig', null);
      s.note(2.9, 5, 0, 0, 'Hazards on · stops · looks & listens', 'good', { follow: bus });
      const tk = s.car({ kind: 'truck', color: '#d0452f', path: s.P(-200, L.E(0), 6.6).to(stopFront(rail, 30) - 56, L.E(0), 9, 'out').wait(10.4).to(1800, L.E(0), 12.6, 'in') });
      tk.set(7.4, 'sig', 'H').set(8.8, 'brake', true).set(10.4, 'brake', false);
      s.note(9, 10.4, 0, 0, 'Hazmat placard: must stop too', 'good', { follow: tk });
      s.say(0, 'A school bus approaches a crossing with no train in sight.')
        .say(1.6, 'Buses carrying 16 or more people must turn on their hazards and stop 15–50 feet from the tracks.', 'good')
        .say(3.4, 'The driver looks and listens both ways, then crosses without shifting gears on the tracks.', 'good')
        .say(6.8, 'Vehicles with hazardous materials placards follow the same rules, as do vehicles carrying passengers for hire.', 'good')
        .say(10.4, 'Exceptions: police or a signal directs traffic through, the tracks are inactive, or the crossing is marked EXEMPT.');
    },
  });

  LAW.add({
    sec: '670', div: 'stop', title: 'Moving heavy equipment across tracks',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Applies to crawler tractors, shovels, rollers, and similar equipment with a normal top speed of **4 mph or less**, or less than **9 inches** of ground clearance.',
      'Before crossing, give **notice to the railroad** in time for it to protect its trains.',
      'Stop **15–50 feet** from the nearest rail, look and listen both ways, and cross only when it’s safe. Never cross when a signal, gate, or flagger warns of a train.',
    ],
    dur: 11,
    build(s) {
      const { L, rail } = crossing(s, { band: [2.4, 6] });
      const roller = `<rect x="-58" y="-28" width="116" height="56" rx="8" fill="#f1c40f" stroke="#7a6206" stroke-width="2"/><rect x="18" y="-34" width="34" height="68" rx="10" fill="#555"/><rect x="-46" y="-34" width="34" height="68" rx="10" fill="#555"/><rect x="-14" y="-18" width="26" height="36" rx="4" fill="#22313f"/>`;
      const eq = s.thing({ svg: roller, label: 'Road roller · 3 mph', path: s.P(380, L.E(0), 0).to(stopFront(rail, 30) - 58, L.E(0), 2.4, 'out').wait(6).to(1300, L.E(0), 11) });
      void eq;
      s.raw(`<g transform="translate(330,250)"><rect x="-210" y="-50" width="420" height="100" rx="14" fill="#18202a" stroke="rgba(255,255,255,.2)"/><text y="-8" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" ${F}>📞 Railroad notified</text><text y="26" text-anchor="middle" font-size="20" fill="#cfd8e3" ${F}>before the crossing</text></g>`, { t0: 0.4, layer: 'fx', fade: 0.3 });
      s.note(2.4, 6, 0, 0, 'Stops, looks, listens', 'good', { follow: eq });
      s.say(0, 'Slow equipment, like this 3 mph road roller, must notify the railroad before crossing.')
        .say(2.4, 'It stops 15–50 feet from the nearest rail and the operator looks and listens both ways.', 'good')
        .say(6, 'With the track clear and no warnings, it crosses.', 'good')
        .say(8.4, 'If a signal, gate, or flagger warns of a train, it may not cross.', 'warn');
    },
  });

  LAW.add({
    sec: '671', div: 'stop', title: 'Stop, yield, and merge signs',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Road agencies may designate **through highways** and place stop, yield, or merge signs where other roads enter them, or make any intersection a stop, yield, or merge intersection.',
      'Every stop, yield, and merge sign must be **reflectorized or lighted** at night and placed as near as practicable to the crosswalk (or the edge of the road).',
      'Failing to obey one of these signs is a civil infraction.',
    ],
    dur: 10,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      s.night(0.65);
      s.sign(...L.corner('N'), 'stop'); s.sign(...L.corner('S'), 'stop');
      s.text(0, 10, 260, L.E(0) - 90, 'THROUGH HIGHWAY →', { size: 24, color: '#fff' });
      s.car({ kind: 'car', color: COL.gold, path: s.P(-100, L.E(0), 0.4).to(1760, L.E(0), 4.2) });
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(L.N(0), 1000, 0).to(L.N(0), L.stopAt('N'), 2.2, 'out').wait(4.4).to(L.N(0), -120, 6.8, 'in') });
      a.set(1.8, 'brake', true).set(4.4, 'brake', false);
      s.mark(2.4, 5, 0, 0, 'ok', { follow: a, dx: 70 });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(L.S(0), -120, 5.6).to(L.S(0), 1000, 8.4) });
      r.set(5.8, 'label', 'Rolls through').set(5.8, 'labelColor', 'bad');
      s.mark(6.8, 9.4, L.S(0) - 120, 330, 'x');
      s.say(0, 'At night, the reflective stop signs on the side road shine in the headlights.')
        .say(1.8, 'This driver stops, waits for the through traffic, then goes.', 'good')
        .say(5.8, 'This driver rolls through the stop sign. That’s a civil infraction.', 'bad');
    },
  });
})();
