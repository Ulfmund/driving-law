/* Accidents: MCL 257.617 – 257.624b */
(function () {
  const { COL } = K;

  LAW.add({
    sec: '617', div: 'acc', title: 'Leaving the scene: serious injury or death',
    penalty: 'felony', penaltyText: 'Felony',
    rule: [
      'A driver who knows, or has reason to believe, they were in a crash on public property or private property open to the public must **stop immediately and stay** until they’ve met the duties in MCL 257.619 (information, license, aid).',
      'Exception: if the driver honestly and reasonably believes staying would lead to further harm, they may leave **only to immediately report** the crash to the nearest police agency.',
      'Leaving when the crash causes **serious impairment of a body function or death**: felony, up to 5 years and/or $5,000.',
      'If the driver **caused** the crash and someone dies: felony, up to 15 years and/or $10,000.',
    ],
    dur: 15,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      s.night(0.7);
      const bike = s.car({ kind: 'bike', color: '#3f8f5c', label: 'Bicyclist', labelBelow: true, path: s.P(300, L.bot - 12, 0).to(735, L.bot - 12, 2.4) });
      bike.set(2.45, 'show', false);
      s.prop(770, L.bot + 30, 'person-down', { t0: 2.45, rot: 20, layer: 'labels' });
      s.text(2.6, 15, 770, L.bot + 74, 'Seriously injured', { size: 22, stroke: '#000', sw: 5, layer: 'labels' });
      s.raw(`<g transform="translate(830,${L.bot + 22}) rotate(70)"><rect x="-15" y="-2" width="30" height="4" rx="2" fill="#ccc"/></g>`, { t0: 2.45, layer: 'labels' });
      const c = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 0).to(500, L.E(0), 1.6).curve(620, L.E(0), 702, L.bot - 18, 2.4).curve(790, L.bot - 18, 880, L.E(0), 3.0).to(1760, L.E(0), 5, 'in') });
      c.set(2.4, 'brake', true).set(2.9, 'brake', false).set(3, 'label', 'Drives off').set(3, 'labelColor', 'bad');
      s.boom(2.4, 735, L.bot - 14, { text: 'HIT' });
      s.raw(K.table(800, 450, [
        ['Damage only', 'Misdemeanor · up to 90 days / $100 (257.618)', '#7d8790'],
        ['Injury', 'Misdemeanor · up to 1 year / $1,000 + suspension (257.617a)', '#d88a0f'],
        ['Serious injury or death', 'Felony · up to 5 years / $5,000 (257.617)', '#d0452f'],
        ['Caused it + death', 'Felony · up to 15 years / $10,000 (257.617)', '#7a160f'],
      ], { title: 'Leaving the scene of a crash', w: 1100, lw: 270, fs: 19 }), { t0: 6.6, t1: 15, fade: 0.4, layer: 'fx' });
      s.say(0, 'Night. A driver drifts toward the edge of the road.')
        .say(2.4, 'The car strikes a bicyclist, who is seriously injured.', 'bad')
        .say(3.1, 'The driver knows there was a crash but drives away.', 'bad')
        .say(4.6, 'Drivers must stop at once and stay to give information and help the injured.', 'warn')
        .say(6.8, 'Penalties rise with the harm. Here it’s a felony: serious injury, up to 5 years.', 'warn')
        .say(10.6, 'Leaving is excused only if staying would honestly risk more harm, and the driver immediately reports to police.');
    },
  });

  LAW.add({
    sec: '617a', div: 'acc', title: 'Leaving the scene: injury',
    penalty: 'misd', penaltyText: 'Misdemeanor + license suspension',
    rule: [
      'Same duty to stop and remain as MCL 257.617, applying to any crash on public property or private property open to travel.',
      'Leaving when the crash **injures anyone**: misdemeanor, up to 1 year and/or $1,000.',
      'The Secretary of State must also **suspend** the driver’s license after a conviction.',
    ],
    dur: 12,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      const b = s.car({ kind: 'car', color: COL.white, labelBelow: true, path: s.P(900, L.E(0), 0).wait(2.2).to(920, L.E(0) + 4, 2.5, 'out').wait(12) });
      b.set(0, 'sig', 'L').set(0, 'brake', true).set(2.4, 'label', 'Driver injured').set(2.4, 'labelColor', 'bad');
      const a = s.car({
        kind: 'car', color: COL.red,
        path: s.P(-100, L.E(0), 0).to(836, L.E(0), 2.2).wait(2.8).to(760, L.E(0), 3.6, 'out', true)
          .curve(860, L.W(0), 960, L.W(0), 4.6, 'in').to(1060, L.W(0), 4.9).curve(1140, L.W(0), 1200, L.E(0), 5.4).to(1760, L.E(0), 6.6),
      });
      a.set(3, 'label', 'Leaves the scene').set(3, 'labelColor', 'bad').set(6.6, 'label', null);
      s.boom(2.2, 868, L.E(0), { text: 'BANG' });
      s.say(0, 'A driver is stopped, waiting to turn left.')
        .say(2.2, 'The car behind doesn’t stop in time and rear-ends it. The other driver is hurt.', 'bad')
        .say(3.4, 'The at-fault driver backs up, goes around, and leaves.', 'bad')
        .say(5.6, 'Leaving the scene of an injury crash: misdemeanor, up to 1 year and/or $1,000, plus a license suspension.', 'warn')
        .say(8.6, 'The driver had to stay, share information, and help get medical aid, or go straight to police if staying risked more harm.');
    },
  });

  LAW.add({
    sec: '618', div: 'acc', title: 'Leaving the scene: damage to an occupied vehicle',
    penalty: 'misd', penaltyText: 'Misdemeanor',
    rule: [
      'Same duty to stop and remain applies when a crash only damages a vehicle that someone is driving or attending.',
      'Leaving: misdemeanor, up to 90 days and/or $100.',
      'Make the stop without obstructing traffic more than necessary.',
    ],
    dur: 15,
    build(s) {
      s.bg('road', { lanes: 2, vy: 500 });
      const L = s.lane;
      const run = (T, leave) => {
        const b = s.car({ kind: 'suv', color: COL.white, path: s.P(-100, L.E(0), T - 2.4).to(640, L.E(0), T).to(leave ? 900 : 780, L.E(0), T + 0.8, 'out').curve(leave ? 980 : 830, L.E(0), leave ? 1040 : 860, L.E(0) + 46, T + 1.4).to(leave ? 1100 : 880, L.E(0) + 46, T + 1.8, 'out').wait(T + 5.4) });
        b.set(T, 'brake', true).set(T + 1.6, 'sig', 'H');
        if (leave) b.set(T + 3.4, 'show', false);
        const a = s.car({
          kind: 'car', color: COL.red,
          path: leave
            ? s.P(-180, L.E(1), T - 2.4).to(480, L.E(1), T - 0.6).curve(600, L.E(1), 690, L.E(0) - 30, T).curve(780, L.E(0) - 22, 880, L.E(1), T + 0.6).to(1760, L.E(1), T + 2.6, 'in')
            : s.P(-180, L.E(1), T - 2.4).to(480, L.E(1), T - 0.6).curve(600, L.E(1), 690, L.E(0) - 30, T).curve(800, L.E(0) - 26, 900, L.E(0) + 10, T + 0.6).curve(950, L.E(0) + 46, 1000, L.E(0) + 46, T + 1.1, 'out').wait(T + 7),
        });
        if (leave) a.set(T + 0.6, 'label', 'Keeps going').set(T + 0.6, 'labelColor', 'bad');
        else a.set(T + 1.2, 'sig', 'H');
        s.boom(T, 690, L.E(0) - 15, { text: 'SCRAPE', hold: 0.8 });
      };
      run(2.6, true);
      run(8.6, false);
      s.person({ kind: 'driver', color: '#d0452f', path: s.P(1000, L.bot + 44, 10.4).to(962, L.bot + 44, 10.9).wait(15) }).set(0, 'show', false).set(10.4, 'show', true);
      s.person({ kind: 'driver', color: '#7d8790', path: s.P(880, L.bot + 44, 10.4).to(916, L.bot + 44, 10.9).wait(15) }).set(0, 'show', false).set(10.4, 'show', true);
      s.note(11, 15, 939, L.bot + 44, 'Names · addresses · registration · licenses', 'good', { dy: 110 });
      s.say(0, 'Two cars are traveling side by side.')
        .say(2.6, 'One driver changes lanes into the other and scrapes it.', 'bad')
        .say(3.3, 'Then keeps going.', 'bad')
        .say(4.6, 'Leaving the scene when an occupied vehicle is damaged: misdemeanor, up to 90 days and/or $100.', 'warn')
        .say(6.4, 'Now the right way.')
        .say(9.4, 'Both drivers pull onto the shoulder so they don’t block traffic more than necessary.', 'good')
        .say(10.9, 'They exchange names, addresses, and registration, and show their licenses.', 'good');
    },
  });

  LAW.add({
    sec: '618a', div: 'acc', title: 'Move crashed cars out of traffic',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'After a crash, unless the driver knows (or should know) someone was seriously injured or killed, the driver or another licensed occupant must move the vehicle out of the travel lanes, to the shoulder, emergency lane, median, or another safe place, **if** it can be moved safely and driven normally.',
      'Moving it before police arrive doesn’t make that driver presumed at fault, and the decision to move or not can’t be used in a civil suit as evidence about serious injury.',
      'Police may also have blocking vehicles, cargo, and debris removed.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 2, vy: 500 });
      const L = s.lane;
      const x = s.car({ kind: 'car', color: COL.white, path: s.P(300, L.E(0), 0).to(900, L.E(0), 2, 'out').wait(6).to(1000, L.E(0), 6.4, 'in').curve(1060, L.E(0), 1100, L.E(0) + 46, 6.9).to(1200, L.E(0) + 46, 7.3, 'out').wait(11) });
      const y = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 0).to(836, L.E(0), 2).wait(6.2).to(900, L.E(0), 6.7, 'in').curve(960, L.E(0), 1000, L.E(0) + 46, 7.2).to(1100, L.E(0) + 46, 7.5, 'out').wait(11) });
      x.set(2, 'sig', 'H'); y.set(2, 'sig', 'H');
      s.boom(2, 868, L.E(0), { text: 'BUMP', hold: 0.8 });
      const q1 = s.car({ kind: 'car', color: COL.gold, path: s.P(-100, L.E(0), 1.4).to(760, L.E(0), 3.6, 'out').wait(7.1).to(1760, L.E(0), 10, 'in') });
      q1.set(3, 'brake', true).set(7.1, 'brake', false);
      const q2 = s.car({ kind: 'suv', color: COL.gray, path: s.P(-100, L.E(0), 2.1).to(684, L.E(0), 4.2, 'out').wait(7.4).to(1760, L.E(0), 10.6, 'in') });
      q2.set(3.6, 'brake', true).set(7.4, 'brake', false);
      s.car({ kind: 'car', color: COL.teal, path: s.P(-100, L.E(1), 2.4).to(1760, L.E(1), 7.2) });
      s.zone(2.6, 6, { rect: [580, L.E(0) - 34, 380, 68] }, '#d63a2f', 'LANE BLOCKED', { ly: -54 });
      s.mark(7.6, 11, 1150, L.E(0) + 110, 'ok');
      s.say(0, 'A minor rear-end crash on a busy road. No one is seriously hurt.')
        .say(2.6, 'Staying in the lane blocks traffic and risks a second crash.', 'bad')
        .say(4.4, 'When no one is seriously hurt and the cars can be driven safely, the law requires moving them out of the travel lanes.', 'warn')
        .say(6.4, 'They move to the shoulder. That doesn’t make either driver presumed at fault.', 'good')
        .say(8.6, 'Leaving a drivable car in the lane when it could be moved safely is a civil infraction.');
    },
  });

  LAW.add({
    sec: '619', div: 'acc', title: 'Duties of a driver after a crash',
    penalty: 'mixed', penaltyText: 'Enforced through MCL 257.617–257.618',
    rule: [
      'A driver in a crash with a person, or with a vehicle someone is driving or attending, must:',
      '**Give** their name and address, the vehicle’s registration number, and the owner’s name and address, to police, the person struck, or the other vehicle’s driver or occupants.',
      '**Show** their driver’s license to the same people.',
      '**Render reasonable assistance** to anyone injured in securing medical aid, including arranging or providing transportation.',
    ],
    dur: 12.5,
    build(s) {
      s.bg('cross', { lanes: 1, zoom: 1500, vx: 860 });
      const L = s.lane;
      s.car({ kind: 'car', color: COL.red, at: [770, L.E(0), 8] }).set(0, 'sig', 'H');
      s.car({ kind: 'suv', color: COL.white, at: [L.N(0) + 10, L.E(0) - 36, -64] }).set(0, 'sig', 'H');
      s.prop(880, 560, 'person-down', { rot: -10 });
      s.person({ kind: 'driver', color: '#d0452f', path: s.P(760, 520, 0.4).to(830, 555, 1.6).wait(12.5) });
      s.person({ kind: 'driver', color: '#7d8790', path: s.P(870, 400, 0.4).to(905, 520, 1.6).wait(12.5) });
      s.note(7, 12.5, 830, 555, '📞 Calling 9-1-1', 'good', { dx: -230, dy: 130 });
      const x0 = 1030;
      s.raw(`<rect x="${x0 - 20}" y="140" width="560" height="96" rx="16" fill="#18202a" stroke="rgba(255,255,255,.2)" stroke-width="2"/>
        <text x="${x0 + 260}" y="200" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial">After a crash, every driver must:</text>`, { t0: 0.6, layer: 'fx', fade: 0.3 });
      s.raw(K.checkRow(x0 - 20, 290, 'Give name, address, registration\nnumber, and owner’s name/address', true, { w: 560, h: 74 }), { t0: 2.2, layer: 'fx', fade: 0.3 });
      s.raw(K.checkRow(x0 - 20, 380, 'Show their driver’s license', true, { w: 560, h: 74 }), { t0: 4.6, layer: 'fx', fade: 0.3 });
      s.raw(K.checkRow(x0 - 20, 470, 'Help get medical aid for anyone\ninjured, including transportation', true, { w: 560, h: 74 }), { t0: 7, layer: 'fx', fade: 0.3 });
      s.say(0, 'After a crash involving another person or an occupied vehicle, every driver has three duties.')
        .say(2.2, '1. Give their name and address, the registration number, and the owner’s name and address.', 'good')
        .say(4.6, '2. Show their driver’s license to the other driver, the person struck, or police.', 'good')
        .say(7, '3. Help anyone injured get medical aid, including arranging or providing transportation.', 'good')
        .say(9.8, 'Leaving before these are done is what makes it “leaving the scene” under MCL 257.617–618.', 'warn');
    },
  });

  LAW.add({
    sec: '620', div: 'acc', title: 'Hitting an unattended vehicle',
    penalty: 'misd', penaltyText: 'Misdemeanor (general penalty, MCL 257.901)',
    rule: [
      'A driver who collides with any vehicle, attended or **unattended**, on public or private property must **stop immediately**.',
      'They must then find and notify the operator or owner with the name and address of the driver and of the owner of the striking vehicle.',
      'If the owner can’t be found, they must report it **right away** to the nearest or most convenient police officer.',
    ],
    dur: 15,
    build(s) {
      s.bg('road', { lanes: 1, curb: true, parking: true, city: true, center: 'double' });
      const L = s.lane;
      for (const x of [500, 640, 900]) s.car({ kind: x === 640 ? 'suv' : 'car', color: x === 640 ? COL.gold : COL.gray, at: [x, L.parkE, 0] });
      for (const x of [560, 1080, 1260]) s.car({ kind: 'car', color: COL.teal, at: [x, L.parkW, 180] });
      const a = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 0).to(540, L.E(0), 1.6).curve(610, L.E(0), 660, L.E(0) + 15, 2).curve(720, L.E(0) + 17, 800, L.E(0), 2.6).to(1760, L.E(0), 5) });
      a.set(2.6, 'label', 'Drives away').set(2.6, 'labelColor', 'bad').set(5, 'show', false);
      s.boom(2, 666, L.E(0) + 30, { text: 'SCRAPE', hold: 0.7 });
      const b = s.car({ kind: 'car', color: COL.purple, path: s.P(-100, L.E(0), 6).to(540, L.E(0), 7.6).curve(610, L.E(0), 660, L.E(0) + 15, 8).curve(720, L.E(0) + 17, 800, L.E(0), 8.6).to(1100, L.E(0), 9.3).curve(1180, L.E(0), 1220, L.parkE, 9.9).to(1250, L.parkE, 10.2, 'out').wait(15) });
      b.set(8.6, 'brake', true).set(9.2, 'sig', 'R').set(10.2, 'sig', null);
      s.boom(8, 666, L.E(0) + 30, { text: 'SCRAPE', hold: 0.7 });
      const d = s.person({ kind: 'driver', color: '#8457c4', path: s.P(1240, L.curbE + 28, 10.4).to(700, L.curbE + 28, 12).wait(15) });
      d.set(0, 'show', false).set(10.4, 'show', true);
      s.note(12, 13, 700, L.curbE + 28, 'Owner? Not here.', 'info', { dy: 100 });
      s.note(13, 15, 700, L.curbE + 28, '📞 Reports it to police', 'good', { dy: 100 });
      s.say(0, 'A row of parked cars, with no one in them.')
        .say(2, 'A driver clips the side of a parked SUV...', 'bad')
        .say(2.8, '...and drives away without telling anyone.', 'bad')
        .say(4.2, 'The law requires stopping and notifying the owner, or police if the owner can’t be found.', 'warn')
        .say(6.2, 'Now the right way.')
        .say(10.4, 'The driver stops and looks for the owner to give their name and address and the owner’s.', 'good')
        .say(13, 'With no owner to be found, they report the crash to police right away.', 'good');
    },
  });

  LAW.add({
    sec: '621', div: 'acc', title: 'Damaging property beside the road',
    penalty: 'misd', penaltyText: 'Misdemeanor (general penalty, MCL 257.901)',
    rule: [
      'If a crash damages only **fixtures** legally on or next to a highway (fences, signs, poles, mailboxes, guardrail), the driver must take reasonable steps to find and notify the owner or person in charge.',
      'Give the driver’s name and address and the vehicle’s registration number, and show a driver’s license on request.',
      'If the owner can’t be found, report the crash right away to the nearest or most convenient police officer.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed', scenery: false });
      const L = s.lane;
      for (const [x, y] of [[200, 200], [420, 160], [1300, 230], [240, 780], [520, 820]]) s.prop(x, y, 'tree', { s: 1.2 });
      s.prop(1180, 760, 'house', { w: 150, h: 110, c: '#9c6b4f' });
      const fence = y => { let f = `<line x1="640" y1="${y}" x2="1360" y2="${y}" stroke="#8a5a3b" stroke-width="5"/>`; for (let x = 640; x <= 1360; x += 40) f += `<rect x="${x - 4}" y="${y - 6}" width="8" height="12" fill="#6b4226"/>`; return f; };
      const fy = L.bot + 60;
      s.raw(fence(fy), { t0: 0, t1: 2.6 });
      s.raw(fence(fy).replace(/<line[^>]*>/, `<line x1="640" y1="${fy}" x2="860" y2="${fy}" stroke="#8a5a3b" stroke-width="5"/><line x1="960" y1="${fy}" x2="1360" y2="${fy}" stroke="#8a5a3b" stroke-width="5"/>`) +
        `<path d="M 860 ${fy} L 880 ${fy + 30} M 960 ${fy} L 930 ${fy + 34}" stroke="#8a5a3b" stroke-width="5"/>`, { t0: 2.6 });
      s.car({ kind: 'car', color: COL.you, path: s.P(-100, L.E(0), 0).to(600, L.E(0), 1.8).curve(760, L.E(0), 880, fy + 4, 2.6, 'out').wait(11) }).set(2.6, 'sig', 'H');
      s.boom(2.6, 910, fy, { text: 'CRUNCH', hold: 0.8 });
      const d = s.person({ kind: 'driver', color: '#2f6fd6', path: s.P(900, fy + 40, 3.6).to(1110, 700, 5).wait(6.6).to(1000, 640, 7.2).wait(11) });
      d.set(0, 'show', false).set(3.6, 'show', true);
      s.note(5, 6.5, 1110, 700, 'Knocks: no one home', 'info', { dy: -100 });
      s.note(7.2, 11, 1000, 640, '📞 Reports to police', 'good', { dy: -110 });
      s.say(0, 'A driver loses control on a rural road.')
        .say(2.6, 'The car breaks through a farm fence. Only roadside property is damaged.', 'bad')
        .say(3.6, 'The driver must try to find the owner, giving name, address, and plate number, and showing a license on request.', 'info')
        .say(6.8, 'If the owner can’t be found, the driver must report the crash to police right away.', 'good');
    },
  });

  LAW.add({
    sec: '624a', div: 'acc', title: 'Open containers of alcohol',
    penalty: 'misd', penaltyText: 'Misdemeanor',
    rule: [
      'No driver or passenger may transport or possess alcohol in an **open, uncapped, or unsealed** container in the **passenger area** of a vehicle on a highway, or of a moving vehicle in any place open to the public, including parking lots.',
      '“Passenger area” includes anywhere readily reachable from a seat, including the glove compartment.',
      'If the vehicle has **no trunk**, an open container may ride in a **locked** glove compartment, behind the last upright seat, or in an area not normally occupied.',
      'Exceptions: passengers in a chartered vehicle authorized by MDOT, and (unless local rules say otherwise) passengers on a commercial quadricycle (pedal pub).',
    ],
    dur: 14,
    build(s) {
      s.bg('cabin');
      const S = s.lane.seats;
      s.raw(K.occupant(...S.driver, { belt: true }) + K.occupant(...S.front, { belt: true, color: '#3f8f5c' }), { layer: 'actors' });
      s.raw(K.can(1000, 450, 'OPEN'), { t0: 0, t1: 5.2, layer: 'fx', fade: 0.3 });
      s.mark(0.8, 5.2, 1000, 330, 'x', { r: 40 });
      s.zone(0.6, 5.2, { rect: [520, 220, 600, 460] }, '#d63a2f', 'PASSENGER AREA', { ly: -250, dash: true, fo: 0.08 });
      s.raw(`<rect x="160" y="300" width="150" height="300" rx="20" fill="#18202a" stroke="#1f9d55" stroke-width="4"/>
        <text x="235" y="290" text-anchor="middle" font-size="24" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial">TRUNK</text>` + K.can(235, 450, 'OPEN'), { t0: 5.4, t1: 9.6, layer: 'fx', fade: 0.3 });
      s.mark(5.8, 9.6, 235, 640, 'ok', { r: 40 });
      s.raw(K.can(470, 380, '') + `<text x="470" y="340" text-anchor="middle" font-size="18" font-weight="800" fill="#fff" stroke="#000" stroke-width="4" paint-order="stroke" font-family="system-ui,Segoe UI,Arial">Behind last seat</text>
        <rect x="1060" y="540" width="80" height="54" rx="8" fill="#2b3036" stroke="#f2c230" stroke-width="3"/><text x="1100" y="574" text-anchor="middle" font-size="16" font-weight="800" fill="#f2c230" font-family="system-ui,Segoe UI,Arial">LOCKED</text>`, { t0: 9.8, t1: 14, layer: 'fx', fade: 0.3 });
      s.text(9.8, 14, 800, 140, 'No trunk (SUV, hatchback)?', { size: 30, stroke: '#000', sw: 6 });
      s.mark(10.2, 14, 470, 480, 'ok', { r: 32 });
      s.say(0, 'There’s an open beer can in the cupholder.')
        .say(1.6, 'An open container anywhere in the passenger area is a misdemeanor, even if no one is drinking.', 'bad')
        .say(5.6, 'Opened bottles and cans can ride in the trunk.', 'good')
        .say(9.8, 'No trunk? Then in a locked glove compartment, behind the last upright seat, or somewhere no one sits.', 'good')
        .say(12.4, 'Passengers in an MDOT-authorized chartered vehicle (like a party bus) are exempt.');
    },
  });

  LAW.add({
    sec: '624b', div: 'acc', title: 'Under 21 transporting alcohol',
    penalty: 'misd', penaltyText: 'Misdemeanor · possible impoundment',
    rule: [
      'A person **under 21** may not knowingly transport or possess alcohol in a motor vehicle, as driver **or** passenger.',
      'Exceptions: a person 21 or older is in the vehicle, or the under-21 person is working for a liquor licensee, designated carrier, or the Liquor Control Commission during regular work hours.',
      'Misdemeanor. The court may order community service and substance abuse screening.',
      'After a driver’s conviction, the court may impound the vehicle for 15–30 days if the owner knew or consented. Police must notify parents of offenders under 18 within 48 hours.',
    ],
    dur: 14,
    build(s) {
      s.bg('cabin');
      const S = s.lane.seats;
      const beer = `<g transform="translate(620,560)"><rect x="-56" y="-40" width="112" height="80" rx="6" fill="#a8763e" stroke="#5c3d1c" stroke-width="3"/><text x="0" y="8" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" font-family="system-ui,Segoe UI,Arial">BEER</text></g>`;
      s.raw(beer, { layer: 'fx' });
      s.raw(K.occupant(...S.driver, { age: 'teen', belt: true }) + K.occupant(...S.front, { age: 'teen', belt: true, color: '#e05d8e' }), { t0: 0, t1: 5.2, layer: 'actors', fade: 0.3 });
      s.text(0.4, 5.2, 910, 200, 'Driver 19 · Passenger 19', { size: 28, stroke: '#000', sw: 6 });
      s.mark(1.6, 5.2, 620, 440, 'x', { r: 40 });
      s.raw(K.occupant(...S.driver, { age: 'teen', belt: true }) + K.occupant(...S.front, { age: 'adult', belt: true, color: '#7d8790' }), { t0: 5.4, t1: 8.8, layer: 'actors', fade: 0.3 });
      s.text(5.4, 8.8, 910, 200, 'Driver 19 · Parent 45', { size: 28, stroke: '#000', sw: 6 });
      s.mark(5.8, 8.8, 620, 440, 'ok', { r: 40 });
      s.raw(K.occupant(...S.driver, { age: 'teen', belt: true, color: '#2a9d9a' }), { t0: 9, t1: 14, layer: 'actors', fade: 0.3 });
      s.text(9, 14, 910, 200, 'On the clock for a licensed store', { size: 28, stroke: '#000', sw: 6 });
      s.mark(9.4, 14, 620, 440, 'ok', { r: 40 });
      s.say(0, 'Two 19-year-olds are driving with a case of beer in the back seat.')
        .say(1.6, 'Anyone under 21 who knowingly transports or possesses alcohol in a vehicle, driver or passenger, commits a misdemeanor.', 'bad')
        .say(5.6, 'Exception: someone 21 or older is in the vehicle.', 'good')
        .say(9.2, 'Exception: delivering for a liquor licensee during regular work hours.', 'good')
        .say(11.8, 'After a conviction, the court may impound the car for 15 to 30 days if the owner knew.', 'warn');
    },
  });
})();
