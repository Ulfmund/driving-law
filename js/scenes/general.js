/* General provisions: MCL 257.601b – 257.603 */
(function () {
  const { COL } = K;

  LAW.add({
    sec: '601b', div: 'gen', title: 'Double fines in work, school, and school bus zones',
    penalty: 'mixed', penaltyText: 'Double fine · misdemeanor or felony if someone is hurt',
    rule: [
      'A moving violation in a **work zone**, at an **emergency scene**, in a **school zone** (from 30 minutes before school until 30 minutes after), or in a **school bus zone** carries **double** the normal fine.',
      'If a violation worth 3 or more points in a work zone or school bus zone **injures** someone there: misdemeanor, up to 1 year and/or $1,000.',
      'If it **kills** someone there: felony, up to 15 years and/or $7,500.',
      'The added penalties don’t apply if the injured or killed person’s own negligence caused it.',
    ],
    dur: 14,
    build(s) {
      s.bg('road', { lanes: 2 });
      const L = s.lane;
      s.zone(0.3, 14, { rect: [520, L.E(0) - 32, 860, 64] }, '#d88a0f', 'WORK ZONE · LANE CLOSED', { ly: 0 });
      s.prop(440, L.E(0) + 18, 'cone'); s.prop(480, L.E(0), 'cone');
      for (let x = 520; x <= 1380; x += 48) s.prop(x, L.E(0) - 30, 'cone');
      s.car({ kind: 'paver', at: [960, L.E(0), 0] });
      s.person({ kind: 'worker', at: [760, L.E(0) + 4, 90] });
      s.person({ kind: 'worker', at: [1150, L.E(0) - 6, 200] });
      s.sign(280, 660, 'work'); s.sign(400, 660, 'speed', '45');
      const a = s.car({ kind: 'car', color: COL.red, path: s.P(-120, L.E(1), 0.6).to(1720, L.E(1), 6.6) });
      a.mph([[0, 62]]).set(0, 'labelColor', 'bad');
      s.note(2.4, 5.2, 0, 0, 'Moving violation in a work zone\n= fine DOUBLED', 'bad', { follow: a, dy: -110 });
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-120, L.E(1), 9.2).to(1250, L.E(1), 14) });
      b.mph([[0, 45]]);
      s.mark(11, 14, 0, 0, 'ok', { follow: b, dy: -80 });
      s.say(0, 'Road work ahead: one lane closed, workers present, 45 mph posted.')
        .say(2.2, 'This driver speeds through at 62 mph, a moving violation inside a work zone.', 'bad')
        .say(4.8, 'The fine is double what the same ticket would cost anywhere else.', 'bad')
        .say(6.8, 'If a 3-point-or-worse violation here injures a worker, it’s a misdemeanor. If it kills one, a felony (up to 15 years).', 'warn')
        .say(9.6, 'Slowing to the posted 45 mph keeps the fine ordinary and the crew safe.', 'good')
        .say(12.2, 'The same doubling applies in school zones, school bus zones, and emergency scenes.');
    },
  });

  LAW.add({
    sec: '601c', div: 'gen', title: 'Violation that injures or kills a farm equipment operator',
    penalty: 'mixed', penaltyText: 'Misdemeanor (injury) · felony (death)',
    rule: [
      'Applies when a driver commits a moving violation **that carries criminal penalties** and it injures or kills someone operating an **implement of husbandry** (farm equipment) lawfully on the highway.',
      '**Injury:** misdemeanor, up to 1 year and/or $1,000.',
      '**Death:** felony, up to 15 years and/or $7,500.',
    ],
    dur: 13,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      const tr = s.car({ kind: 'tractor', color: '#3a8d3a', label: 'Farm tractor · 15 mph', labelBelow: true, path: s.P(250, L.E(0), 0).to(560, L.E(0), 4).to(610, L.E(0) + 10, 4.4, 'out').wait(13) });
      tr.set(4, 'label', 'Operator injured').set(4, 'labelColor', 'bad');
      const c = s.car({ kind: 'car', color: COL.red, path: s.P(-220, L.E(0), 0.4).curve(-20, 430, 180, 455, 1.9).curve(330, 500, 494, L.E(0), 4).to(474, L.E(0) - 6, 4.4, 'out').wait(13) });
      c.set(0.4, 'label', 'Reckless driver').set(0.4, 'labelColor', 'bad').set(0.4, 'mph', 70).set(4, 'mph', null);
      s.boom(4, 530, L.E(0));
      s.say(0, 'A farm tractor is on the highway lawfully, slow-moving-vehicle emblem showing.')
        .say(1.5, 'A driver comes up fast, weaving, in willful disregard for safety. That’s reckless driving, a crime.', 'bad')
        .say(4.2, 'The crash injures the tractor operator.', 'bad')
        .say(6, 'A moving violation with criminal penalties that injures a law-abiding farm equipment operator: misdemeanor, up to 1 year and/or $1,000.', 'warn')
        .say(9.5, 'If the operator dies: felony, up to 15 years and/or $7,500.', 'warn');
    },
  });

  LAW.add({
    sec: '601d', div: 'gen', title: 'Moving violation causing death or serious injury',
    penalty: 'misd', penaltyText: 'Misdemeanor',
    rule: [
      'Any moving violation (even one normally only a civil infraction) on a highway or other place open to the public, **including parking lots**, becomes a crime if it causes serious harm.',
      'If it is the **proximate cause of a death**: misdemeanor, up to 1 year and/or $2,000.',
      'If it causes **serious impairment of a body function**: misdemeanor, up to 93 days and/or $500.',
      'Prosecutors can still bring other charges for the same conduct.',
    ],
    dur: 12,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      s.sign(...L.corner('E'), 'stop'); s.sign(...L.corner('W'), 'stop');
      const a = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 0.5).to(785, L.E(0), 4).to(806, L.E(0) + 6, 4.35, 'out').wait(12) });
      a.set(1.8, 'label', 'Rolls through stop sign').set(1.8, 'labelColor', 'bad').set(4.3, 'label', null);
      s.car({ kind: 'suv', color: COL.white, path: s.P(L.N(0), 1000, 1).to(L.N(0), L.E(0), 4).to(L.N(0) + 16, L.E(0) - 14, 4.35, 'out').wait(12) });
      s.boom(4, 818, L.E(0));
      s.say(0, 'Eastbound traffic faces a stop sign. Cross traffic does not.')
        .say(1.8, 'The eastbound driver rolls through the stop sign. On its own, that’s a civil infraction.', 'bad')
        .say(4.3, 'The moving violation causes a crash.', 'bad')
        .say(6, 'If it is the proximate cause of another person’s death: misdemeanor, up to 1 year and/or $2,000.', 'warn')
        .say(9, 'If it causes serious impairment of a body function: up to 93 days and/or $500. Other charges can still apply.', 'warn');
    },
  });

  LAW.add({
    sec: '602', div: 'gen', title: 'Obey a police officer directing traffic',
    penalty: 'misd', penaltyText: 'Misdemeanor (general penalty, MCL 257.901)',
    rule: [
      'You may not refuse a **lawful order or direction** from a police officer who is directing, controlling, or regulating traffic for public safety.',
      'An officer’s directions override signals and signs (see also MCL 257.611).',
      'The section sets no penalty of its own, so the code’s general misdemeanor penalty applies (up to 90 days and/or $100).',
    ],
    dur: 13,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      for (const d of ['E', 'W', 'N', 'S']) s.light(...L.corner(d), [[0, 'off']]);
      s.person({ kind: 'officer', at: [L.cx - 2, L.cy, 180] });
      s.note(0.6, 6.4, L.cx, L.cy, '✋ East–west: STOP\n➜ North–south: GO', 'info', { dx: 300, dy: -240 });
      s.note(6.6, 13, L.cx, L.cy, '✋ Still: STOP', 'info', { dx: 300, dy: -240 });
      s.car({ kind: 'car', color: COL.gold, path: s.P(L.N(0), 1000, 1.4).to(L.N(0), -120, 6) });
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(L.stopAt('E'), L.E(0), 3, 'out').wait(13) });
      s.mark(3.4, 7.5, 0, 0, 'ok', { follow: a, dy: -70 });
      const b = s.car({ kind: 'car', color: COL.red, path: s.P(1700, L.W(0), 0.5).to(L.stopAt('W'), L.W(0), 3.4, 'out').wait(7).to(-140, L.W(0), 10.2, 'in') });
      b.set(7, 'label', 'Ignores the officer').set(7, 'labelColor', 'bad');
      s.mark(7.6, 10.5, 0, 0, 'x', { follow: b, dy: -80 });
      s.say(0, 'The signals are out, so a police officer is directing traffic.')
        .say(1.8, 'The officer holds east–west traffic and waves north–south traffic through.')
        .say(3.3, 'The eastbound driver stops as directed.', 'good')
        .say(7, 'The westbound driver goes anyway, refusing the officer’s lawful direction.', 'bad')
        .say(10.4, 'That refusal is prohibited. The officer’s direction controls, signals or not.', 'warn');
    },
  });

  LAW.add({
    sec: '602a', div: 'gen', title: 'Fleeing and eluding a police officer',
    penalty: 'felony', penaltyText: 'Felony (4 degrees)',
    rule: [
      'When a police or conservation officer signals you to stop, by hand, voice, emergency light, or siren, you may not willfully flee: no speeding up, turning off your lights, or otherwise trying to get away.',
      'Applies only if the officer is **in uniform** and the vehicle is identifiable as an official police or DNR vehicle.',
      '**4th degree:** felony, up to 2 years/$500. **3rd** (crash, a zone of 35 mph or less, or a prior): up to 5 years/$1,000.',
      '**2nd** (serious injury, or certain priors): up to 10 years/$5,000. **1st** (death): up to 15 years/$10,000.',
    ],
    dur: 16,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      s.sign(300, 580, 'speed', '35');
      const d = s.car({ kind: 'car', color: COL.red, label: 'Driver', path: s.P(-80, L.E(0), 0).to(560, L.E(0), 2.6).to(1760, L.E(0), 5.4, 'in') });
      d.mph([[0, 35], [2.8, 55], [3.8, 80]]).set(2.8, 'labelColor', 'bad');
      const p = s.car({ kind: 'police', path: s.P(-460, L.E(0), 0.4).to(260, L.E(0), 2.8).to(1820, L.E(0), 6.4, 'in') });
      p.set(1.2, 'lights', 'police').set(1.2, 'waves', 'siren');
      s.note(1.3, 2.9, 0, 0, 'Lights + siren: “Pull over”', 'info', { follow: p, dy: -100 });
      s.note(3, 5.2, 0, 0, 'Speeds up to get away', 'bad', { follow: d, dy: -100 });
      s.raw(K.table(800, 450, [
        ['4th degree', 'Fleeing · felony, up to 2 years', '#7d8790'],
        ['3rd degree', 'Crash, zone of 35 mph or less, or a prior · up to 5 years', '#d88a0f'],
        ['2nd degree', 'Serious injury or certain priors · up to 10 years', '#d0452f'],
        ['1st degree', 'Someone dies · up to 15 years', '#8b1d16'],
      ], { title: 'Fleeing and eluding (MCL 257.602a)', w: 1100, lw: 200, fs: 21 }), { t0: 7, t1: 16, fade: 0.4, layer: 'fx' });
      s.say(0, 'A uniformed officer in a marked patrol car signals the driver to stop.')
        .say(2.8, 'Instead, the driver speeds up to get away.', 'bad')
        .say(5, 'That’s fleeing and eluding, a felony even if nothing else happens.', 'bad')
        .say(7.4, 'The degree goes up with the harm and the driver’s record.', 'warn')
        .say(12.4, 'Here, part of the chase was posted at 35 mph, so even without a crash it’s at least 3rd degree.', 'warn');
    },
  });

  LAW.add({
    sec: '602b', div: 'gen', title: 'Hands-free law: no holding or using a phone',
    penalty: 'civil', penaltyText: 'Civil infraction · $100 / $250',
    rule: [
      'You may not **hold** (support with hands, arms, or shoulders) or **use** a mobile device while operating a motor vehicle. That includes sitting at a red light or stop sign.',
      '“Use” means calls, reading or sending texts, viewing or recording video, and social media.',
      '**Allowed:** a mounted device used hands-free (a single tap or swipe is OK), built-in vehicle systems, GPS you don’t type into by hand, continuous video recording, and calls to 9-1-1 or to report a crash, hazard, crime, or dangerous driver.',
      'Fines: $100 (1st), $250 (later); doubled if you cause a crash. 3 violations in 3 years requires a driver improvement course. Commercial and school bus drivers: $200 / $500.',
      'Officers may stop you for this alone but may not search the car just because of it.',
    ],
    dur: 15,
    build(s) {
      s.bg('dash', { mph: 45 });
      s.raw(K.hand(1010, 640, -10) + K.phone(1010, 600, { text: true, rot: -8 }), { t0: 0, t1: 5.2, layer: 'actors', fade: 0.3 });
      s.mark(0.8, 5.2, 1150, 420, 'x', { r: 44 });
      s.raw(K.mount(1200, 520) + K.phone(1200, 520, { nav: true }), { t0: 5.4, t1: 9.4, layer: 'actors', fade: 0.3 });
      s.mark(5.8, 9.4, 1330, 380, 'ok', { r: 44 });
      s.raw(K.hand(1010, 640, -10) + K.phone(1010, 600, { call: true, rot: -8 }) + `<text x="1010" y="560" text-anchor="middle" font-size="30" font-weight="900" fill="#111" font-family="system-ui,Segoe UI,Arial" transform="rotate(-8 1010 600)">9-1-1</text>`, { t0: 9.6, t1: 15, layer: 'actors', fade: 0.3 });
      s.mark(10, 15, 1150, 420, 'ok', { r: 44 });
      s.say(0, 'Texting with the phone in your hand while driving is against Michigan’s hands-free law.', 'bad')
        .say(2.6, 'It’s still a violation while stopped at a light or in traffic.', 'bad')
        .say(5.5, 'Allowed: the phone in a mount, used hands-free. One tap or swipe is OK.', 'good')
        .say(9.6, 'Allowed: calling 9-1-1 or reporting a crash, hazard, crime, or dangerous driver.', 'good')
        .say(12.4, 'Fine: $100 first, $250 after, doubled if you cause a crash.', 'warn');
    },
  });

  LAW.add({
    sec: '602c', div: 'gen', title: 'Kelsey’s Law: no phone calls for Level 1 & 2 drivers',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'On top of the hands-free law, a driver with a **Level 1 or Level 2 graduated license** may not use a cell phone at all while driving: no starting, answering, or talking on a call, **even hands-free**.',
      'Exceptions: reporting a crash, medical emergency, or serious road hazard; a situation where the driver’s own safety is in danger; or reporting or preventing a crime.',
      'Known as “Kelsey’s Law.”',
    ],
    dur: 13,
    build(s) {
      s.bg('dash', { mph: 40 });
      s.raw(`<g transform="translate(40,40)"><rect width="330" height="120" rx="14" fill="#fff" stroke="#2f6fd6" stroke-width="4"/><rect width="330" height="38" rx="14" fill="#2f6fd6"/><rect y="24" width="330" height="14" fill="#2f6fd6"/>
        <text x="165" y="27" text-anchor="middle" font-size="19" font-weight="800" fill="#fff" font-family="system-ui,Segoe UI,Arial">MICHIGAN · LEVEL 2</text>
        <text x="20" y="78" font-size="21" font-weight="700" fill="#222" font-family="system-ui,Segoe UI,Arial">Graduated driver license</text>
        <text x="20" y="104" font-size="17" fill="#555" font-family="system-ui,Segoe UI,Arial">Intermediate · age 16</text></g>`, { layer: 'fx' });
      s.raw(K.mount(1200, 520) + K.phone(1200, 520, { call: true }), { t0: 0, t1: 7.6, layer: 'actors', fade: 0.3 });
      s.text(1.4, 7.6, 1200, 360, 'Hands-free call', { size: 26, stroke: '#000', sw: 5 });
      s.mark(3.4, 7.6, 1340, 380, 'x', { r: 44 });
      s.raw(K.mount(1200, 520) + K.phone(1200, 520, { call: true }) + `<text x="1200" y="490" text-anchor="middle" font-size="28" font-weight="900" fill="#111" font-family="system-ui,Segoe UI,Arial">9-1-1</text>`, { t0: 7.8, t1: 13, layer: 'actors', fade: 0.3 });
      s.mark(8.6, 13, 1340, 380, 'ok', { r: 44 });
      s.say(0, 'A teen with a Level 2 graduated license is driving.')
        .say(1.4, 'They take a call hands-free through a dashboard mount.')
        .say(3.4, 'For Level 1 and 2 drivers that’s still a violation: no calls at all, hands-free or not.', 'bad')
        .say(7.8, 'Exception: calling to report a crash, medical emergency, road hazard, a crime, or a threat to their safety.', 'good');
    },
  });

  LAW.add({
    sec: '603', div: 'gen', title: 'Emergency vehicle privileges',
    penalty: 'none', penaltyText: 'Exemption, not an offense',
    rule: [
      'Government vehicles must follow the traffic laws, except for the privileges given to authorized emergency vehicles.',
      'When **responding to** an emergency or pursuing a suspect (not when returning), an emergency vehicle may: park or stand anywhere; go through a red light or stop sign **after slowing as needed for safety**; exceed speed limits without endangering life or property; and disregard direction and turning rules.',
      'The privileges apply only while it sounds a siren (when reasonably necessary) and shows a flashing red or blue light visible 500 feet away. A police car on a run that requires silence may skip the siren.',
      'Only publicly owned police vehicles may show a 360° flashing **blue** light.',
    ],
    dur: 13,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      s.light(...L.corner('E'), [[0, 'R']]);
      s.light(...L.corner('N'), [[0, 'G']]);
      const amb = s.car({ kind: 'ambulance', label: 'Responding', path: s.P(-160, L.E(0), 0).to(L.stopAt('E', 'ambulance') + 30, L.E(0), 2.4, 'out').wait(3.3).to(1780, L.E(0), 6.6, 'in') });
      amb.set(0, 'lights', 'ambulance').set(0, 'waves', 'siren').set(6.6, 'waves', null);
      s.note(2.4, 3.6, 0, 0, 'Slows, checks, then proceeds', 'info', { follow: amb, dy: -100 });
      s.car({ kind: 'car', color: COL.gold, path: s.P(L.N(0), 1000, 0).to(L.N(0), L.stopAt('N'), 2.2, 'out').wait(7.4).to(L.N(0), -120, 10, 'in') });
      const r = s.car({ kind: 'ambulance', label: 'Returning · no lights', path: s.P(-160, L.E(0), 7.2).to(L.stopAt('E', 'ambulance'), L.E(0), 9.8, 'out').wait(13) });
      s.mark(10.2, 13, 0, 0, 'ok', { follow: r, dy: -80 });
      s.say(0, 'An ambulance responding to a call, lights and siren on, comes to a red light.')
        .say(2.4, 'It slows enough to proceed safely, then goes through the red.', 'good')
        .say(4.6, 'Responding vehicles may also exceed the speed limit and ignore turning rules, without endangering anyone.', 'info')
        .say(7.4, 'Returning from the call with no lights or siren, it gets no special privileges.', 'info')
        .say(9.9, 'It stops at the red light like any other driver.', 'good');
    },
  });
})();
