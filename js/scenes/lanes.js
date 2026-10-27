/* Driving on the right, overtaking and passing: MCL 257.634 – 257.645; turning and signals: 257.647 – 257.648 */
(function () {
  const { COL } = K;
  const F = 'font-family="system-ui,Segoe UI,Arial"';

  LAW.add({
    sec: '634', div: 'lane', title: 'Keep to the right',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'On a road wide enough, drive on the **right half**, except when passing, when the right half is closed or obstructed (then yield to oncoming traffic), for road-work vehicles, or on a 3-lane road under its rules.',
      'With **2 or more lanes in your direction**, drive in the **far-right lane**, except when traffic fills all lanes, to prepare for a left turn, or to avoid blocking a streetcar.',
      'On a **freeway with 3+ lanes** each way, cars may use any lane. But trucks over 10,000 lbs, truck-tractors, and vehicles towing trailers must use **only the 2 right lanes** (except to turn left or avoid a hazard).',
    ],
    dur: 13,
    build(s) {
      s.bg('road', { lanes: 2, y: 250, scenery: false });
      const A = { ...s.lane };
      s.bg('road', { lanes: 3, y: 660, oneway: true, noBase: true, scenery: false });
      const B = s.lane;
      s.view([[0, 800, 450, 1600]]);
      for (const [x, y] of [[120, 40], [520, 60], [980, 40], [1420, 70], [200, 470], [700, 500], [1150, 480], [400, 860], [1300, 860]]) s.prop(x, y, 'tree');
      s.text(0, 13, 30, 448, 'Road with 2 lanes each way', { anchor: 'start', size: 28, color: '#1b2a1b' });
      s.text(0, 13, 30, 530, 'Freeway, 3 lanes in one direction', { anchor: 'start', size: 28, color: '#1b2a1b' });
      s.car({ kind: 'car', color: COL.teal, path: s.P(1760, A.W(0), 0).to(-120, A.W(0), 6.5) });
      const r = s.car({ kind: 'car', color: COL.red, label: 'Stays in left lane', path: s.P(-100, A.E(1), 0).to(1760, A.E(1), 6) });
      r.set(0, 'labelColor', 'bad');
      s.mark(1.8, 5.6, 0, 0, 'x', { follow: r });
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-300, A.E(0), 0.4).to(1760, A.E(0), 6.6) });
      s.mark(2.4, 6, 0, 0, 'ok', { follow: b, dx: 70 });
      s.car({ kind: 'car', color: COL.gold, path: s.P(-100, B.E(2), 5.6).to(1760, B.E(2), 10.6) });
      s.car({ kind: 'suv', color: COL.white, path: s.P(-300, B.E(1), 5.4).to(1760, B.E(1), 11) });
      s.car({ kind: 'car', color: COL.purple, path: s.P(-200, B.E(0), 5.8).to(1760, B.E(0), 11.4) });
      const t = s.car({ kind: 'semi', color: '#2b5ea8', label: 'Truck in far-left lane', path: s.P(-300, B.E(2), 7.6).to(1800, B.E(2), 13) });
      t.set(0, 'labelColor', 'bad');
      s.mark(9, 12.8, 0, 0, 'x', { follow: t });
      s.car({ kind: 'semi', color: '#3f8f5c', path: s.P(-260, B.E(0), 7).to(1800, B.E(0), 13) });
      s.say(0, 'On a road with 2+ lanes each way, stay in the far-right lane except to pass, to turn left, or when every lane is busy.')
        .say(1.8, 'Cruising in the left lane with no one to pass violates this rule.', 'bad')
        .say(5.8, 'On freeways with 3+ lanes each way, cars may use any lane.', 'good')
        .say(8.4, 'But heavy trucks (over 10,000 lbs) and anything towing a trailer must stay in the 2 right lanes.', 'bad')
        .say(11.2, 'And on any road wide enough, drive on the right half except to pass or get around an obstruction.');
    },
  });

  LAW.add({
    sec: '635', div: 'lane', title: 'Meeting oncoming traffic',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Drivers going in opposite directions must pass each other **to the right**, each giving the other at least **half of the main traveled road** as nearly as possible.',
      'This matters most on narrow roads with no center line.',
    ],
    dur: 12,
    build(s) {
      s.bg('road', { lanes: 1, center: 'none', shoulder: 18, zoom: 1100 });
      const L = s.lane;
      s.text(0, 12, 800, L.top - 60, 'Narrow road, no center line', { size: 26, color: '#1b2a1b' });
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.y, 0).to(500, L.y, 2).curve(620, L.y, 700, L.E(0), 2.6).to(1100, L.E(0), 3.8).curve(1180, L.E(0), 1260, L.y, 4.4).to(1760, L.y, 5.8) });
      s.car({ kind: 'car', color: COL.gold, path: s.P(1760, L.y, 0).to(1100, L.y, 2).curve(980, L.y, 900, L.W(0), 2.6).to(500, L.W(0), 3.8).curve(420, L.W(0), 340, L.y, 4.4).to(-120, L.y, 5.8) });
      s.mark(2.8, 4.2, 800, L.bot + 80, 'ok');
      void a;
      const c = s.car({ kind: 'car', color: COL.red, label: 'Hogs the middle', path: s.P(-100, L.y, 6.2).to(1760, L.y, 11.4) });
      c.set(0, 'labelColor', 'bad');
      const d = s.car({ kind: 'suv', color: COL.white, path: s.P(1760, L.y, 6.2).to(1150, L.y, 7.8).curve(1020, L.y, 960, L.top - 6, 8.6, 'out').wait(9.4).to(-120, L.top - 6, 11.6, 'in') });
      d.set(8.2, 'brake', true).set(9.4, 'brake', false);
      s.note(8.6, 10.4, 0, 0, 'Forced onto the shoulder', 'bad', { follow: d });
      s.say(0, 'Two cars meet on a narrow road with no center line.')
        .say(2.2, 'Each moves right, giving the other at least half the road.', 'good')
        .say(6.4, 'This driver stays in the middle and doesn’t give up half.', 'bad')
        .say(8.6, 'The oncoming driver has to brake and swerve onto the shoulder.', 'bad');
    },
  });

  LAW.add({
    sec: '636', div: 'lane', title: 'Passing on the left, and passing bicycles',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Pass at a **safe distance to the left**, and move back to the right only when **safely clear** of the vehicle you passed.',
      'The driver being passed must give way to the right and **must not speed up** until passed.',
      'When passing a **bicycle**, leave **at least 3 feet**, or, if that’s impracticable, a safe distance at a safe speed.',
      'If it’s safe, a driver may pass a bicycle **even in a no-passing zone**.',
    ],
    dur: 15,
    build(s) {
      s.bg('road', { lanes: 1, center: [{ x0: 0, x1: 900, type: 'dashed' }, { x0: 900, x1: 1600, type: 'double' }] });
      const L = s.lane;
      s.sign(900, L.top - 40, 'nopass');
      const g = s.car({ kind: 'car', color: COL.gold, path: s.P(60, L.E(0), 0).to(900, L.E(0), 5.4) });
      g.mph([[0, 40]]);
      s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-200, L.E(0), 0).to(-40, L.E(0), 0.8).curve(40, L.E(0), 120, L.W(0), 1.4).to(620, L.W(0), 2.6).curve(720, L.W(0), 800, L.E(0), 3.2).to(1760, L.E(0), 5.2) });
      g.set(5.4, 'show', false);
      const bike = s.car({ kind: 'bike', color: '#3f8f5c', label: 'Bicyclist', labelBelow: true, from: 5.8, path: s.P(900, L.bot - 14, 5.8).to(1400, L.bot - 14, 10.8) });
      bike.set(10.8, 'show', false);
      s.car({ kind: 'car', color: COL.teal, path: s.P(-100, L.E(0), 6).to(800, L.E(0), 7.8).curve(900, L.E(0), 980, L.y - 20, 8.3).to(1250, L.y - 20, 9).curve(1340, L.y - 20, 1420, L.E(0), 9.5).to(1760, L.E(0), 10.3) });
      s.dim(8.5, 9.4, 1190, L.y - 4, 1190, L.bot - 20, '3 ft+', { color: '#7cf2a8', lx: 70, ly: 0 });
      const b2 = s.car({ kind: 'bike', color: '#8457c4', label: 'Bicyclist', labelBelow: true, from: 11, path: s.P(900, L.bot - 14, 11).to(1400, L.bot - 14, 15.4) });
      void b2;
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0) - 4, 11).to(1760, L.E(0) - 4, 14.4) });
      r.set(12.6, 'label', 'Too close').set(12.6, 'labelColor', 'bad');
      s.mark(13, 14.8, 1124, L.bot + 80, 'x');
      s.say(0, 'Passing a slower car where passing is allowed: go around on the left, at a safe distance…')
        .say(2.6, '…and move back right only when safely clear of it.', 'good')
        .say(3.4, 'The driver being passed must keep right and not speed up.')
        .say(6.2, 'Passing a bicycle: leave at least 3 feet, or a safe distance and speed if 3 feet isn’t practicable.', 'good')
        .say(8.2, 'Even in a no-passing zone, a driver may pass a bicycle when it’s safe to do so.', 'good')
        .say(12.4, 'This driver passes the cyclist with less than 3 feet to spare.', 'bad');
    },
  });

  LAW.add({
    sec: '637', div: 'lane', title: 'Passing on the right',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Passing on the right is allowed only: (a) when the vehicle ahead is turning or about to turn left; (b) on a road with unobstructed room for 2+ lines of moving traffic in each direction; or (c) on a one-way road with room for 2+ lines of traffic.',
      'It must be done safely, and **never by driving off the pavement** or main traveled part of the road.',
      'Passing a bicycle on the right (where permitted) also requires 3 feet, or a safe distance at a safe speed.',
    ],
    dur: 12,
    build(s) {
      s.bg('road', { lanes: 2, y: 240, scenery: false });
      const A = { ...s.lane };
      s.bg('road', { lanes: 1, y: 660, noBase: true, scenery: false, shoulder: 36 });
      const B = s.lane;
      s.view([[0, 800, 450, 1600]]);
      s.raw(`<rect x="900" y="0" width="60" height="${A.top}" fill="#55595f"/>`, { layer: 'bg' });
      for (const [x, y] of [[300, 50], [1300, 40], [200, 470], [800, 500], [1400, 480], [500, 860], [1200, 860]]) s.prop(x, y, 'tree');
      s.text(0, 12, 30, 440, 'Multi-lane road', { anchor: 'start', size: 28, color: '#1b2a1b' });
      s.text(0, 12, 30, 540, 'Two-lane road with a shoulder', { anchor: 'start', size: 28, color: '#1b2a1b' });
      const lt = s.car({ kind: 'car', color: COL.gold, label: 'Turning left', path: s.P(-100, A.E(1), 0).to(820, A.E(1), 2.4, 'out').wait(4.6).curve(930, A.E(1), 930, 170, 5.4).to(930, 30, 6) });
      lt.set(1.2, 'sig', 'L').set(2.2, 'brake', true).set(4.6, 'brake', false);
      const p = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, A.E(0), 1.2).to(1760, A.E(0), 5.4) });
      s.mark(3, 5, 0, 0, 'ok', { follow: p, dx: 60, dy: 50 });
      s.car({ kind: 'tractor', color: '#3a8d3a', label: 'Slow tractor', labelBelow: true, from: 6, path: s.P(100, B.E(0), 6).to(700, B.E(0), 13) });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(-100, B.E(0), 6).to(150, B.E(0), 7.6).curve(220, B.E(0), 260, B.bot + 18, 8).to(520, B.bot + 18, 8.8).curve(600, B.bot + 18, 660, B.E(0), 9.3).to(1760, B.E(0), 11.2) });
      r.set(7.8, 'label', 'Passes on the shoulder').set(7.8, 'labelColor', 'bad');
      s.mark(8.6, 11.4, 400, B.bot + 100, 'x');
      s.say(0, 'Passing on the right is allowed when the car ahead is turning left…', 'good')
        .say(2.6, '…or on roads with room for 2+ lanes of moving traffic in each direction, or on wide one-way roads.', 'good')
        .say(6.2, 'On a two-lane road, a driver gets stuck behind a slow tractor.')
        .say(8, 'Passing on the right by driving onto the shoulder is never allowed.', 'bad');
    },
  });

  LAW.add({
    sec: '638', div: 'lane', title: 'Passing on a two-lane road',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Don’t cross to the left side of the center of a 2-lane road (or into the center lane of a 3-lane road) to pass unless the way is **clearly visible and free of oncoming traffic** far enough ahead to finish the pass without interfering with oncoming traffic or the car being passed.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      s.car({ kind: 'truck', color: '#d0452f', label: 'Slow truck', labelBelow: true, path: s.P(100, L.E(0), 0).to(1100, L.E(0), 12) });
      const o1 = s.car({ kind: 'car', color: COL.white, path: s.P(1760, L.W(0), 0.6).to(980, L.W(0), 3.0, 'lin').to(900, L.W(0), 3.3, 'out').wait(3.6).to(-120, L.W(0), 6.6, 'in') });
      o1.set(2.9, 'brake', true).set(3.6, 'brake', false).set(2.8, 'waves', 'horn').set(3.6, 'waves', null);
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(-160, L.E(0), 0).to(-20, L.E(0), 1.2).curve(60, L.E(0), 120, L.W(0), 1.8).to(330, L.W(0), 2.5).to(520, L.W(0), 2.9).curve(580, L.W(0), 620, L.E(0), 3.2).to(1760, L.E(0), 5.2) });
      r.set(1.6, 'label', 'Passes into oncoming car').set(1.6, 'labelColor', 'bad').set(4, 'label', null);
      s.mark(2.8, 4.4, 720, L.top - 70, 'x');
      s.car({ kind: 'car', color: COL.gold, path: s.P(1760, L.W(0), 4.8).to(-120, L.W(0), 8.8) });
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 4.6).to(300, L.E(0), 6.2, 'out').to(420, L.E(0), 7.8).curve(500, L.E(0), 560, L.W(0), 8.2).to(1000, L.W(0), 9.2).curve(1080, L.W(0), 1140, L.E(0), 9.6).to(1760, L.E(0), 10.6) });
      s.note(6.4, 7.8, 0, 0, 'Waits for a clear view', 'good', { follow: b });
      s.say(0, 'A driver behind a slow truck pulls out to pass, but a car is coming.', 'bad')
        .say(2.8, 'The oncoming driver has to brake hard. The way wasn’t clear for long enough.', 'bad')
        .say(4.8, 'This driver waits behind the truck until the oncoming lane is clear.', 'good')
        .say(7.8, 'With the way clear far enough ahead, the pass can be finished safely.', 'good');
    },
  });

  LAW.add({
    sec: '639', div: 'lane', title: 'No passing near hills, curves, bridges, or tunnels',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Don’t drive on the left side of the road when approaching the **crest of a hill** or on a **curve** where your view is blocked enough to create a hazard if someone approaches from the other direction.',
      'Don’t drive on the left within **100 feet of a bridge, viaduct, or tunnel** when your view is obstructed.',
      'These limits don’t apply on one-way roads.',
    ],
    dur: 10,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      s.raw(`<defs><linearGradient id="crest" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
        <rect x="820" y="0" width="360" height="900" fill="url(#crest)"/>`, { layer: 'zones' });
      s.text(0, 10, 1000, L.top - 70, '▲ HILL CREST', { size: 26, color: '#1b2a1b' });
      s.sign(640, L.top - 40, 'warn', 'HILL|BLOCKS VIEW');
      s.raw(`<g transform="translate(1120,650)"><rect x="-200" y="-90" width="400" height="180" rx="14" fill="#eaf4fb" stroke="#26313d" stroke-width="3"/>
        <path d="M -190 70 Q 0 -60 190 70" fill="#8fb878" stroke="#5c7a4a" stroke-width="3"/>
        <rect x="-150" y="22" width="44" height="18" rx="5" fill="#d0452f" transform="rotate(-24 -128 31)"/>
        <rect x="100" y="22" width="44" height="18" rx="5" fill="#eceae4" stroke="#999" transform="rotate(24 122 31)"/>
        <text x="0" y="-62" text-anchor="middle" font-size="20" font-weight="800" fill="#26313d" ${F}>Side view: neither can see the other</text></g>`, { t0: 1, layer: 'fx', fade: 0.3 });
      s.car({ kind: 'car', color: COL.gold, path: s.P(400, L.E(0), 0).to(1300, L.E(0), 9) });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 0).to(380, L.E(0), 2).curve(480, L.E(0), 540, L.W(0), 2.6).to(990, L.W(0), 4, 'out').curve(1060, L.W(0), 1100, L.E(0), 4.7).to(1760, L.E(0), 6.4) });
      r.set(2.2, 'label', 'Passes on a hill').set(2.2, 'labelColor', 'bad').set(5, 'label', null).set(3.6, 'brake', true).set(4.5, 'brake', false);
      const w = s.car({ kind: 'suv', color: COL.white, path: s.P(1500, L.W(0), 3).to(1130, L.W(0), 4, 'out').wait(4.6).to(-120, L.W(0), 8.4, 'in') });
      w.tween('opacity', [[3, 0], [3.35, 0], [3.6, 1]]).set(3.6, 'brake', true).set(4.6, 'brake', false);
      s.mark(4, 6, 1060, L.top - 140, 'x');
      s.say(0, 'Approaching the top of a hill, a driver pulls out to pass.', 'bad')
        .say(3.4, 'An oncoming car appears over the crest, too close to avoid easily.', 'bad')
        .say(5.4, 'Don’t drive on the left near a hilltop or curve that blocks your view, or within 100 feet of a bridge, viaduct, or tunnel when your view is blocked.', 'warn');
    },
  });

  LAW.add({
    sec: '640', div: 'lane', title: 'No-passing zones',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'MDOT and county road commissions mark stretches where passing would be especially hazardous, based on a traffic and engineering study, with signs and pavement markings showing where each zone begins and ends.',
      'A **solid yellow line on your side** of the center line means no passing. A pennant-shaped sign may be placed on the left side of the road.',
      'Failing to obey no-passing markings or signs is a civil infraction.',
    ],
    dur: 10.5,
    build(s) {
      s.bg('road', { lanes: 1, center: [{ x0: 0, x1: 700, type: 'dashed' }, { x0: 700, x1: 1600, type: 'nopassE' }] });
      const L = s.lane;
      s.sign(700, L.top - 40, 'nopass');
      s.zone(0, 10.5, { rect: [700, L.y - 2, 900, 14] }, '#ffc20e', 'Solid line on your side = no passing', { ly: -60, fo: 0.15 });
      s.car({ kind: 'truck', color: COL.gray, path: s.P(300, L.E(0), 0).to(1300, L.E(0), 10) });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 0.4).to(480, L.E(0), 2.4).curve(600, L.E(0), 720, L.W(0), 2.9).to(1040, L.W(0), 3.6).curve(1120, L.W(0), 1190, L.E(0), 4.1).to(1760, L.E(0), 5.6) });
      r.set(2.6, 'label', 'Passes in the zone').set(2.6, 'labelColor', 'bad').set(5, 'label', null);
      s.mark(3.2, 5.4, 880, L.top - 140, 'x');
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 4.4).to(1110, L.E(0), 10) });
      s.mark(6.4, 10.5, 0, 0, 'ok', { follow: b });
      s.say(0, 'A no-passing zone begins: solid yellow on the eastbound side, with a pennant sign on the left.')
        .say(2.6, 'This driver crosses the line to pass anyway.', 'bad')
        .say(5.6, 'This driver stays behind the truck until the zone ends.', 'good');
    },
  });

  LAW.add({
    sec: '641', div: 'lane', title: 'One-way roads and rotary islands',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'On a road designated and signposted for **one-way** traffic, drive only in the indicated direction.',
      'When going around a **rotary traffic island**, drive **only to the right** of the island (counterclockwise).',
    ],
    dur: 11,
    build(s) {
      s.bg('blank', { fill: '#a9c98f', map: true });
      const cx = 800, cy = 450;
      const arcLine = (r, gaps) => {
        let d = '';
        for (let i = 0; i < 4; i++) {
          const a0 = (i * 90 + gaps) * Math.PI / 180, a1 = ((i + 1) * 90 - gaps) * Math.PI / 180;
          d += `M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} `;
        }
        return `<path d="${d}" stroke="#f3f3f0" stroke-width="4" fill="none"/>`;
      };
      s.raw(`<rect x="0" y="386" width="1600" height="128" fill="#55595f"/><rect x="736" y="0" width="128" height="900" fill="#55595f"/>
        <circle cx="${cx}" cy="${cy}" r="190" fill="none" stroke="#55595f" stroke-width="100"/>
        <circle cx="${cx}" cy="${cy}" r="136" fill="#93b878" stroke="#d6d2c8" stroke-width="6"/>
        ${arcLine(238, 20)}
        <line x1="0" y1="450" x2="550" y2="450" stroke="#f2c230" stroke-width="4" stroke-dasharray="28 26"/>
        <line x1="800" y1="0" x2="800" y2="200" stroke="#f2c230" stroke-width="4" stroke-dasharray="28 26"/>
        <line x1="800" y1="700" x2="800" y2="900" stroke="#f2c230" stroke-width="4" stroke-dasharray="28 26"/>
        <line x1="1050" y1="450" x2="1600" y2="450" stroke="#f3f3f0" stroke-width="4" stroke-dasharray="28 26"/>
        <line x1="0" y1="389" x2="560" y2="389" stroke="#f3f3f0" stroke-width="4"/><line x1="0" y1="511" x2="560" y2="511" stroke="#f3f3f0" stroke-width="4"/>
        <line x1="1040" y1="389" x2="1600" y2="389" stroke="#f3f3f0" stroke-width="4"/><line x1="1040" y1="511" x2="1600" y2="511" stroke="#f3f3f0" stroke-width="4"/>
        <path d="M 1180 418 h 50 M 1215 406 l 15 12 l -15 12 M 1180 482 h 50 M 1215 470 l 15 12 l -15 12" stroke="#f3f3f0" stroke-width="5" fill="none"/>`, { layer: 'bg' });
      s.prop(cx, cy, 'tree', { s: 2.4, layer: 'bg' });
      for (const [x, y] of [[300, 200], [400, 760], [1300, 220], [1250, 760], [150, 680], [1450, 650]]) s.prop(x, y, 'tree', { s: 1.2 });
      s.sign(1300, 560, 'oneway', 'R');
      s.sign(1360, 350, 'dne');
      s.view([[0, 800, 450, 1400]]);
      s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, 482, 0).to(540, 482, 2).curve(609, 482, 621.5, 515, 2.4).arc(cx, cy, 190, 160, -75, 5.6).curve(832, 261, 832, 180, 5.9).to(832, -100, 6.8) });
      s.car({ kind: 'car', color: COL.gold, path: s.P(832, 1000, 0.8).to(832, 700, 2).curve(832, 640, 865, 628.5, 2.4).arc(cx, cy, 190, 70, 25, 3).curve(994, 482, 1060, 482, 3.3).to(1760, 482, 4.6) });
      const w = s.car({ kind: 'car', color: COL.red, path: s.P(1760, 418, 5.2).to(1160, 418, 7, 'out').wait(11) });
      w.set(5.4, 'label', 'Wrong way').set(5.4, 'labelColor', 'bad').set(6.6, 'brake', true);
      s.mark(6, 9, 0, 0, 'x', { follow: w });
      const g = s.car({ kind: 'car', color: COL.green, path: s.P(832, 1000, 7).to(832, 720, 8).curve(832, 643, 783, 639, 8.4).arc(cx, cy, 190, 95, 170, 9.6).curve(602, 418, 540, 418, 10).to(-100, 418, 11) });
      g.set(7.4, 'label', 'Goes left of the island').set(7.4, 'labelColor', 'bad');
      s.say(0, 'Around a rotary island, drive only to the right of it, which means counterclockwise.')
        .say(1.6, 'This driver enters and circles counterclockwise, keeping the island on the left.', 'good')
        .say(5.4, 'This driver heads the wrong way down a road signed for one-way traffic.', 'bad')
        .say(7.6, 'This driver takes the short way around, passing the island on its left side.', 'bad');
    },
  });

  LAW.add({
    sec: '642', div: 'lane', title: 'Lane use, lane changes, and HOV lanes',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Stay as nearly as practicable **entirely within one lane**, and don’t leave it until you’ve made sure the move is safe.',
      'On a **4+ lane two-way road**, keep to the far-right lane except when passing, and don’t cross the center line except to turn left.',
      'On a **3-lane two-way road**, use the center lane only to pass (when clear), to prepare for a left turn, or where signs assign it to your direction.',
      'Obey signs and markings that assign lanes or prohibit lane changes. **HOV lanes** are reserved during posted hours for buses and high-occupancy vehicles; emergency vehicles, police, buses, and motorcycles are exempt.',
    ],
    dur: 15,
    build(s) {
      s.bg('road', { lanes: 2, vy: 500 });
      const L = s.lane;
      const w = s.car({ kind: 'suv', color: COL.white, path: s.P(-100, L.E(0), 0).to(760, L.E(0), 2.4).to(900, L.E(0), 3.2, 'out').to(1760, L.E(0), 5.8, 'in') });
      w.set(2.4, 'brake', true).set(3.2, 'brake', false).set(2.4, 'waves', 'horn').set(3.2, 'waves', null);
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(1), 0.2).to(700, L.E(1), 2).curve(780, L.E(1), 840, L.E(0), 2.4).to(1760, L.E(0), 4.6) });
      r.set(1.8, 'label', 'Cuts in, no signal').set(1.8, 'labelColor', 'bad').set(4, 'label', null);
      s.mark(2.6, 4.4, 860, L.bot + 90, 'x');
      s.car({ kind: 'car', color: COL.gold, path: s.P(-100, L.E(0), 5.6).to(1760, L.E(0), 11) });
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(1), 6).to(600, L.E(1), 8).curve(700, L.E(1), 780, L.E(0), 8.6).to(1760, L.E(0), 10.6) });
      b.set(6.8, 'sig', 'R').set(8.6, 'sig', null);
      s.note(6.9, 8.4, 0, 0, 'Signals and checks the gap', 'good', { follow: b });
      s.raw(`<g transform="translate(800,330)"><rect x="-470" y="-100" width="940" height="200" rx="18" fill="#18202a" stroke="rgba(255,255,255,.2)" stroke-width="2"/>
        <polygon points="-380,-30 -340,-70 -300,-30 -340,10" fill="none" stroke="#fff" stroke-width="6"/>
        <text x="-250" y="-40" font-size="30" font-weight="900" fill="#fff" ${F}>HOV lanes (diamond marking)</text>
        <text x="-250" y="2" font-size="22" font-weight="600" fill="#e8edf3" ${F}>Reserved during posted hours for buses and</text>
        <text x="-250" y="32" font-size="22" font-weight="600" fill="#e8edf3" ${F}>high-occupancy vehicles. Exempt: emergency</text>
        <text x="-250" y="62" font-size="22" font-weight="600" fill="#e8edf3" ${F}>vehicles, police, buses, and motorcycles.</text></g>`, { t0: 11.2, layer: 'fx', fade: 0.4 });
      s.say(0, 'Stay within your lane and don’t change lanes until you’ve made sure it’s safe.')
        .say(1.8, 'This driver swerves into the next lane without signaling or checking, cutting someone off.', 'bad')
        .say(6.4, 'This driver signals, checks for a safe gap, and then changes lanes.', 'good')
        .say(9, 'On 3-lane two-way roads, the center lane is only for passing when clear, turning left, or as signed.')
        .say(11.2, 'Lanes marked with a diamond may be HOV lanes, reserved during posted hours.');
    },
  });

  LAW.add({
    sec: '643', div: 'lane', title: 'Following too closely',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Don’t follow another vehicle **more closely than is reasonable and prudent**, considering speed, traffic, and road conditions.',
      'Outside city and village limits, vehicles over **5,000 lbs** must stay **500 feet** behind similar vehicles going the same way, except when passing.',
      'Vehicles being driven from place to place for delivery must keep 500 feet apart. Neither 500-foot rule applies to a truck **platoon**.',
    ],
    dur: 12,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      const l1 = s.car({ kind: 'suv', color: COL.white, path: s.P(200, L.E(0), 0).to(800, L.E(0), 2.4).to(960, L.E(0), 3.2, 'out').wait(4.6) });
      l1.set(2.4, 'brake', true).set(4.6, 'show', false);
      const t1 = s.car({ kind: 'car', color: COL.red, label: 'Tailgating', path: s.P(122, L.E(0), 0).to(722, L.E(0), 2.4).to(896, L.E(0), 3.2, 'out').wait(4.6) });
      t1.set(0, 'labelColor', 'bad').set(2.8, 'brake', true).set(4.6, 'show', false);
      s.boom(3.2, 930, L.E(0), { text: 'CRASH', hold: 1 });
      const l2 = s.car({ kind: 'suv', color: COL.white, from: 5, path: s.P(200, L.E(0), 5).to(800, L.E(0), 7.4).to(960, L.E(0), 8.2, 'out').wait(12) });
      l2.set(7.4, 'brake', true);
      const f = s.car({ kind: 'car', color: COL.you, hi: true, label: 'Safe gap', from: 5, path: s.P(-20, L.E(0), 5).to(580, L.E(0), 7.4).to(780, L.E(0), 8.5, 'out').wait(12) });
      f.set(0, 'labelColor', 'good').set(7.7, 'brake', true);
      s.dim(8.6, 12, 812, L.E(0) + 50, 928, L.E(0) + 50, 'Room to stop', { color: '#7cf2a8', ly: 34 });
      s.say(0, 'This driver is following much too closely.', 'bad')
        .say(2.4, 'The car ahead brakes suddenly, and there isn’t enough room to stop.', 'bad')
        .say(5, 'Keep a gap that’s reasonable and prudent for your speed and conditions.', 'good')
        .say(8.6, 'With room to react, this driver stops safely.', 'good')
        .say(10, 'Outside cities, vehicles over 5,000 lbs must stay 500 feet behind similar vehicles unless passing.');
    },
  });

  LAW.add({
    sec: '643a', div: 'lane', title: 'Trucks must leave room to merge',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Outside business and residence districts, a **truck or truck-tractor** driver must, when conditions permit, leave enough space behind another truck that an overtaking vehicle can **pull in safely**.',
      'Trucks may still pass other vehicles lawfully.',
      'Trucks in a **platoon** are exempt from the spacing rule but must allow other vehicles reasonable access to change lanes and enter or exit the highway.',
    ],
    dur: 13,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      const T1 = s.car({ kind: 'truck', color: '#2b5ea8', path: s.P(400, L.E(0), 0).to(1400, L.E(0), 10) });
      const T2 = s.car({ kind: 'truck', color: '#2b5ea8', path: s.P(278, L.E(0), 0).to(1278, L.E(0), 10) });
      T1.set(5.8, 'show', false); T2.set(5.8, 'show', false);
      s.note(0.3, 2, 340, L.E(0), 'No gap between trucks', 'bad', { dy: 110 });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 0).to(120, L.E(0), 1).curve(200, L.E(0), 260, L.W(0), 1.6).to(760, L.W(0), 3).curve(840, L.W(0), 900, L.E(0), 3.4).to(1760, L.E(0), 5) });
      r.set(2, 'label', 'Can’t pull in').set(2, 'labelColor', 'bad').set(3.6, 'label', null);
      const w = s.car({ kind: 'car', color: COL.white, path: s.P(1760, L.W(0), 1).to(980, L.W(0), 3, 'out').wait(3.6).to(-120, L.W(0), 6.5, 'in') });
      w.set(2.6, 'brake', true).set(3.6, 'brake', false).set(2.4, 'waves', 'horn').set(3.4, 'waves', null);
      s.car({ kind: 'truck', color: '#3f8f5c', from: 6, path: s.P(560, L.E(0), 6).to(1460, L.E(0), 13) });
      s.car({ kind: 'truck', color: '#3f8f5c', from: 6, path: s.P(300, L.E(0), 6).to(1200, L.E(0), 13) });
      s.note(6.2, 8, 430, L.E(0), 'Space left between trucks', 'good', { dy: 110 });
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 6).to(140, L.E(0), 7).curve(220, L.E(0), 280, L.W(0), 7.5).to(790, L.W(0), 8.7).curve(810, L.W(0), 830, L.E(0), 9.1).to(1330, L.E(0), 13) });
      s.mark(9.4, 12.6, 0, 0, 'ok', { follow: b });
      s.say(0, 'Two trucks run nose to tail on a two-lane highway.')
        .say(1.8, 'A driver passing them has nowhere to pull in, and an oncoming car has to brake.', 'bad')
        .say(6, 'Outside business and residential areas, trucks must leave a gap behind other trucks when conditions permit.', 'good')
        .say(8.8, 'Now the passing driver can pull in safely between them.', 'good');
    },
  });

  LAW.add({
    sec: '643b', div: 'lane', title: 'Following a snowplow',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Don’t follow a snowplow **closer than 200 feet**, unless you are legally passing it.',
      'If a snowplow is stopped at or in an intersection, a vehicle approaching from behind must stop **at least 20 feet** back.',
      '“Snowplow” means a vehicle operating for the state, a county, a road commission, or a municipality, actively plowing, salting, or sanding, with its amber or green lights on.',
    ],
    dur: 13,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed', snow: true });
      const L = s.lane;
      const p1 = s.car({ kind: 'plow', path: s.P(300, L.E(0), 0).to(1100, L.E(0), 6.4) });
      p1.set(0, 'lights', 'amber').set(6.4, 'show', false);
      const r = s.car({ kind: 'car', color: COL.red, label: 'Too close', path: s.P(189, L.E(0), 0).to(989, L.E(0), 6.4) });
      r.set(0, 'labelColor', 'bad').set(6.4, 'show', false);
      s.raw(`<rect x="1010" y="0" width="128" height="900" fill="#7a7f86"/><rect x="1010" y="${L.top}" width="128" height="${L.bot - L.top}" fill="#7a7f86"/>`, { layer: 'bg', t0: 6.5 });
      const p2 = s.car({ kind: 'plow', path: s.P(500, L.E(0), 6.6).to(1070, L.E(0), 9.4, 'out').wait(13) });
      p2.set(0, 'lights', 'amber').set(0, 'show', false).set(6.6, 'show', true);
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 6.6).to(480, L.E(0), 8.4).to(840, L.E(0), 10, 'out').wait(13) });
      s.note(7, 8.6, 0, 0, '200+ ft behind', 'good', { follow: b });
      s.dim(10.2, 13, 874, L.E(0) + 50, 1011, L.E(0) + 50, '20+ ft', { color: '#1f9d55', ly: 34, bg: '#1f9d55' });
      s.say(0, 'Following a working snowplow this closely is illegal.', 'bad')
        .say(2.4, 'Stay at least 200 feet back unless you are legally passing it.', 'warn')
        .say(7, 'This driver keeps well back.', 'good')
        .say(9.8, 'When a plow is stopped at an intersection, stop at least 20 feet behind it.', 'good');
    },
  });

  LAW.add({
    sec: '644', div: 'lane', title: 'Divided highways and medians',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'On a highway divided into two roadways by a space, barrier, or dividing section, drive only on the **right-hand roadway**.',
      'Don’t drive over, across, or park within the median, except through an opening, crossover, or intersection established by public authority.',
      'On limited access highways (freeways), crossovers are only for emergency vehicles, road service vehicles helping disabled vehicles, and as authorized by signs.',
    ],
    dur: 11.5,
    build(s) {
      s.bg('road', { lanes: 2, median: 110, medianType: 'grass' });
      const L = s.lane;
      s.raw(`<rect x="1090" y="${L.y - 55}" width="120" height="110" fill="#55595f"/>`, { layer: 'bg' });
      s.text(0, 11.5, 1150, L.y + 8, 'OPENING', { size: 18, color: '#fff' });
      s.raw(`<path d="M 520 ${L.E(1)} Q 600 ${L.E(1)} 600 ${L.y} Q 600 ${L.W(1)} 520 ${L.W(1)}" stroke="#6b4a2b" stroke-width="22" fill="none" stroke-dasharray="3 7" opacity=".6"/>`, { t0: 2.6, layer: 'marks' });
      const r = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(1), 0).to(500, L.E(1), 1.8, 'out').curve(600, L.E(1), 600, L.y, 2.6).curve(600, L.W(1), 500, L.W(1), 3.4).to(-100, L.W(1), 5) });
      r.set(1.4, 'label', 'Crosses the median').set(1.4, 'labelColor', 'bad').set(1.2, 'sig', 'L');
      s.mark(2.4, 5, 600, L.y, 'x');
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(1), 5).to(1040, L.E(1), 7.6, 'out').curve(1150, L.E(1), 1150, L.y, 8.4).curve(1150, L.W(1), 1040, L.W(1), 9.2).to(-100, L.W(1), 11) });
      b.set(6.6, 'sig', 'L').set(9.2, 'sig', null);
      s.mark(8.2, 10.4, 1150, L.y - 130, 'ok');
      s.say(0, 'A divided highway: drive only on the right-hand roadway.')
        .say(1.6, 'This driver makes a U-turn straight across the grass median.', 'bad')
        .say(5.4, 'This driver waits for a public opening in the median and turns there.', 'good')
        .say(9.4, 'On freeways, median crossovers are only for emergency and road-service vehicles, or as signs allow.');
    },
  });

  LAW.add({
    sec: '645', div: 'lane', title: 'Freeway entrances and exits',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Drive onto or off of a **limited access roadway** (freeway) **only at the entrances and exits** established by public authority.',
    ],
    dur: 10,
    build(s) {
      s.bg('freeway', { ramp: 'on' });
      const L = s.lane;
      const r = s.car({ kind: 'suv', color: COL.red, path: s.P(1150, 940, 0.4).curve(1150, 740, 1260, L.E(0), 2.6).to(1760, L.E(0), 3.6) });
      r.set(0.4, 'label', 'Cuts across the grass').set(0.4, 'labelColor', 'bad');
      s.mark(1.8, 4.6, 1260, 770, 'x');
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-40, 940, 4).curve(180, 810, 380, 740, 5).curve(520, 709, 700, 709, 5.8).to(1050, 709, 6.6).curve(1150, 709, 1250, L.E(0), 7.1).to(1760, L.E(0), 8.2) });
      b.set(6.4, 'sig', 'L').set(7.2, 'sig', null);
      s.mark(5.8, 9.4, 0, 0, 'ok', { follow: b });
      s.say(0, 'This driver drives across the grass to get onto the freeway.', 'bad')
        .say(2.4, 'You may enter or leave a freeway only at entrances and exits built for that purpose.', 'warn')
        .say(4.4, 'This driver uses the entrance ramp and merges.', 'good');
    },
  });

  LAW.add({
    sec: '647', div: 'turn', title: 'How to turn at an intersection',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      '**Right turns:** approach and turn as close as practicable to the right-hand curb or edge.',
      '**Left turns (two-way roads):** approach from the part of the right half nearest the center line, and leave the intersection to the **right of the center line** of the road you enter.',
      'Special rules apply to one-way roads (keep left on a one-way when turning left), and local markings or signs can require a different path, which drivers must follow.',
    ],
    dur: 14,
    build(s) {
      s.bg('cross', { lanes: 1 });
      const L = s.lane;
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(700, L.E(0), 2).curve(L.S(0), L.E(0), L.S(0), 560, 2.6).to(L.S(0), 1000, 3.6) });
      a.set(0.6, 'sig', 'R').set(2.6, 'sig', null);
      s.trail(0.4, 3.6, `M 600 ${L.E(0)} L 700 ${L.E(0)} Q ${L.S(0)} ${L.E(0)} ${L.S(0)} 580`, '#7cf2a8');
      const b = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 3.6).to(660, L.E(0), 5.4).curve(L.N(0) + 20, L.E(0), L.N(0), 620, 6.2).curve(L.N(0) - 10, 700, L.S(0), 780, 6.8).to(L.S(0), 1000, 7.3) });
      b.set(4, 'sig', 'R').set(6.2, 'sig', null).set(5.4, 'label', 'Swings wide').set(5.4, 'labelColor', 'bad').set(7, 'label', null);
      s.mark(6.2, 7.4, L.N(0) + 80, 640, 'x');
      const c = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 7.2).to(720, L.E(0), 8.8).curve(L.N(0), L.E(0), L.N(0), 380, 9.6).to(L.N(0), -120, 10.6) });
      c.set(7.6, 'sig', 'L').set(9.6, 'sig', null);
      s.trail(7.4, 10.6, `M 620 ${L.E(0)} L 720 ${L.E(0)} Q ${L.N(0)} ${L.E(0)} ${L.N(0)} 360`, '#7cf2a8');
      const d = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 10.4).to(660, L.E(0), 11.8).curve(740, L.E(0) - 10, L.S(0), 340, 12.6).curve(L.S(0) + 10, 260, L.N(0), 160, 13.2).to(L.N(0), -120, 13.8) });
      d.set(10.6, 'sig', 'L').set(11.8, 'label', 'Cuts the corner').set(11.8, 'labelColor', 'bad');
      s.mark(12.4, 14, L.S(0) - 80, 300, 'x');
      s.say(0, 'Right turn: stay as close as practicable to the right edge or curb.', 'good')
        .say(4.6, 'Swinging wide into the other lane is a violation.', 'bad')
        .say(7.6, 'Left turn: approach next to the center line and leave the intersection to the right of the new road’s center line.', 'good')
        .say(11.6, 'Cutting the corner puts you on the wrong side of the road you’re entering.', 'bad');
    },
  });

  LAW.add({
    sec: '648', div: 'turn', title: 'Signaling turns and stops',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Before stopping or turning, first make sure it can be done safely, then **signal**, either by hand and arm or by a signal device that other drivers can understand.',
      'Hand signals from the driver’s left arm: **left turn**, arm straight out; **right turn**, arm out and up; **stop or slow**, arm out and down. A bicyclist may also signal a right turn with the right arm straight out.',
      'A commercial vehicle must use signal lamps or a mechanical signal when its body or load is more than 24 inches left of the steering post, or more than 14 feet behind it.',
    ],
    dur: 14,
    build(s) {
      s.bg('blank', { fill: '#7d8e9e' });
      s.raw(`<rect x="0" y="560" width="1600" height="340" fill="#55595f"/><rect x="0" y="0" width="1600" height="560" fill="url(#sky)"/>
        <path d="M 0 560 Q 400 470 800 520 T 1600 500 V 560 Z" fill="#a9c98f"/>`, { layer: 'bg' });
      const car = `<g>
        <rect x="560" y="300" width="480" height="300" rx="60" fill="#2f6fd6" stroke="#0b1d3f" stroke-width="5"/>
        <rect x="610" y="320" width="380" height="120" rx="30" fill="#22313f"/>
        <circle cx="700" cy="390" r="40" fill="#e0b48c"/><path d="M 662 380 Q 700 330 738 380" fill="#5a3a22"/>
        <rect x="600" y="480" width="90" height="40" rx="10" fill="#b51c1c" data-part="tail"/><rect x="910" y="480" width="90" height="40" rx="10" fill="#b51c1c"/>
        <rect x="740" y="500" width="120" height="50" rx="6" fill="#fff" stroke="#333"/><text x="800" y="534" text-anchor="middle" font-size="26" font-weight="800" fill="#1f3c88" ${F}>MICH</text>
        <rect x="570" y="600" width="80" height="40" rx="10" fill="#1d1f23"/><rect x="950" y="600" width="80" height="40" rx="10" fill="#1d1f23"/></g>`;
      s.raw(car, { layer: 'actors' });
      const arm = pts => `<polyline points="${pts}" fill="none" stroke="#e0b48c" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="#5b6fb5" stroke-width="26" stroke-linecap="round" stroke-dasharray="0 0" opacity="0"/>`;
      const sh = '585,400';
      s.raw(arm(`${sh} 420,400 330,400`), { t0: 1.4, t1: 4.6, layer: 'fx', fade: 0.25 });
      s.raw(arm(`${sh} 430,400 430,240`), { t0: 4.8, t1: 7.8, layer: 'fx', fade: 0.25 });
      s.raw(arm(`${sh} 430,400 430,560`), { t0: 8, t1: 11, layer: 'fx', fade: 0.25 });
      s.text(1.4, 4.6, 1260, 300, 'LEFT TURN', { size: 54, color: '#18202a' });
      s.text(1.4, 4.6, 1260, 360, 'Arm straight out', { size: 30, color: '#26313d', weight: 700 });
      s.text(4.8, 7.8, 1260, 300, 'RIGHT TURN', { size: 54, color: '#18202a' });
      s.text(4.8, 7.8, 1260, 360, 'Arm out and up', { size: 30, color: '#26313d', weight: 700 });
      s.text(8, 11, 1260, 300, 'STOP / SLOW', { size: 54, color: '#18202a' });
      s.text(8, 11, 1260, 360, 'Arm out and down', { size: 30, color: '#26313d', weight: 700 });
      const lamp = `<circle cx="645" cy="500" r="26" fill="#ffb21f" data-part="sigL"/><circle cx="645" cy="500" r="40" fill="url(#amberglow)" data-part="sigL"/>`;
      s.thing({ svg: lamp, at: [0, 0, 0], layer: 'actors' }).set(0, 'show', false).set(11.2, 'show', true).set(11.2, 'sig', 'L');
      s.text(11.2, 14, 1260, 300, 'OR USE THE', { size: 44, color: '#18202a' });
      s.text(11.2, 14, 1260, 360, 'turn signal', { size: 36, color: '#26313d', weight: 700 });
      s.say(0, 'Before stopping or turning, make sure it’s safe, then signal by hand and arm or with your turn signals.')
        .say(1.4, 'Left turn: left arm straight out the window.')
        .say(4.8, 'Right turn: left arm out and bent upward.')
        .say(8, 'Stop or slow down: left arm out and bent downward.')
        .say(11.2, 'An electric turn signal works too. Bicyclists may also signal a right turn with the right arm straight out.');
    },
  });
})();
