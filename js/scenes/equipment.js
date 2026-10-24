/* Equipment: MCL 257.683 – 257.710e */
(function () {
  const { COL } = K;
  const F = 'font-family="system-ui,Segoe UI,Arial"';
  const EQ = 'Civil infraction (MCL 257.683)';

  // Rear view of a car for lamp scenes. o: { tl, tr (tail lamps lit), bl, br (brake lamps), plate, sigL, color }
  function rearCar(cx, cy, o = {}) {
    const red = on => on ? '#ff2b2b' : '#5a1414';
    const glow = (x, y, on, col = '#ff3030', r = 70) => on ? `<circle cx="${x}" cy="${y}" r="${r}" fill="${col === '#fff' ? 'url(#whiteglow)' : 'url(#redglow)'}" opacity=".8"/>` : '';
    const lx = cx - 170, rx = cx + 170, ly = cy + 30;
    return `<g>
      ${glow(lx, ly, o.tl || o.bl)}${glow(rx, ly, o.tr || o.br)}${glow(cx, cy + 66, o.plate, '#fff', 40)}
      <rect x="${cx - 230}" y="${cy - 130}" width="460" height="260" rx="60" fill="${o.color || '#2f6fd6'}" stroke="#0b1d3f" stroke-width="5"/>
      <rect x="${cx - 180}" y="${cy - 110}" width="360" height="100" rx="28" fill="#22313f"/>
      <rect x="${lx - 40}" y="${ly - 22}" width="80" height="44" rx="10" fill="${red(o.tl || o.bl)}" stroke="#2a0a0a" stroke-width="2"/>
      <rect x="${rx - 40}" y="${ly - 22}" width="80" height="44" rx="10" fill="${red(o.tr || o.br)}" stroke="#2a0a0a" stroke-width="2"/>
      ${o.bl ? `<rect x="${lx - 40}" y="${ly - 22}" width="80" height="44" rx="10" fill="#ff5a5a"/>` : ''}${o.br ? `<rect x="${rx - 40}" y="${ly - 22}" width="80" height="44" rx="10" fill="#ff5a5a"/>` : ''}
      <rect x="${cx - 60}" y="${cy + 40}" width="120" height="56" rx="6" fill="${o.plate ? '#ffffff' : '#a9adb3'}" stroke="#333"/>
      <text x="${cx}" y="${cy + 78}" text-anchor="middle" font-size="28" font-weight="900" fill="${o.plate ? '#1f3c88' : '#4a4f57'}" ${F}>MICH</text>
      <rect x="${cx - 30}" y="${cy + 30}" width="60" height="8" rx="3" fill="${o.plate ? '#fffbe6' : '#444'}"/>
      <rect x="${cx - 200}" y="${cy + 130}" width="80" height="44" rx="10" fill="#1d1f23"/><rect x="${cx + 120}" y="${cy + 130}" width="80" height="44" rx="10" fill="#1d1f23"/>
    </g>`;
  }
  const nightRoad = `<rect width="1600" height="900" fill="#0d1526"/><rect y="600" width="1600" height="300" fill="#1b2230"/><path d="M 0 600 Q 800 540 1600 600" stroke="#2a3446" stroke-width="6" fill="none"/>`;

  LAW.add({
    sec: '683', div: 'equip', title: 'Unsafe vehicles and equipment stops',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'Don’t drive or move, and an owner may not knowingly allow, a vehicle that is in such **unsafe condition** as to endanger anyone, or that lacks the lamps and equipment required by MCL 257.683–711 in proper condition and adjustment.',
      'A police officer with **reasonable grounds** may stop and inspect a vehicle and cite the driver for any equipment defect found.',
      'Extra parts and accessories are allowed if consistent with the rules. Farm implements, road machinery, and farm tractors are mostly exempt.',
      'Unless a section says otherwise, an equipment violation is a **civil infraction**.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      const junk = `${DL.vehicleSVG('car', '#8a8f96', {})}<g transform="translate(-34,10) rotate(18)"><rect x="-6" y="-14" width="10" height="30" rx="3" fill="#3a3f46"/></g>
        <circle cx="-48" cy="20" r="3" fill="#ffd23f"/><circle cx="-54" cy="14" r="2" fill="#ffb000"/><circle cx="-44" cy="26" r="2" fill="#fff3a0"/>
        <circle cx="-62" cy="0" r="12" fill="#6b6f75" opacity=".55"/><circle cx="-84" cy="-4" r="16" fill="#6b6f75" opacity=".35"/>`;
      const c = s.thing({ svg: junk, label: 'Dragging bumper, smoking', path: s.P(-100, L.E(0), 0).to(800, L.E(0), 3.6).curve(900, L.E(0), 960, L.bot + 16, 4.4, 'out').to(1020, L.bot + 16, 4.8, 'out').wait(11) });
      c.set(0, 'labelColor', 'bad').set(4.8, 'label', null);
      const p = s.car({ kind: 'police', path: s.P(-500, L.E(0), 1).to(620, L.E(0), 4).curve(720, L.E(0), 780, L.bot + 16, 4.8, 'out').to(880, L.bot + 16, 5.2, 'out').wait(11) });
      p.set(2.4, 'lights', 'police');
      s.raw(K.ticket(800, 250, ['Unsafe vehicle condition', 'Bumper not secured', 'Fix-it: certify repair'], { title: 'EQUIPMENT VIOLATION', w: 460 }), { t0: 6, layer: 'fx', fade: 0.4 });
      s.say(0, 'A car rattles down the road with a dragging bumper and smoke pouring out.', 'bad')
        .say(2.4, 'An officer with reasonable grounds may stop the vehicle and inspect it.')
        .say(6, 'Driving a vehicle in unsafe condition, or missing required equipment, is a civil infraction.', 'warn')
        .say(8.6, 'An owner who knowingly lets someone drive it is responsible too.');
    },
  });

  LAW.add({
    sec: '684', div: 'equip', title: 'When headlights are required',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'Vehicles on a highway must display lighted lamps from **a half hour after sunset to a half hour before sunrise**, and **any other time** when there isn’t enough light to clearly see people and vehicles **500 feet** ahead (fog, rain, snow).',
      'Driving with **only parking lights** on when lamps are required is prohibited.',
    ],
    dur: 12,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      s.night([[0, 0], [2.4, 0], [5, 0.85], [12, 0.85]]);
      const clock = (txt, sub, col) => `<g transform="translate(1210,210)"><rect x="-170" y="-60" width="340" height="120" rx="16" fill="#18202a" stroke="${col}" stroke-width="4"/><text y="0" text-anchor="middle" font-size="40" font-weight="900" fill="${col}" font-family="ui-monospace,Consolas,monospace">${txt}</text><text y="38" text-anchor="middle" font-size="20" font-weight="700" fill="#cfd8e3" ${F}>${sub}</text></g>`;
      s.raw(clock('8:12 PM', 'Sunset', '#ffd34d'), { t0: 0, t1: 3.6, layer: 'fx' });
      s.raw(clock('8:42 PM', 'Lights required', '#7cf2a8'), { t0: 3.6, layer: 'fx' });
      const a = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 4.6).to(1760, L.E(0), 8.4) });
      a.set(0, 'head', 'off').set(4.6, 'label', 'No headlights').set(4.6, 'labelColor', 'bad');
      const p = s.car({ kind: 'car', color: COL.gold, path: s.P(1760, L.W(0), 6).to(-120, L.W(0), 9.8) });
      p.set(0, 'head', 'off').set(6, 'label', 'Parking lights only').set(6, 'labelColor', 'bad');
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 8.6).to(1760, L.E(0), 12) });
      b.set(0, 'head', 'low').set(8.6, 'label', 'Headlights on').set(8.6, 'labelColor', 'good');
      s.say(0, 'The sun has just set.')
        .say(3.6, 'From a half hour after sunset to a half hour before sunrise, headlights are required.')
        .say(4.8, 'Driving in the dark without headlights is a violation…', 'bad')
        .say(6.2, '…and so is driving with only the parking lights on.', 'bad')
        .say(8.8, 'Headlights are also required any time you can’t see people and vehicles 500 feet ahead, as in fog or heavy rain.', 'good');
    },
  });

  LAW.add({
    sec: '686', div: 'equip', title: 'Tail lamps and license plate lamp',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'Motor vehicles and trailers need at least one **rear lamp** showing **red** light plainly visible from **500 feet** behind.',
      'A tail lamp or separate lamp must light the rear **license plate with white light**, legible from **50 feet**, and be wired to come on with the headlights.',
      'Pickup campers must leave the plate visible. Historic vehicles are exempt if never originally equipped. Older farm implements at night need rear lamps or an escort vehicle following within 50 feet.',
    ],
    dur: 9,
    build(s) {
      s.bg('blank', { fill: '#0d1526' });
      s.raw(nightRoad, { layer: 'bg' });
      s.raw(rearCar(560, 440, { tl: true, tr: false, plate: false, color: '#8457c4' }), { layer: 'actors' });
      s.raw(rearCar(1100, 440, { tl: true, tr: true, plate: true }), { t0: 3.6, layer: 'actors', fade: 0.3 });
      s.text(0.4, 9, 560, 210, 'Tail lamp out · plate dark', { size: 30, color: '#ffb3ad' });
      s.mark(1.2, 9, 560, 290, 'x', { r: 40 });
      s.text(3.6, 9, 1100, 210, 'Red tail lamps · plate lit', { size: 30, color: '#b9f5d0' });
      s.mark(4.2, 9, 1100, 290, 'ok', { r: 40 });
      s.say(0, 'At night, a following driver should see red tail lamps from 500 feet away.')
        .say(1.2, 'This car has a dead tail lamp and no light on its license plate.', 'bad')
        .say(3.8, 'The plate must be lit with white light, readable from 50 feet, whenever the headlights are on.', 'good');
    },
  });

  LAW.add({
    sec: '693', div: 'equip', title: 'Flag or light on a long load',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'When a load extends **4 feet or more** beyond the rear of the bed or body:',
      'In daylight, display a **red flag** at least **12 inches square** at the extreme rear of the load, hung so drivers behind can see all of it.',
      'When lamps are required (night or poor visibility), display a **red light or lantern** visible from at least **500 feet** to the sides and rear, in addition to the normal tail lamps.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      s.night([[0, 0], [6.2, 0], [7, 0.8]]);
      const a = s.car({ kind: 'lumber', color: COL.red, label: 'No flag', path: s.P(-140, L.E(0), 0).to(1800, L.E(0), 3.6) });
      a.set(0, 'flag', false).set(0, 'labelColor', 'bad');
      s.mark(1, 3.6, 800, L.top - 100, 'x');
      const b = s.car({ kind: 'lumber', color: COL.you, label: 'Red flag on the load', path: s.P(-140, L.E(0), 3.6).to(1800, L.E(0), 7) });
      b.set(0, 'labelColor', 'good');
      const c = s.car({ kind: 'lumber', color: COL.you, label: 'Red lantern at night', path: s.P(-140, L.E(0), 7.2).to(1800, L.E(0), 11) });
      c.set(0, 'flag', false).set(0, 'lantern', true).set(0, 'labelColor', 'good');
      s.say(0, 'Lumber sticks out about 8 feet behind this pickup’s bed, with nothing marking it.', 'bad')
        .say(3.8, 'In daylight, a load extending 4+ feet out needs a red flag at least 12 inches square at its end.', 'good')
        .say(7.4, 'At night, it needs a red light visible from 500 feet, on top of the normal tail lamps.', 'good');
    },
  });

  LAW.add({
    sec: '694', div: 'equip', title: 'Lights on vehicles parked on the road at night',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'A vehicle parked or stopped on a highway, attended or not, when lamps are required must display on its **left side** a lamp showing **white or amber** to the front and **red** to the rear, visible from **500 feet**.',
      'Local ordinances may waive this where street lighting reveals people within 500 feet.',
    ],
    dur: 10,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed', shoulder: 34 });
      const L = s.lane;
      s.night(0.85);
      const dark = s.car({ kind: 'car', color: COL.gray, label: 'Parked, no lights', at: [700, L.bot + 4, 0] });
      dark.set(0, 'head', 'off').set(0, 'labelColor', 'bad').set(5, 'show', false);
      s.raw(`<circle cx="1100" cy="${L.bot + 4}" r="40" fill="url(#redglow)" opacity=".7"/><circle cx="1152" cy="${L.bot - 6}" r="30" fill="url(#amberglow)" opacity=".8"/>`, { t0: 5.2, layer: 'glow' });
      const lit = s.car({ kind: 'car', color: COL.you, label: 'Parking lamps on', from: 5, at: [1120, L.bot + 4, 0] });
      lit.set(0, 'head', 'off').set(0, 'labelColor', 'good');
      const r = s.car({ kind: 'suv', color: COL.white, path: s.P(-100, L.E(0), 0.6).to(560, L.E(0), 2.4).curve(640, L.E(0) - 2, 700, L.E(0) - 34, 2.9).to(900, L.E(0) - 30, 3.4).to(1760, L.E(0), 5) });
      r.set(0, 'head', 'low').set(2.4, 'brake', true).set(3.4, 'brake', false);
      s.mark(2.6, 4.8, 700, L.top - 90, 'x');
      s.car({ kind: 'car', color: COL.teal, path: s.P(-100, L.E(0), 6).to(1760, L.E(0), 9.6) }).set(0, 'head', 'low');
      s.mark(7, 10, 1120, L.top - 90, 'ok');
      s.say(0, 'At night, a car is left on the shoulder with no lights showing.', 'bad')
        .say(2.4, 'An approaching driver sees it only at the last second and has to swerve.', 'bad')
        .say(5.2, 'A vehicle parked on the road at night needs a lamp on its left side, white or amber to the front and red to the rear, visible 500 feet away.', 'good');
    },
  });

  LAW.add({
    sec: '697', div: 'equip', title: 'Brake lights and turn signals must work',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'A motor vehicle may (and when required, must) have a **stop lamp** on the rear, red or amber, that lights when the brake is applied, and lamps or a mechanical device to signal turns.',
      'Stop lamps must be visible from **100 feet** behind; turn signals from **100 feet** front and rear, day and night.',
      'Once equipped, these lamps must be **maintained in good working condition** and must not project a glaring or dazzling light.',
    ],
    dur: 10,
    build(s) {
      s.bg('blank', { fill: '#cfe6f7' });
      s.raw(`<rect width="1600" height="900" fill="url(#sky)"/><rect y="600" width="1600" height="300" fill="#55595f"/><path d="M 0 600 Q 800 520 1600 600 V 600 H 0 Z" fill="#a9c98f"/>`, { layer: 'bg' });
      s.raw(rearCar(800, 440, {}), { t0: 0, t1: 2, layer: 'actors' });
      s.raw(rearCar(800, 440, { bl: true, br: true }), { t0: 2, t1: 5, layer: 'actors' });
      s.text(2, 5, 800, 190, 'Brake pedal → stop lamps light', { size: 34, color: '#18202a' });
      s.raw(rearCar(800, 440, {}), { t0: 5, t1: 10, layer: 'actors' });
      const lamp = `<rect x="590" y="448" width="80" height="44" rx="10" fill="#ffb21f" data-part="sigL"/><circle cx="630" cy="470" r="70" fill="url(#amberglow)" data-part="sigL"/>`;
      s.thing({ svg: lamp, at: [0, 0, 0], from: 5.2, layer: 'actors' }).set(5.2, 'sig', 'L');
      s.text(5.2, 10, 800, 190, 'Left turn signal blinking', { size: 34, color: '#18202a' });
      s.say(0, 'Signal lamps tell drivers behind you what you’re about to do.')
        .say(2, 'Stop lamps must light when you press the brake, visible 100 feet behind.', 'good')
        .say(5.2, 'Turn signals must be visible 100 feet to the front and rear, day and night.', 'good')
        .say(7.6, 'Once a vehicle has them, they must be kept in good working condition.');
    },
  });

  LAW.add({
    sec: '697b', div: 'equip', title: 'Two rear stop lamps',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'A vehicle manufactured or assembled after **January 1, 1965** may not be sold, offered for sale, or operated on the highways unless it has **two rear stop lamps**.',
      'A motorcycle or moped needs **one** rear stop lamp. Vehicles exempt from title requirements are excluded.',
    ],
    dur: 9,
    build(s) {
      s.bg('blank', { fill: '#cfe6f7' });
      s.raw(`<rect width="1600" height="900" fill="url(#sky)"/><rect y="600" width="1600" height="300" fill="#55595f"/>`, { layer: 'bg' });
      s.raw(`<g transform="translate(560,470) scale(.8) translate(-560,-470)">${rearCar(560, 470, { bl: true, br: false, color: '#d0452f' })}</g>`, { layer: 'actors' });
      s.text(0.4, 9, 560, 220, 'One stop lamp out', { size: 32, color: '#18202a' });
      s.mark(1, 9, 560, 290, 'x', { r: 40 });
      s.raw(`<g transform="translate(1080,470) scale(.8) translate(-1080,-470)">${rearCar(1080, 470, { bl: true, br: true })}</g>`, { t0: 3, layer: 'actors', fade: 0.3 });
      s.text(3, 9, 1080, 220, 'Both stop lamps work', { size: 32, color: '#18202a' });
      s.mark(3.6, 9, 1080, 290, 'ok', { r: 40 });
      s.say(0, 'Cars built after January 1, 1965 must have two working rear stop lamps.')
        .say(1, 'Braking with one stop lamp out: an equipment violation.', 'bad')
        .say(3.6, 'Both lamps lighting when the brake is pressed.', 'good')
        .say(6, 'Motorcycles and mopeds need one stop lamp.');
    },
  });

  LAW.add({
    sec: '698', div: 'equip', title: 'Flashing lights and lamp colors',
    penalty: 'civil', penaltyText: 'Civil infraction · up to $100',
    rule: [
      'Lamps or reflectors visible from the **front** must be white or amber; from the **side**, amber or red; from the **rear**, red. Backing lights may come on only in reverse.',
      '**Flashing, rotating, or oscillating lights of any color are prohibited** except as the law allows: **red or blue** for police; **red** for fire vehicles and ambulances; **amber or green** for snow and road-maintenance vehicles; **amber** for utility, refuse, wreckers, rural mail carriers, oversize-load escorts, and others; **purple or amber** for funeral processions; red roof lights for physicians authorized by the sheriff.',
      'Red or blue emergency lights may be sold or furnished only to police, firefighters, ambulance and wrecker services, and similar authorized people.',
      'Violation: civil infraction, fine up to $100.',
    ],
    dur: 12,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      const fake = `${DL.vehicleSVG('car', '#2b2e33', {})}<rect x="26" y="-12" width="5" height="10" fill="#e0262b" opacity=".3" data-part="barA"/><rect x="26" y="2" width="5" height="10" fill="#2453e0" opacity=".3" data-part="barB"/>`;
      const f = s.thing({ svg: fake, label: 'Private car: red & blue flashers', path: s.P(-100, L.E(0), 0).to(1760, L.E(0), 5) });
      f.set(0, 'lights', 'police').set(0, 'labelColor', 'bad');
      s.mark(1.4, 5, 800, L.top - 100, 'x');
      s.car({ kind: 'car', color: COL.gray, from: 5.6, at: [760, L.bot + 10, 10] }).set(5.6, 'sig', 'H');
      const t = s.car({ kind: 'tow', color: '#e46f12', label: 'Wrecker: amber OK', from: 5.6, path: s.P(1760, L.W(0), 5.6).to(980, L.W(0), 7.2).curve(900, L.W(0), 880, L.bot + 10, 8.2, 'out').wait(12) });
      t.set(5.6, 'lights', 'amber').set(5.6, 'labelColor', 'good');
      s.mark(8.4, 12, 1000, L.bot + 110, 'ok');
      s.say(0, 'A private car with red and blue flashing lights mounted in its grille.', 'bad')
        .say(1.6, 'Flashing lights of any color are banned unless the law specifically allows them. Red and blue are reserved for emergency vehicles.', 'bad')
        .say(5.8, 'A wrecker may use flashing amber lights when warning is needed for safety.', 'good')
        .say(8.6, 'Snowplows use amber or green; funeral escorts purple or amber; police red or blue.');
    },
  });

  LAW.add({
    sec: '698a', div: 'equip', title: 'Hazard warning lights',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'Any vehicle may have lamps to warn other drivers of a **traffic hazard** requiring unusual care when approaching, overtaking, or passing.',
      'Front warning lamps flash **white or amber** at the same time; rear lamps flash **amber or red** at the same time. They must be visible from **500 feet** at night.',
    ],
    dur: 8,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed', shoulder: 34 });
      const L = s.lane;
      s.night(0.5);
      const c = s.car({ kind: 'car', color: COL.you, label: 'Hazards on', path: s.P(-100, L.E(0), 0).to(560, L.E(0), 1.8).curve(660, L.E(0), 720, L.bot + 6, 2.6, 'out').to(780, L.bot + 6, 3, 'out').wait(8) });
      c.set(1.4, 'sig', 'H').set(0, 'labelColor', 'good');
      s.car({ kind: 'suv', color: COL.white, path: s.P(-100, L.E(0), 3.6).to(560, L.E(0), 5).to(1000, L.E(0) - 16, 6.4).to(1760, L.E(0), 8) }).set(4.6, 'brake', true).set(6.2, 'brake', false);
      s.say(0, 'A car with engine trouble pulls onto the shoulder.')
        .say(1.6, 'Hazard lamps flash front and rear at the same time to warn of the hazard.', 'good')
        .say(4.2, 'Approaching drivers see them from 500 feet and pass with extra care.', 'good');
    },
  });

  LAW.add({
    sec: '700', div: 'equip', title: 'Dim your high beams',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'When lamps are required, use a beam high and bright enough to reveal people and vehicles at a safe distance ahead.',
      'Within **500 feet of an oncoming vehicle**, switch to a beam aimed so its glaring rays don’t go into the oncoming driver’s eyes (low beams).',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      s.night(0.9);
      const a = s.car({ kind: 'car', color: COL.you, label: 'Dims for oncoming car', path: s.P(-100, L.E(0), 0).to(1760, L.E(0), 5.6) });
      a.set(0, 'head', 'high').set(1.4, 'head', 'low').set(4.4, 'head', 'high').set(0, 'labelColor', 'good');
      s.car({ kind: 'car', color: COL.gold, path: s.P(1760, L.W(0), 0).to(-120, L.W(0), 5.6) }).set(0, 'head', 'low');
      const b = s.car({ kind: 'car', color: COL.red, label: 'Keeps high beams on', path: s.P(-100, L.E(0), 5.8).to(1760, L.E(0), 11) });
      b.set(0, 'head', 'high').set(0, 'labelColor', 'bad');
      const o = s.car({ kind: 'suv', color: COL.white, path: s.P(1760, L.W(0), 5.8).to(-120, L.W(0), 11) });
      o.set(0, 'head', 'low').set(7.2, 'label', 'Blinded by glare').set(7.2, 'labelColor', 'bad').set(9, 'label', null);
      s.say(0, 'On a dark road, high beams help you see far ahead.', 'good')
        .say(1.4, 'Within 500 feet of an oncoming car, this driver switches to low beams.', 'good')
        .say(6.2, 'This driver leaves the high beams on, glaring into the oncoming driver’s eyes.', 'bad');
    },
  });

  LAW.add({
    sec: '705', div: 'equip', title: 'Brakes',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'Motor vehicles (other than motorcycles and mopeds) and low-speed vehicles need brakes adequate to **control, stop, and hold** the vehicle, with **two separate means** of applying them (such as the service brake and parking brake), each working on at least 2 wheels.',
      'Motorcycles and mopeds need **2 brakes**: one on the front wheel, one on the rear.',
      'Trailers of **15,001 lbs or more** need brakes on all wheels the driver can apply from the cab. New vehicles, buses, school buses, and trucks need brakes on all wheels (with some exceptions).',
    ],
    dur: 11,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      s.light(...L.corner('E'), [[0, 'R']]);
      const c = s.car({ kind: 'car', color: COL.red, label: 'Worn-out brakes', path: s.P(-100, L.E(0), 0).to(640, L.E(0), 2.4).to(760, L.E(0), 3.6, 'out').wait(11) });
      c.set(2.2, 'brake', true).set(0, 'labelColor', 'bad');
      s.zone(3.4, 11, { rect: [L.cx - L.VW - 40, L.cy - L.HW, 28, 2 * L.HW] }, '#d63a2f', 'Stopped in the crosswalk', { ly: -110 });
      const x0 = 980;
      s.raw(K.checkRow(x0, 600, 'Two separate ways to apply brakes', true, { w: 540 }), { t0: 5, layer: 'fx', fade: 0.3 });
      s.raw(K.checkRow(x0, 670, 'Motorcycles: front and rear brake', true, { w: 540 }), { t0: 6.4, layer: 'fx', fade: 0.3 });
      s.raw(K.checkRow(x0, 740, 'Heavy trailers: brakes on all wheels', true, { w: 540 }), { t0: 7.8, layer: 'fx', fade: 0.3 });
      s.say(0, 'A driver brakes for a red light, but the brakes are badly worn.', 'bad')
        .say(3.4, 'The car slides past the stop line into the crosswalk.', 'bad')
        .say(5, 'Brakes must be adequate to control, stop, and hold the vehicle, with two separate means of applying them.', 'good')
        .say(7.8, 'Trailers of 15,001+ lbs need brakes on every wheel, applied from the cab.');
    },
  });

  LAW.add({
    sec: '706', div: 'equip', title: 'Horns and sirens',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'Every motor vehicle, including motorcycles and mopeds, needs a working **horn** audible from **200 feet**, but not unreasonably loud or harsh, and not a whistle.',
      'Use the horn when **reasonably necessary for safe operation**, and **not otherwise**.',
      'Only authorized emergency vehicles may have a **siren**, whistle, or bell (historic vehicles may use one at parades and shows). Sirens may be used only on emergency calls or pursuits.',
      'Commercial vehicles may have a theft alarm that the driver can’t use as a regular horn.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, curb: true, center: 'double' });
      const L = s.lane;
      const kid = s.person({ kind: 'child', path: s.P(900, L.curbE + 30, 0.8).to(900, L.curbE + 6, 1.6).wait(2.2).to(900, L.curbE + 30, 2.8) });
      void kid;
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(700, L.E(0), 1.8).to(820, L.E(0), 2.6, 'out').to(1760, L.E(0), 4.8, 'in') });
      a.set(1.4, 'waves', 'horn').set(2.2, 'waves', null).set(1.8, 'brake', true).set(2.6, 'brake', false);
      s.note(1.4, 3.4, 0, 0, 'Warning honk', 'good', { follow: a });
      s.car({ kind: 'car', color: COL.gold, from: 5, at: [760, L.E(0), 0] }).set(5, 'brake', true);
      const b = s.car({ kind: 'car', color: COL.red, from: 5, path: s.P(-100, L.E(0), 5).to(680, L.E(0), 6.4, 'out').wait(11) });
      b.set(6.6, 'waves', 'horn').set(8.4, 'waves', null).set(6.6, 'label', 'Leans on the horn').set(6.6, 'labelColor', 'bad').set(6.4, 'brake', true);
      s.mark(7, 10, 680, L.top - 90, 'x');
      s.say(0, 'A child near the curb looks ready to step into the street.')
        .say(1.4, 'A short honk to warn them is exactly what the horn is for.', 'good')
        .say(5.6, 'Stuck in traffic, this driver leans on the horn out of frustration.', 'bad')
        .say(7.4, 'Use the horn only when reasonably necessary for safety. Sirens are only for emergency vehicles.', 'warn');
    },
  });

  LAW.add({
    sec: '707', div: 'equip', title: 'Mufflers and exhaust',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'Every motor vehicle, including motorcycles and mopeds, must have a **muffler in good working order and constant operation** to prevent excessive or unusual noise and annoying smoke.',
      'Don’t remove or damage the baffles, and don’t use a muffler **cutout or bypass** on a motorcycle or moped.',
      'The engine must be adjusted to prevent excessive fumes or smoke, and the exhaust system must include the tailpipe and resonator if originally designed with them.',
    ],
    dur: 9,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      const m = s.car({ kind: 'moto', color: '#2b2e33', label: 'Baffles removed', path: s.P(-100, L.E(0), 0).to(1760, L.E(0), 3.6) });
      m.set(0, 'waves', '#ff6b5e').set(0, 'labelColor', 'bad');
      const smoke = `${DL.vehicleSVG('car', '#8a8f96', {})}<circle cx="-50" cy="8" r="14" fill="#5b6066" opacity=".6"/><circle cx="-80" cy="2" r="22" fill="#5b6066" opacity=".45"/><circle cx="-120" cy="10" r="30" fill="#5b6066" opacity=".3"/>`;
      const c = s.thing({ svg: smoke, label: 'Pouring out smoke', from: 3.4, path: s.P(1760, L.W(0), 3.4).to(-200, L.W(0), 7.2) });
      c.set(0, 'labelColor', 'bad');
      s.say(0, 'This motorcycle’s muffler has had its baffles removed, so it’s far louder than normal.', 'bad')
        .say(3.6, 'This car’s engine is so out of adjustment that it trails smoke.', 'bad')
        .say(6, 'Mufflers must work at all times, and engines must not emit excessive fumes or smoke.', 'warn');
    },
  });

  LAW.add({
    sec: '707c', div: 'equip', title: 'Vehicle noise limits',
    penalty: 'civil', penaltyText: 'Civil infraction · up to $100',
    rule: [
      'Noise measured at **50 feet** may not exceed: cars and light vehicles **82 dBA** (speed limit over 35 mph) or **76 dBA** (35 or less); motorcycles and mopeds **86 / 82 dBA**; vehicles of 8,500+ lbs **90 / 86 dBA**.',
      'No exhaust defects that affect sound reduction, no missing muffler, and no **cutout, bypass, or amplifier**.',
      'Shops may not sell or install mufflers or parts that push a vehicle over the limits, and dealers may not sell new or used vehicles that exceed them.',
    ],
    dur: 10,
    build(s) {
      s.bg('road', { lanes: 1, curb: true, center: 'double', city: true });
      const L = s.lane;
      s.sign(420, L.curbE + 70, 'speed', '30');
      s.raw(`<g transform="translate(800,${L.curbE + 120})"><rect x="-4" y="-30" width="8" height="40" fill="#555"/><rect x="-46" y="-80" width="92" height="56" rx="8" fill="#2a2f36"/><circle cx="-30" cy="-52" r="10" fill="#5ad0ff"/></g>`, { layer: 'labels' });
      s.dim(0, 10, 760, L.E(0), 760, L.curbE + 60, '50 ft', { color: '#fff', lx: -60, ly: 0 });
      const meter = (v, col) => `<g transform="translate(1180,${L.curbE + 140})"><rect x="-120" y="-50" width="240" height="100" rx="14" fill="#111" stroke="${col}" stroke-width="4"/><text y="16" text-anchor="middle" font-size="46" font-weight="900" fill="${col}" font-family="ui-monospace,Consolas,monospace">${v}</text></g>`;
      s.raw(meter('-- dBA', '#888'), { t0: 0, t1: 1.6, layer: 'fx' });
      s.raw(meter('91 dBA', '#ff5a4f'), { t0: 1.6, t1: 5.4, layer: 'fx' });
      s.raw(meter('-- dBA', '#888'), { t0: 5.4, t1: 6.6, layer: 'fx' });
      s.raw(meter('70 dBA', '#7cf2a8'), { t0: 6.6, layer: 'fx' });
      const m = s.car({ kind: 'moto', color: '#2b2e33', label: 'Motorcycle', path: s.P(-100, L.E(0), 0).to(1760, L.E(0), 4.4) });
      m.set(0, 'waves', '#ff6b5e');
      s.car({ kind: 'car', color: COL.you, label: 'Car', path: s.P(-100, L.E(0), 5).to(1760, L.E(0), 9.4) });
      s.say(0, 'A sound meter sits 50 feet from the lane on a 30 mph street.')
        .say(1.8, 'This motorcycle measures 91 dBA. On a street of 35 mph or less, the motorcycle limit is 82.', 'bad')
        .say(6.8, 'A typical car reads 70 dBA, under its 76 dBA limit.', 'good');
    },
  });

  LAW.add({
    sec: '708', div: 'equip', title: 'Rearview mirrors',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'If a vehicle’s construction or load blocks the driver’s view to the rear, it must have a **mirror** that shows the road behind.',
      'All motor vehicles need an **outside mirror on the driver’s side** (historic vehicles not originally equipped are exempt). A motorcyclist’s mirror may be on a securely attached helmet or visor.',
      'Commercial vehicles of **½ ton** or more need **two outside mirrors**, one on each side.',
    ],
    dur: 9,
    build(s) {
      s.bg('road', { lanes: 2, vy: 500, zoom: 1000 });
      const L = s.lane;
      const van = s.car({ kind: 'truck', color: '#2f6fd6', label: 'Box truck: can’t see out the back', at: [800, L.E(1), 0] });
      void van;
      s.raw(`<polygon points="764,${L.E(1) - 24} 470,${L.E(1) - 140} 470,${L.E(1) - 40}" fill="#7cf2a8" opacity=".35"/><polygon points="764,${L.E(1) + 24} 470,${L.E(1) + 140} 470,${L.E(1) + 40}" fill="#7cf2a8" opacity=".35"/>
        <rect x="760" y="${L.E(1) - 28}" width="10" height="8" fill="#222"/><rect x="760" y="${L.E(1) + 20}" width="10" height="8" fill="#222"/>`, { t0: 1.6, layer: 'zones', fade: 0.4 });
      s.text(1.6, 9, 560, L.E(1) - 160, 'Mirror view', { size: 22, color: '#1b2a1b' });
      s.car({ kind: 'car', color: COL.gold, path: s.P(200, L.E(0), 0).to(1300, L.E(0), 9) });
      s.say(0, 'This box truck’s body blocks any view out the back.')
        .say(1.6, 'So it needs mirrors that show the road behind. As a commercial vehicle over ½ ton, one on each side.', 'good')
        .say(5, 'Every motor vehicle needs at least an outside mirror on the driver’s side.');
    },
  });

  LAW.add({
    sec: '708a', div: 'equip', title: 'Windshields and motorcycle eye protection',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'Motor vehicles need a **windshield** big enough to protect occupants from insects, airborne objects, road water, and debris (farm tractors, implements, and historic vehicles are exempt).',
      'A motorcycle ridden **over 35 mph** without a windshield requires the operator to wear **shatter-resistant goggles, a face shield, or eyeglasses**.',
    ],
    dur: 10,
    build(s) {
      s.bg('side');
      const gy = s.lane.ground;
      s.view([[0, 800, 540, 1300]]);
      const riderHead = (x, o) => `<g><path d="M ${x - 20} ${gy - 72} L ${x - 8} ${gy - 128}" stroke="#2d3b55" stroke-width="24" stroke-linecap="round"/><path d="M ${x - 10} ${gy - 118} L ${x + 38} ${gy - 102}" stroke="#2d3b55" stroke-width="10" stroke-linecap="round"/>
        <circle cx="${x - 6}" cy="${gy - 142}" r="17" fill="#e0b48c"/><path d="M ${x - 27} ${gy - 142} a 21 21 0 0 1 42 0 v 6 h -42 z" fill="#1d1f23"/>
        ${o.goggles ? `<rect x="${x - 2}" y="${gy - 150}" width="18" height="10" rx="4" fill="#5ad0ff" stroke="#111" stroke-width="2"/>` : ''}
        ${o.shield ? `<path d="M ${x + 46} ${gy - 70} L ${x + 64} ${gy - 140}" stroke="#bfe3ff" stroke-width="8" opacity=".85"/>` : ''}</g>`;
      s.raw(K.sideMoto(420, gy, { color: '#c0392b' }) + riderHead(420, {}), { layer: 'actors' });
      s.raw(K.sideMoto(820, gy, { color: '#2f6fd6' }) + riderHead(820, { goggles: true }), { layer: 'actors' });
      s.raw(K.sideMoto(1220, gy, { color: '#7d8790' }) + riderHead(1220, { shield: true }), { layer: 'actors' });
      s.text(0.4, 10, 420, 380, '45 mph, no eye protection', { size: 26, color: '#18202a' });
      s.mark(1, 10, 420, 440, 'x', { r: 34 });
      s.text(3.4, 10, 820, 380, 'Goggles', { size: 26, color: '#18202a' });
      s.mark(3.8, 10, 820, 440, 'ok', { r: 34 });
      s.text(6, 10, 1220, 380, 'Windshield', { size: 26, color: '#18202a' });
      s.mark(6.4, 10, 1220, 440, 'ok', { r: 34 });
      s.say(0, 'Above 35 mph, a motorcyclist without a windshield must protect their eyes.')
        .say(1, 'No goggles, face shield, or glasses at 45 mph: violation.', 'bad')
        .say(3.6, 'Shatter-resistant goggles, a face shield, or eyeglasses satisfy the rule.', 'good')
        .say(6.2, 'A motorcycle windshield does too.', 'good');
    },
  });

  LAW.add({
    sec: '708b', div: 'equip', title: 'No video screens the driver can watch',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Don’t operate a motor vehicle with a **television or similar device** displaying video the driver can see while the vehicle is moving.',
      'Allowed: audio and climate controls; **navigation and vehicle-information displays**; displays that enhance or supplement the driver’s view (like a **backup camera**); displays communicating vehicle, driver, or safety conditions; police, fire, and ambulance computer and dispatch monitors; approved research vehicles.',
      'Screens must be built into the dash, console, or mirror, or, for aftermarket units, mounted outside airbag deployment zones without blocking the view.',
    ],
    dur: 10,
    build(s) {
      s.bg('dash', { mph: 40 });
      const screen = (inner, col) => `<g transform="translate(800,610)"><rect x="-150" y="-80" width="300" height="160" rx="12" fill="#111" stroke="${col}" stroke-width="5"/>${inner}</g>`;
      const movie = `<rect x="-136" y="-66" width="272" height="132" rx="6" fill="#26315e"/><circle cx="-40" cy="0" r="30" fill="#f2c230"/><path d="M -136 50 L -60 -10 L 10 40 L 70 -20 L 136 50 Z" fill="#3f8f5c"/><text x="80" y="-40" font-size="18" font-weight="900" fill="#fff" ${F}>▶ MOVIE</text>`;
      const map = `<rect x="-136" y="-66" width="272" height="132" rx="6" fill="#e8eef3"/><path d="M -100 60 L -100 0 L 0 -20 L 90 -60" stroke="#2f6fd6" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="-100" cy="40" r="10" fill="#d63a2f"/>`;
      s.raw(screen(movie, '#d63a2f'), { t0: 0, t1: 5, layer: 'fx' });
      s.mark(1, 5, 1020, 540, 'x', { r: 40 });
      s.raw(screen(map, '#1f9d55'), { t0: 5, layer: 'fx' });
      s.mark(5.6, 10, 1020, 540, 'ok', { r: 40 });
      s.say(0, 'A movie is playing on a dashboard screen the driver can see while driving.', 'bad')
        .say(2.4, 'Video viewable by the driver while the vehicle moves is prohibited.', 'bad')
        .say(5.2, 'Navigation maps, vehicle information, and backup cameras are allowed.', 'good');
    },
  });

  LAW.add({
    sec: '709', div: 'equip', title: 'Window tint and windshield obstructions',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'No sign, poster, nontransparent material, window application, or reflective or tinted film on the **front windshield** or the **front side windows** next to the driver and front passenger, except a tinted strip along the **top 4 inches** of the windshield (or down to the shade band, whichever is higher).',
      'Rear side windows and the rear window may be tinted, but not with a material having a **solar reflectance of 35% or more** (no mirror-like silver or gold film). If the rear window is obstructed, the vehicle needs **two outside mirrors**.',
      'No object may obstruct the driver’s vision, except as authorized. Required stickers are fine if they don’t block the view. A doctor’s or optometrist’s letter can allow a medical window treatment.',
      'Windshields need working **wipers**. Large trucks, truck-tractors, buses, and hazmat vehicles need 2 automatic wipers and a defroster.',
    ],
    dur: 12,
    build(s) {
      s.bg('side');
      const gy = s.lane.ground;
      s.view([[0, 800, 520, 1280]]);
      const tinted = (x, frontDark, color) => {
        let c = K.sideCar(x, gy, color);
        const y0 = gy - 30;
        c += `<path d="M ${x + 26} ${y0 - 64} L ${x + 26} ${y0 - 100} L ${x + 66} ${y0 - 100} L ${x + 98} ${y0 - 64} Z" fill="${frontDark ? '#05070a' : '#9cc6e6'}" opacity=".95"/>`;
        c += `<path d="M ${x - 58} ${y0 - 64} L ${x - 24} ${y0 - 100} L ${x + 18} ${y0 - 100} L ${x + 18} ${y0 - 64} Z" fill="#05070a" opacity=".95"/>`;
        return c;
      };
      s.raw(tinted(470, true, '#d0452f'), { layer: 'actors' });
      s.text(0.4, 12, 470, 330, 'Dark tint on front side window', { size: 26, color: '#18202a' });
      s.mark(1.2, 12, 470, 400, 'x', { r: 36 });
      s.raw(tinted(1130, false, '#2f6fd6'), { t0: 3.6, layer: 'actors', fade: 0.3 });
      s.text(3.6, 12, 1130, 330, 'Clear front · tinted rear', { size: 26, color: '#18202a' });
      s.mark(4.2, 12, 1130, 400, 'ok', { r: 36 });
      s.raw(`<g transform="translate(800,300)"><path d="M -200 70 L -150 -60 L 150 -60 L 200 70 Z" fill="#9cc6e6" stroke="#333" stroke-width="5"/><path d="M -150 -60 L 150 -60 L 142 -36 L -142 -36 Z" fill="#26315e" opacity=".85"/>
        <text x="0" y="-70" text-anchor="middle" font-size="22" font-weight="800" fill="#18202a" ${F}>Windshield: tint only in the top 4 inches</text></g>`, { t0: 7.4, layer: 'fx', fade: 0.4 });
      s.say(0, 'Michigan limits tint on the windows next to the driver and front passenger.')
        .say(1.2, 'Dark film on the front side windows: violation.', 'bad')
        .say(3.8, 'Rear windows may be tinted, as long as it isn’t mirror-like (35%+ reflectance), and the car has two outside mirrors if the rear view is blocked.', 'good')
        .say(7.4, 'On the windshield, only a strip along the top 4 inches (or to the shade band). And no objects blocking the driver’s view.', 'info');
    },
  });

  LAW.add({
    sec: '710', div: 'equip', title: 'Tires, studs, and tread depth',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'No metal tracks, or tires with studs, cleats, or spikes projecting beyond the tread, except as allowed by rule (police, ambulances, and rural mail carriers may use studs). **Tire chains** are allowed when needed for snow or ice.',
      'Don’t drive on (and dealers may not sell) an **unsafe tire**: belting or cords exposed, tread or cord separation, a “not for highway use” marking, illegal regrooving, or tread worn to or below the minimum in 2+ adjacent grooves at 3+ spots.',
      'Minimum tread: **2/32 inch** for passenger cars and vehicles under 10,000 lbs; **4/32** front and 2/32 rear for 10,000+ lbs; **1/32** for motorcycles and mopeds.',
    ],
    dur: 10,
    build(s) {
      s.bg('blank', { fill: '#24303d' });
      const tread = (x, depth, label, col, cords) => {
        const d = depth * 22;
        let g = `<g transform="translate(${x},420)"><rect x="-220" y="-20" width="440" height="220" rx="30" fill="#1d1f23"/>`;
        for (let i = 0; i < 4; i++) g += `<rect x="${-180 + i * 100}" y="-20" width="60" height="${d + 4}" fill="#24303d"/>`;
        g += `<rect x="-220" y="-20" width="440" height="6" fill="#24303d"/>`;
        if (cords) g += `<path d="M -200 140 L 200 140 M -200 160 L 200 160" stroke="#c9b48a" stroke-width="4" stroke-dasharray="14 8"/><rect x="-120" y="60" width="140" height="90" rx="20" fill="#24303d"/><path d="M -110 110 L 10 110 M -110 125 L 10 125" stroke="#c9b48a" stroke-width="4"/>`;
        g += `<text y="-60" text-anchor="middle" font-size="34" font-weight="900" fill="${col}" ${F}>${label}</text></g>`;
        return g;
      };
      s.raw(tread(450, 1, '1/32 in left', '#ff6b5e'), { layer: 'actors' });
      s.text(0, 10, 450, 680, 'Passenger car minimum: 2/32', { size: 26, color: '#e8edf3' });
      s.mark(0.8, 10, 450, 260, 'x', { r: 40 });
      s.raw(tread(1150, 6, '6/32 in', '#7cf2a8'), { t0: 3, layer: 'actors', fade: 0.3 });
      s.mark(3.6, 10, 1150, 260, 'ok', { r: 40 });
      s.say(0, 'Close-up of tire tread. This tire is worn to 1/32 of an inch.', 'bad')
        .say(1.6, 'For passenger cars the minimum is 2/32. Exposed cords, separations, or “not for highway use” tires are also unsafe.', 'bad')
        .say(3.6, 'A tire with 6/32 inch of tread is fine.', 'good')
        .say(6.4, 'Studs are generally banned, but tire chains are allowed when needed for snow or ice.');
    },
  });

  LAW.add({
    sec: '710c', div: 'equip', title: 'Bumpers and lift limits',
    penalty: 'civil', penaltyText: EQ,
    rule: [
      'Vehicles must have **front and rear bumpers** (or equivalent energy-absorbing systems) securely attached and in good condition.',
      'Maximum heights: **passenger vehicles**, frame 12 in / bumper 22 in. Other vehicles under 4,501 lbs GVWR, 24 / 26 in; **4,501–7,500 lbs**, 24 / 28 in; 7,501–10,000 lbs, 26 / 30 in.',
      'No lift blocks between the front axle and springs; rear lift blocks no more than 4 inches beyond the factory; body lift spacers no more than 3 inches; no coil spring spacers; steering geometry must stay as designed.',
    ],
    dur: 10,
    build(s) {
      s.bg('side');
      const gy = s.lane.ground;
      s.view([[0, 800, 520, 1400]]);
      const ppi = K.PX / 12; // pixels per inch in side views
      s.raw(K.sidePickup(460, gy, COL.red, { lift: 24 }), { layer: 'actors' });
      s.raw(K.sidePickup(1150, gy, COL.you, {}), { t0: 3.4, layer: 'actors', fade: 0.3 });
      const bottom = lift => gy - 42 - lift; // bottom edge of the bumper
      s.dim(0.6, 10, 690, gy, 690, bottom(24), '36 in', { color: '#d63a2f', lx: 52, ly: 0, bg: '#d63a2f' });
      s.dim(0.6, 10, 760, gy, 760, gy - 28 * ppi, '28 in max', { color: '#ffd34d', lx: 70, ly: 0 });
      s.dim(3.6, 10, 1380, gy, 1380, bottom(0), '23 in', { color: '#1f9d55', lx: 52, ly: 0, bg: '#1f9d55' });
      s.text(0.4, 10, 460, 330, 'Lifted pickup, 6,000 lbs GVWR', { size: 26, color: '#18202a' });
      s.mark(1.2, 10, 460, 390, 'x', { r: 36 });
      s.text(3.4, 10, 1150, 330, 'Stock height', { size: 26, color: '#18202a' });
      s.mark(4, 10, 1150, 390, 'ok', { r: 36 });
      s.say(0, 'For a pickup rated 4,501–7,500 lbs GVWR, the bottom of the bumper may be at most 28 inches off the ground.')
        .say(1.2, 'This lifted truck’s bumper sits at 36 inches. Too high.', 'bad')
        .say(3.6, 'At stock height, the bumper is about 23 inches, within the limit.', 'good')
        .say(6.4, 'Lift blocks between the front axle and springs are prohibited outright.');
    },
  });

  LAW.add({
    sec: '710d', div: 'equip', title: 'Car seats and boosters for children',
    penalty: 'civil', penaltyText: 'Civil infraction · no points',
    rule: [
      '**Rear-facing** seat until the child is **2** or reaches the seat’s height or weight limit.',
      'Then a **forward-facing seat with a harness** until **5** or the seat’s limit; then a **belt-positioning booster** until the child is **4 ft 9 in** tall or **8** years old.',
      'Children under **13** must use a properly fastened seat belt (or booster) and ride in the **rear seat** if there is one and it isn’t full of other children. A rear-facing seat may go in front only if the front passenger air bag is off.',
      'Doesn’t apply in buses, school buses, taxis, motorcycles, or mopeds. Civil infraction; no points.',
    ],
    dur: 15,
    build(s) {
      s.bg('cabin');
      const S = s.lane.seats;
      s.raw(K.occupant(...S.driver, { belt: true }), { layer: 'actors' });
      s.raw(K.childSeat(S.rearL[0], S.rearL[1] - 10, 'rear'), { t0: 0.4, layer: 'actors', fade: 0.3 });
      s.text(0.4, 14, 360, 300, 'Under 2', { size: 26 });
      s.raw(K.childSeat(S.rearM[0] + 10, S.rearM[1] + 10, 'forward'), { t0: 2.6, layer: 'actors', fade: 0.3 });
      s.text(2.6, 14, 360, 450, '2 to 5', { size: 26 });
      s.raw(K.childSeat(S.rearR[0], S.rearR[1] + 10, 'booster'), { t0: 4.8, layer: 'actors', fade: 0.3 });
      s.text(4.8, 14, 360, 600, '5 to 8 / 4′9″', { size: 26 });
      s.raw(K.occupant(...S.front, { age: 'kid', belt: true, color: '#e3a72a' }), { t0: 7.4, t1: 10.8, layer: 'actors', fade: 0.3 });
      s.text(7.4, 10.8, 910, 700, '10-year-old, belted', { size: 26 });
      s.mark(8.2, 10.8, 1060, 600, 'ok', { r: 34 });
      s.raw(K.childSeat(S.front[0], S.front[1], 'rear'), { t0: 11, layer: 'actors', fade: 0.3 });
      s.text(11, 15, 910, 700, 'Front air bag ON', { size: 26, color: '#ffb3ad' });
      s.mark(11.6, 15, 1060, 600, 'x', { r: 34 });
      s.say(0, 'Each stage of child restraint, as Michigan law requires:')
        .say(0.6, 'Rear-facing until age 2, or until outgrowing the seat’s limits.', 'good')
        .say(2.8, 'Then forward-facing with a harness until age 5, or the seat’s limits.', 'good')
        .say(5, 'Then a booster with a lap-and-shoulder belt until 4 feet 9 inches tall or age 8.', 'good')
        .say(7.6, 'Kids under 13 ride in back when possible. Here every rear seat holds a younger child, so the 10-year-old may ride in front, belted.', 'good')
        .say(11, 'A rear-facing seat may go in front only if the passenger air bag is turned off.', 'bad')
        .say(13.2, 'Rules don’t apply in taxis, buses, or on motorcycles. A violation is a civil infraction with no points.');
    },
  });

  LAW.add({
    sec: '710e', div: 'equip', title: 'Seat belts',
    penalty: 'civil', penaltyText: 'Civil infraction · no points',
    rule: [
      'The **driver and every front-seat passenger** must wear a properly adjusted and fastened seat belt. Children under 13 follow MCL 257.710d.',
      'Drivers must make sure passengers **13 to 15** are belted in **any seat** (if belts are available).',
      'Exempt: vehicles made before 1965, buses, motorcycles, mopeds, people with a doctor’s written verification, delivery vehicles making frequent stops, and rural mail carriers on their route. Road-work operators in work zones need only a lap belt.',
      'Not wearing a belt can be evidence of negligence, reducing damages recovered by **up to 5%**. Civil infraction; no points.',
    ],
    dur: 12,
    build(s) {
      s.bg('cabin');
      const S = s.lane.seats;
      s.raw(K.occupant(...S.driver, { belt: false }) + K.occupant(...S.front, { belt: true, color: '#3f8f5c' }) + K.occupant(...S.rearR, { age: 'teen', belt: false, color: '#e05d8e' }), { t0: 0, t1: 6, layer: 'actors', fade: 0.3 });
      s.mark(0.8, 6, S.driver[0] + 100, S.driver[1] - 80, 'x', { r: 30 });
      s.mark(1.6, 6, S.front[0] + 100, S.front[1] + 80, 'ok', { r: 30 });
      s.mark(2.6, 6, S.rearR[0] + 110, S.rearR[1] + 60, 'x', { r: 30 });
      s.text(2.6, 6, S.rearR[0], S.rearR[1] + 120, 'Age 14', { size: 24 });
      s.raw(K.occupant(...S.driver, { belt: true }) + K.occupant(...S.front, { belt: true, color: '#3f8f5c' }) + K.occupant(...S.rearR, { age: 'teen', belt: true, color: '#e05d8e' }), { t0: 6.2, layer: 'actors', fade: 0.3 });
      s.mark(6.8, 12, 1200, 450, 'ok', { r: 44 });
      s.say(0, 'The driver isn’t wearing a seat belt.', 'bad')
        .say(1.6, 'The front-seat passenger is.', 'good')
        .say(2.6, 'The 14-year-old in back isn’t, and the driver is responsible for passengers 13 to 15 in any seat.', 'bad')
        .say(6.4, 'Everyone buckled: driver, front passenger, and the teen in back.', 'good')
        .say(8.8, 'Going without a belt can also cut the damages you recover after a crash by up to 5%.');
    },
  });
})();
