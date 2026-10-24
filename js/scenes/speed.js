/* Speed restrictions: MCL 257.627 – 257.632 */
(function () {
  const { COL } = K;
  const F = 'font-family="system-ui,Segoe UI,Arial"';

  // Flashing beacon housing; the engine blinks barA/barB when the actor's lights are set.
  const beacon = `<rect x="-14" y="-30" width="28" height="60" rx="6" fill="#222"/>
    <circle cx="0" cy="-14" r="10" fill="#ffb000" opacity=".3" data-part="barA"/><circle cx="0" cy="14" r="10" fill="#ffb000" opacity=".3" data-part="barB"/>`;

  LAW.add({
    sec: '627', div: 'spd', title: 'Speed limits and the basic speed law',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      '**Basic speed law:** drive at a careful and prudent speed, not greater or less than is reasonable for traffic, road surface, width, and conditions, and never faster than lets you **stop within the assured, clear distance ahead**. This applies even below the posted limit.',
      'Unless posted otherwise: **15 mph** in mobile home parks; **25 mph** in business districts, public parks, and residential subdivisions; **55 mph** on trunk line and county highways, including gravel county roads.',
      'Freeways: **70 mph** maximum (75 where posted), **55 mph** minimum. Trucks of 10,000+ lbs, truck-tractors, and school buses: **65 mph** max where the limit is higher.',
      'Work zones with a lane closed: **45 mph** unless another limit is posted.',
    ],
    dur: 17,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed' });
      const L = s.lane;
      s.raw(`<defs><linearGradient id="fog" x1="0" x2="1"><stop offset="0" stop-color="#e9eef2" stop-opacity="0"/><stop offset=".25" stop-color="#e9eef2" stop-opacity=".93"/><stop offset="1" stop-color="#e9eef2" stop-opacity=".97"/></linearGradient></defs>
        <rect x="820" y="0" width="900" height="900" fill="url(#fog)"/>`, { layer: 'night', t0: 0, t1: 7.6, fade: 0.4 });
      s.sign(300, L.bot + 90, 'speed', '55');
      s.car({ kind: 'truck', color: COL.gray, at: [1260, L.E(0), 0] }).set(0, 'sig', 'H');
      const c = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(500, L.E(0), 2.2).wait(4.4).to(690, L.E(0), 6.6, 'out').wait(7.6) });
      c.mph([[0, 55], [4.4, 30]]).set(4.4, 'brake', true).set(7.6, 'show', false);
      const fr = 532, sc = 2.4;
      s.dim(2.4, 4.4, fr, L.E(0) - 70, fr + 150 * sc, L.E(0) - 70, 'You can see ≈150 ft', { color: '#ffd34d' });
      s.dim(2.8, 4.4, fr, L.E(0) + 70, fr + 265 * sc, L.E(0) + 70, 'Stopping at 55 mph ≈265 ft', { color: '#ff6b5e', ly: 34 });
      s.dim(4.6, 7.4, 722, L.E(0) + 70, 722 + 110 * sc, L.E(0) + 70, 'Stopping at 30 mph ≈110 ft', { color: '#7cf2a8', ly: 34 });
      s.text(2.4, 7.4, 1130, L.top - 40, 'Stalled truck hidden in fog', { size: 22, color: '#26313d' });
      s.raw(K.table(800, 450, [
        ['15 mph', 'Mobile home parks', '#2f6fd6'],
        ['25 mph', 'Business districts · public parks · residential subdivisions', '#2f6fd6'],
        ['45 mph', 'Work zones with a lane closed (unless posted)', '#d88a0f'],
        ['55 mph', 'Trunk line & county highways, including gravel roads', '#2f6fd6'],
        ['70 mph', 'Freeways (75 where posted) · 55 mph minimum', '#1f9d55'],
        ['65 mph', 'Max for heavy trucks & school buses on freeways', '#7d8790'],
      ], { title: 'Limits that apply unless another is posted', w: 1100, lw: 150, rh: 58, fs: 21 }), { t0: 7.8, t1: 17, fade: 0.4, layer: 'fx' });
      s.say(0, 'Posted limit: 55. But thick fog means the driver can only see about 150 feet ahead.')
        .say(2.4, 'Freeze frame: at 55 mph this car needs roughly 265 feet to stop, more than the driver can see.', 'bad')
        .say(4.5, 'The basic speed law says you must be able to stop within the assured, clear distance ahead. Slowing to 30 does that.', 'good')
        .say(7.8, 'When no other limit is posted, the law sets defaults by type of road.')
        .say(13.4, 'Driving too slowly for conditions can also violate the basic speed law, and freeways have a 55 mph minimum.');
    },
  });

  LAW.add({
    sec: '627a', div: 'spd', title: 'School zone speed limits',
    penalty: 'civil', penaltyText: 'Civil infraction (fine doubled under MCL 257.601b)',
    rule: [
      'A **school zone** is school property with a school building plus adjacent property, up to 1,000 feet from the school property line.',
      'The school zone limit may be up to **20 mph below** the normal limit but **not below 25 mph**.',
      'It applies from **30 minutes before** classes start until school begins, and from **dismissal until 30 minutes after** (the superintendent can shift these windows and add an off-campus lunch period).',
      'Doesn’t apply on limited access highways or where a pedestrian overpass serves the school. Flashing lights or digital signs may mark when it’s in effect.',
    ],
    dur: 14,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double', scenery: false });
      const L = s.lane;
      s.prop(820, 230, 'bldg', { w: 420, h: 180, c: '#a3654b', label: 'ELEMENTARY SCHOOL' });
      for (const [x, y] of [[300, 230], [1400, 250], [260, 760], [1380, 740]]) s.prop(x, y, 'tree', { s: 1.2 });
      s.prop(600, 720, 'house'); s.prop(1050, 730, 'house', { c: '#6f7f99' });
      s.zone(0, 14, { rect: [380, L.top - 6, 860, L.bot - L.top + 12] }, '#c7e830', 'SCHOOL ZONE', { ly: -100, fo: 0.12 });
      s.sign(360, L.bot + 100, 'school', 'ZONE'); s.sign(450, L.bot + 100, 'speed', '25');
      s.text(0, 14, 450, L.bot + 130, 'WHEN FLASHING', { size: 16, color: '#111' });
      s.thing({ svg: beacon, at: [520, L.bot + 64, 0] }).set(0, 'lights', 'amber').set(8.2, 'lights', null);
      const clock = (txt, col) => `<g transform="translate(1230,200)"><rect x="-130" y="-46" width="260" height="92" rx="16" fill="#18202a" stroke="${col}" stroke-width="4"/><text y="18" text-anchor="middle" font-size="46" font-weight="900" fill="${col}" font-family="ui-monospace,Consolas,monospace">${txt}</text></g>`;
      s.raw(clock('7:45 AM', '#ffd34d'), { t0: 0, t1: 8.2, layer: 'fx' });
      s.raw(clock('10:30 AM', '#7cf2a8'), { t0: 8.2, t1: 14, layer: 'fx' });
      const a = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-100, L.E(0), 0).to(330, L.E(0), 1.6).to(1300, L.E(0), 5.6).to(1760, L.E(0), 6.6) });
      a.mph([[0, 45], [1.5, 25], [5.6, 45]]);
      s.mark(2.2, 5, 0, 0, 'ok', { follow: a, dy: -70 });
      const b = s.car({ kind: 'car', color: COL.red, path: s.P(1760, L.W(0), 2.6).to(-120, L.W(0), 6.8) });
      b.mph([[0, 45]]).set(0, 'labelColor', 'bad');
      s.mark(3.8, 6.4, 0, 0, 'x', { follow: b, dy: -70 });
      const c = s.car({ kind: 'suv', color: COL.green, path: s.P(-100, L.E(0), 8.6).to(1760, L.E(0), 13.4) });
      c.mph([[0, 45]]);
      s.mark(10, 13, 0, 0, 'ok', { follow: c, dy: -70 });
      s.say(0, '7:45 AM: classes start soon, and the school zone beacons are flashing.')
        .say(1.6, 'This driver slows from 45 to the 25 mph school zone limit.', 'good')
        .say(3.6, 'This driver doesn’t, so they get a school zone speeding ticket with a doubled fine.', 'bad')
        .say(8.4, '10:30 AM: class is in session, the beacons are off, and the normal 45 mph limit applies.', 'good')
        .say(11.4, 'The reduced limit runs from 30 minutes before school starts and from dismissal until 30 minutes after.');
    },
  });

  LAW.add({
    sec: '627c', div: 'spd', title: 'Work zone speed cameras',
    penalty: 'civil', penaltyText: 'Warning, then civil fines of $150 / $300',
    rule: [
      'MDOT may use **automated speed enforcement** cameras in work zones on its roads that aren’t separated from traffic by concrete barriers, operated by a contracted vendor.',
      'A sign must be posted **1 mile** before the zone, and a display must show approaching drivers their speed. Cameras run **only while workers are present**.',
      'A violation is going **10+ mph over** the work zone limit. 1st: **written warning**. 2nd within 3 years: up to **$150**. 3rd or later: up to **$300**.',
      'Images may be used only to decide the violation and must then be destroyed. Police, fire, and ambulances on emergencies are exempt.',
    ],
    dur: 14,
    build(s) {
      s.bg('freeway');
      const L = s.lane;
      for (let x = 520; x <= 1300; x += 50) s.prop(x, L.E(0) - 30, 'barrel');
      s.zone(0, 14, { rect: [500, L.E(0) - 30, 820, 62] }, '#d88a0f', 'WORKERS PRESENT', { ly: 0 });
      s.person({ kind: 'worker', at: [720, L.E(0) + 6, 90] }); s.person({ kind: 'worker', at: [1000, L.E(0), 270] });
      s.sign(330, L.bot + 90, 'camera'); s.sign(430, L.bot + 90, 'speed', '45');
      const disp = (txt, col) => `<g transform="translate(1180,${L.bot + 110})"><rect x="-80" y="-50" width="160" height="100" rx="10" fill="#111" stroke="#666" stroke-width="3"/>
        <text y="-18" text-anchor="middle" font-size="16" font-weight="800" fill="#ddd" ${F}>YOUR SPEED</text>
        <text y="34" text-anchor="middle" font-size="48" font-weight="900" fill="${col}" font-family="ui-monospace,Consolas,monospace">${txt}</text></g>`;
      s.raw(disp('--', '#888'), { t0: 0, t1: 1.8, layer: 'fx' });
      s.raw(disp('67', '#ff5a4f'), { t0: 1.8, t1: 4.6, layer: 'fx' });
      s.raw(disp('44', '#7cf2a8'), { t0: 7.2, t1: 10, layer: 'fx' });
      s.raw(disp('--', '#888'), { t0: 4.6, t1: 7.2, layer: 'fx' });
      s.raw(disp('--', '#888'), { t0: 10, layer: 'fx' });
      s.raw(`<circle cx="1180" cy="${L.bot + 30}" r="70" fill="#fff" opacity=".85"/>`, { t0: 3.0, t1: 3.25, layer: 'fx' });
      const a = s.car({ kind: 'car', color: COL.red, path: s.P(-120, L.E(1), 0.6).to(1760, L.E(1), 5) });
      a.mph([[0, 67]]).set(0, 'labelColor', 'bad');
      const b = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(-120, L.E(1), 6.4).to(1760, L.E(1), 11.6) });
      b.mph([[0, 44]]);
      s.raw(K.ticket(800, 250, ['1st: written warning', '2nd within 3 yrs: up to $150', '3rd or later: up to $300'], { title: 'WORK ZONE SPEED CAMERA', w: 460 }), { t0: 11.6, layer: 'fx', fade: 0.4 });
      s.say(0, 'A freeway work zone with workers present. A sign warned of a speed camera a mile back.')
        .say(1.8, 'The roadside display shows this driver at 67 in a 45, more than 10 over.', 'bad')
        .say(3, 'The camera records the violation.', 'bad')
        .say(7.2, 'At or near the limit, no violation.', 'good')
        .say(11.6, 'A first camera violation brings a warning. Repeat violations within 3 years bring fines.', 'warn');
    },
  });

  LAW.add({
    sec: '631', div: 'spd', title: 'Posted bridge speed and weight limits',
    penalty: 'civil', penaltyText: 'Civil infraction · per-pound fines',
    rule: [
      'The road agency may study a bridge, causeway, or viaduct and post the **maximum speed and load** it can safely carry, with signs within 50 feet of each end and far enough back for drivers to take another route.',
      'Driving faster, or with a heavier load, than posted is a civil infraction.',
      'Overweight fines run **4¢ to 10¢ per pound** over (for excess above 2,500 lbs). Farm implements and essential farm trips with no other access are exempt from the weight rule.',
    ],
    dur: 12,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      s.raw(`<path d="M 760 0 C 820 200 700 300 760 ${L.top - 26} L 1000 ${L.top - 26} C 960 300 1080 200 1020 0 Z" fill="#4a90c2"/>
        <path d="M 760 ${L.bot + 26} C 700 600 840 700 780 900 L 1040 900 C 1100 700 960 600 1000 ${L.bot + 26} Z" fill="#4a90c2"/>
        <rect x="740" y="${L.top - 30}" width="280" height="8" fill="#9aa1a8"/><rect x="740" y="${L.bot + 22}" width="280" height="8" fill="#9aa1a8"/>`, { layer: 'bg' });
      s.sign(560, L.bot + 100, 'bridge', '25 MPH|10 TONS');
      s.sign(1220, L.top - 60, 'bridge', '25 MPH|10 TONS');
      const t = s.car({ kind: 'dump', color: '#d88a0f', label: '18 tons', path: s.P(-140, L.E(0), 0).to(1760, L.E(0), 6) });
      t.set(0, 'labelColor', 'bad');
      s.mark(2.6, 5.2, 880, L.E(0) + 110, 'x');
      const c = s.car({ kind: 'car', color: COL.you, hi: true, path: s.P(1760, L.W(0), 5.6).to(1100, L.W(0), 7.2).to(700, L.W(0), 9.4).to(-120, L.W(0), 11) });
      c.mph([[0, 40], [7.1, 25], [9.5, 40]]);
      s.mark(7.6, 9.6, 0, 0, 'ok', { follow: c, dy: -70 });
      s.say(0, 'An old bridge is posted for 25 mph and 10 tons.')
        .say(1.6, 'An 18-ton dump truck crosses anyway.', 'bad')
        .say(3.6, 'Overweight on a posted bridge: civil infraction, with fines of 4 to 10 cents per pound over.', 'warn')
        .say(6.8, 'This driver slows to the posted 25 mph for the bridge.', 'good')
        .say(9.6, 'Signs go within 50 feet of each end, and far enough back that heavy vehicles can take another route.');
    },
  });

  LAW.add({
    sec: '632', div: 'spd', title: 'Emergency vehicles exempt from speed limits',
    penalty: 'none', penaltyText: 'Exemption, not an offense',
    rule: [
      'Speed limits don’t apply to **police** vehicles in emergencies or chasing or catching suspects, **fire** vehicles responding to a fire alarm, or **ambulances** in emergencies, if driven with due regard for safety.',
      'The vehicle must be sounding a siren, bell, or whistle as reasonably necessary, **or** showing a flashing, oscillating, or rotating red or blue light visible 500 feet ahead.',
      'Police may travel without warning signals when the mission requires not alerting suspects.',
      'The exemption never protects a driver from the consequences of **reckless disregard** for others’ safety.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 2, vy: 500 });
      const L = s.lane;
      s.sign(300, L.bot + 90, 'speed', '45');
      const f = s.car({ kind: 'fire', path: s.P(-200, L.E(1), 0.4).to(1800, L.E(1), 4.4) });
      f.set(0, 'lights', 'fire').set(0, 'waves', 'siren').mph([[0, 70]]).set(0, 'labelColor', 'good');
      const c1 = s.car({ kind: 'car', color: COL.gray, path: s.P(400, L.E(0), 0).to(700, L.E(0), 1.6).to(820, L.E(0), 3, 'out').wait(4.4).to(1760, L.E(0), 8, 'in') });
      c1.set(1.6, 'brake', true).set(4.4, 'brake', false);
      const u = s.car({ kind: 'car', color: '#3a3f46', label: 'Unmarked police · no lights', path: s.P(-200, L.E(1), 5.6).to(1800, L.E(1), 9.6) });
      u.set(0, 'labelColor', 'good');
      s.say(0, 'A fire truck responding to an alarm, siren and lights on, does 70 in a 45.', 'good')
        .say(1.8, 'With a siren or flashing red/blue lights and due regard for safety, the speed limit doesn’t apply.', 'good')
        .say(5.8, 'Police may speed without lights or siren when warning suspects would defeat the mission.', 'good')
        .say(8.4, 'But the exemption never excuses reckless disregard for others’ safety.', 'warn');
    },
  });
})();
