/* Driving while intoxicated and reckless driving: MCL 257.625 – 257.626b */
(function () {
  const { COL } = K;
  const F = 'font-family="system-ui,Segoe UI,Arial"';

  // A BAC scale from 0.00 to 0.20 with labeled thresholds and a needle.
  function bacScale(x, y, w, marks, needle, label) {
    const px = v => x + (v / 0.2) * w;
    let out = `<rect x="${x - 20}" y="${y - 80}" width="${w + 40}" height="200" rx="18" fill="#18202a" stroke="rgba(255,255,255,.2)" stroke-width="2"/>
      <rect x="${x}" y="${y}" width="${w}" height="26" rx="13" fill="#2b3440"/>`;
    for (const m of marks) {
      out += `<rect x="${px(m.v) - 2}" y="${y - 14}" width="4" height="54" fill="${m.c}"/>
        <text x="${px(m.v)}" y="${y + 68}" text-anchor="middle" font-size="20" font-weight="800" fill="${m.c}" ${F}>${m.v.toFixed(2)}</text>
        <text x="${px(m.v)}" y="${y + 92}" text-anchor="middle" font-size="16" font-weight="600" fill="#cfd8e3" ${F}>${m.t}</text>`;
    }
    if (needle != null) out += `<polygon points="${px(needle) - 14},${y - 44} ${px(needle) + 14},${y - 44} ${px(needle)},${y - 10}" fill="#fff"/>
      <text x="${px(needle)}" y="${y - 52}" text-anchor="middle" font-size="24" font-weight="900" fill="#fff" ${F}>${label || needle.toFixed(2)}</text>`;
    return out;
  }

  LAW.add({
    sec: '625', div: 'owi', title: 'Operating while intoxicated (OWI)',
    penalty: 'mixed', penaltyText: 'Misdemeanor · felony for 3rd offense, serious injury, or death',
    rule: [
      'No one, licensed or not, may operate a vehicle on a highway or any place open to the public (including parking lots) while **under the influence** of alcohol, a controlled substance, or another intoxicating substance, or with a BAC of **0.08 or more**.',
      '**0.17 or more** is “high BAC,” with stiffer penalties. Driving while **visibly impaired** is a lesser offense.',
      'Drivers **under 21** may not drive with any bodily alcohol content (0.02 or more, or any alcohol not from a religious service).',
      'Driving with **any amount** of a Schedule 1 drug (or cocaine) in the body is prohibited.',
      'An owner or person in control may not knowingly let an intoxicated or visibly impaired person drive.',
      'Causing **serious impairment** is a felony (up to 5 years); causing **death** is a felony (up to 15 years). Driving drunk with a passenger **under 16** is a separate crime. A **third** offense is a felony.',
    ],
    dur: 18,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      s.night(0.7);
      const d = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 0).curve(100, L.E(0) - 50, 300, L.E(0) - 12, 1.6).curve(450, L.E(0) + 26, 600, L.E(0), 2.8).curve(750, L.E(0) - 44, 900, L.E(0) - 22, 4).curve(1050, L.E(0) + 6, 1150, L.E(0) + 30, 5.2).to(1250, L.bot + 12, 6, 'out').wait(18) });
      d.set(0.6, 'label', 'Weaving').set(0.6, 'labelColor', 'bad').set(5.4, 'sig', 'R').set(6, 'sig', null).set(6, 'brake', true);
      const p = s.car({ kind: 'police', path: s.P(-420, L.E(0), 2.4).to(600, L.E(0), 5.2).curve(900, L.E(0), 1050, L.bot + 12, 6.2, 'out').to(1140, L.bot + 12, 6.6, 'out').wait(18) });
      p.set(3.6, 'lights', 'police');
      const o = s.person({ kind: 'officer', path: s.P(1150, L.E(0) - 10, 7).to(1240, L.E(0) - 18, 7.8).wait(18) });
      o.set(0, 'show', false).set(7, 'show', true);
      s.raw(K.table(800, 450, [
        ['Under the influence or 0.08+', 'Up to 93 days · $100–$500 · up to 360 hrs service', '#d88a0f'],
        ['High BAC 0.17+', 'Up to 180 days · $200–$700', '#d0452f'],
        ['Visibly impaired', 'Up to 93 days · up to $300', '#7d8790'],
        ['Under 21, any alcohol', 'Up to $250 · up to 360 hrs service', '#2f6fd6'],
        ['Causes serious injury', 'Felony · up to 5 years', '#b02a20'],
        ['Causes death', 'Felony · up to 15 years', '#7a160f'],
      ], { title: 'First-offense OWI penalties (MCL 257.625)', w: 1100, lw: 330, rh: 56, fs: 20 }), { t0: 8.4, t1: 18, fade: 0.4, layer: 'fx' });
      s.say(0, 'Late at night, a car weaves across the center line.', 'bad')
        .say(3.6, 'A patrol officer sees it and signals the driver to pull over.')
        .say(6.6, 'Intoxicated means under the influence of alcohol or drugs, or a BAC of 0.08 or more.', 'warn')
        .say(8.6, 'Penalties depend on BAC, age, and harm caused. Repeat offenses raise them sharply, and a 3rd offense is a felony.', 'warn')
        .say(13.4, 'It’s also a crime to drive drunk with a child under 16 in the car, or to let an intoxicated person drive your car.', 'warn');
    },
  });

  LAW.add({
    sec: '625a', div: 'owi', title: 'Roadside breath test and arrest without a warrant',
    penalty: 'civil', penaltyText: 'Refusing a roadside PBT: civil infraction',
    rule: [
      'An officer may **arrest without a warrant** if they have reasonable cause to believe the person (a) was driving a vehicle in a crash while intoxicated, or (b) is in the **driver’s seat** of a vehicle stopped with any part **intruding into the roadway** and was driving intoxicated.',
      'With reasonable cause to believe alcohol or drugs may have affected someone’s driving (or a commercial driver had any alcohol, or a driver under 21 had any), an officer may require a **preliminary breath test (PBT)**.',
      'The officer may arrest based in whole or in part on the PBT result.',
      'Refusing a PBT is a **civil infraction**. For a commercial driver it is a misdemeanor (up to 93 days/$100) plus a 24-hour out-of-service order.',
    ],
    dur: 13,
    build(s) {
      s.bg('road', { lanes: 1, center: 'double' });
      const L = s.lane;
      s.night(0.6);
      s.car({ kind: 'car', color: COL.red, label: 'Driver in seat', at: [760, L.bot - 6, 4] }).set(0, 'head', 'low').set(0, 'sig', 'H');
      s.car({ kind: 'police', at: [620, L.bot + 4, 0] }).set(0, 'lights', 'police').set(0, 'head', 'low');
      s.zone(0.5, 4, { rect: [722, L.E(0) - 20, 80, 26] }, '#d63a2f', 'In the roadway', { ly: -60 });
      s.person({ kind: 'officer', at: [790, L.E(0) - 28, 180] });
      const pbt = (val, col) => `<g transform="translate(1190,340)"><rect x="-90" y="-150" width="180" height="300" rx="30" fill="#2a2f36" stroke="#111" stroke-width="4"/>
        <rect x="-16" y="-200" width="32" height="56" rx="8" fill="#ddd" stroke="#999" stroke-width="3"/>
        <rect x="-70" y="-110" width="140" height="80" rx="8" fill="#0c1a12"/>
        <text x="0" y="-52" text-anchor="middle" font-size="46" font-weight="900" fill="${col}" font-family="ui-monospace,Consolas,monospace">${val}</text>
        <text x="0" y="20" text-anchor="middle" font-size="22" font-weight="800" fill="#cfd8e3" ${F}>PBT</text>
        <circle cx="-35" cy="80" r="16" fill="#1f9d55"/><circle cx="35" cy="80" r="16" fill="#d63a2f"/></g>`;
      s.raw(pbt('0.00', '#7cf2a8'), { t0: 2, t1: 4.2, layer: 'fx', fade: 0.3 });
      s.raw(pbt('0.07', '#ffd34d'), { t0: 4.2, t1: 5.2, layer: 'fx' });
      s.raw(pbt('0.12', '#ff6b5e'), { t0: 5.2, t1: 13, layer: 'fx' });
      s.say(0, 'A car is stopped partly in the roadway with its driver behind the wheel.')
        .say(2, 'With reasonable cause to think alcohol or drugs affected the driving, the officer may require a roadside breath test.')
        .say(5.3, 'PBT result: 0.12. The officer can arrest based in whole or part on this result.', 'warn')
        .say(7.8, 'No warrant is needed when the person was driving in a crash, or is in the driver’s seat with the car intruding into the road.')
        .say(10.6, 'Refusing the roadside test is a civil infraction, or a misdemeanor for a commercial driver.', 'warn');
    },
  });

  LAW.add({
    sec: '625c', div: 'owi', title: 'Implied consent to chemical tests',
    penalty: 'none', penaltyText: 'Refusal: license suspended 1 year (MCL 257.625f)',
    rule: [
      'Anyone who operates a vehicle on a highway or other place open to the public is **considered to have consented** to chemical tests of blood, breath, or urine if arrested for OWI-related offenses (or for certain homicide or reckless-driving charges when the officer believes the person was intoxicated).',
      'A person with **hemophilia, diabetes,** or a condition requiring anticoagulants under a doctor’s direction is not considered to have consented to a **blood draw**.',
      'Refusing the chemical test leads to a license suspension of **1 year**, or **2 years** for a second refusal within 7 years (MCL 257.625f), and police can seek a warrant for the test.',
    ],
    dur: 12,
    build(s) {
      s.bg('blank', { fill: '#24303d' });
      s.raw(`<g transform="translate(260,330) scale(3.2)">${DL.vehicleSVG('car', COL.you, {})}</g>`, { layer: 'actors' });
      s.text(0, 12, 260, 470, 'Driving on public roads…', { size: 30 });
      s.raw(`<path d="M 430 330 L 560 330" stroke="#fff" stroke-width="8"/><polygon points="560,312 600,330 560,348" fill="#fff"/>`, { t0: 1, layer: 'fx', fade: 0.3 });
      const icon = (x, txt, sub, col) => `<g transform="translate(${x},330)"><circle r="78" fill="${col}"/><text y="10" text-anchor="middle" font-size="32" font-weight="900" fill="#fff" ${F}>${txt}</text><text y="122" text-anchor="middle" font-size="24" font-weight="700" fill="#e8edf3" ${F}>${sub}</text></g>`;
      s.raw(icon(720, 'BREATH', '', '#2f6fd6'), { t0: 1.4, layer: 'fx', fade: 0.3 });
      s.raw(icon(920, 'BLOOD', '', '#c62f25'), { t0: 1.8, layer: 'fx', fade: 0.3 });
      s.raw(icon(1120, 'URINE', '', '#d88a0f'), { t0: 2.2, layer: 'fx', fade: 0.3 });
      s.text(1.4, 12, 920, 470, '…means you’ve agreed to testing if arrested for OWI', { size: 30 });
      s.raw(`<g transform="translate(1320,700) rotate(-4)"><rect x="-230" y="-120" width="460" height="240" rx="18" fill="#fff" stroke="#2f6fd6" stroke-width="5"/>
        <rect x="-230" y="-120" width="460" height="56" rx="18" fill="#2f6fd6"/><rect x="-230" y="-82" width="460" height="18" fill="#2f6fd6"/>
        <text x="0" y="-80" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" ${F}>MICHIGAN DRIVER LICENSE</text>
        <rect x="-200" y="-40" width="120" height="140" rx="8" fill="#cfd8e3"/><circle cx="-140" cy="10" r="30" fill="#9aa7b6"/>
        <rect x="-60" y="-30" width="230" height="16" rx="8" fill="#cfd8e3"/><rect x="-60" y="0" width="190" height="16" rx="8" fill="#cfd8e3"/><rect x="-60" y="30" width="210" height="16" rx="8" fill="#cfd8e3"/></g>`, { t0: 5, layer: 'fx', fade: 0.3 });
      s.raw(`<g transform="translate(1320,710) rotate(-14)"><rect x="-250" y="-46" width="500" height="92" rx="10" fill="none" stroke="#d63a2f" stroke-width="8"/><text y="18" text-anchor="middle" font-size="46" font-weight="900" fill="#d63a2f" letter-spacing="3" ${F}>SUSPENDED 1 YR</text></g>`, { t0: 6.4, layer: 'fx', fade: 0.2 });
      s.text(5, 12, 560, 690, 'Refuse the test?', { size: 40, color: '#ffd34d' });
      s.say(0, 'Anyone who drives on a road or other place open to the public…')
        .say(1.6, '…is considered to have consented to a breath, blood, or urine test if arrested for OWI.')
        .say(5, 'Refusing the chemical test after arrest doesn’t stop the case.', 'warn')
        .say(6.4, 'License suspended 1 year (2 years for a second refusal within 7 years), and police can still seek a warrant.', 'bad')
        .say(9.6, 'People with hemophilia, diabetes, or on prescribed blood thinners are not deemed to consent to a blood draw.');
    },
  });

  LAW.add({
    sec: '625m', div: 'owi', title: 'Commercial drivers: 0.04 BAC limit',
    penalty: 'mixed', penaltyText: 'Misdemeanor · felony for 3rd offense',
    rule: [
      'A person may not operate a **commercial motor vehicle** with a BAC of **0.04 or more** (but less than 0.08, which is regular OWI).',
      'Police may arrest without a warrant after a crash, or when the driver is found in the seat of a stopped CMV intruding into the roadway.',
      '1st: misdemeanor, up to 93 days/$300. Within 7 years of 1 prior: up to 1 year/$1,000. Within 10 years of 2 or more priors: felony, 1–5 years (or probation with jail and community service).',
    ],
    dur: 12,
    build(s) {
      s.bg('freeway', { scenery: true });
      const L = s.lane;
      const t = s.car({ kind: 'semi', color: '#2b5ea8', label: 'Commercial driver', path: s.P(-260, L.E(1), 0).to(700, L.E(1), 3).curve(820, L.E(1), 900, L.E(0) + 30, 3.6).curve(960, L.E(0) + 56, 1060, L.E(0) + 56, 4.4, 'out').wait(12) });
      t.set(3.4, 'sig', 'R').set(4.2, 'sig', 'H');
      const p = s.car({ kind: 'police', path: s.P(-300, L.E(1), 1.4).to(500, L.E(1), 3.8).curve(600, L.E(1), 680, L.E(0) + 30, 4.3).curve(740, L.E(0) + 56, 800, L.E(0) + 56, 4.8, 'out').wait(12) });
      p.set(2.4, 'lights', 'police');
      s.raw(bacScale(320, 270, 960, [{ v: 0.04, t: 'CMV limit', c: '#ffb000' }, { v: 0.08, t: 'All drivers', c: '#ff6b5e' }, { v: 0.17, t: 'High BAC', c: '#ff3b30' }], 0.05, 'Driver: 0.05'), { t0: 5, layer: 'fx', fade: 0.4 });
      s.say(0, 'A semi driver is pulled over on the freeway.')
        .say(5, 'The test shows a BAC of 0.05, under the 0.08 limit that applies to everyone.')
        .say(7.2, 'But commercial drivers have a 0.04 limit, so this driver is in violation.', 'bad')
        .say(9.4, 'First offense: up to 93 days and $300. Within 10 years of 2 or more priors, it’s a felony.', 'warn');
    },
  });

  LAW.add({
    sec: '626', div: 'owi', title: 'Reckless driving',
    penalty: 'mixed', penaltyText: 'Misdemeanor · felony if it seriously injures or kills',
    rule: [
      'Driving on a highway, a **frozen public lake, stream, or pond**, or any place open to the public (including **parking lots**) in **willful or wanton disregard** for the safety of persons or property.',
      'Misdemeanor: up to 93 days and/or $500.',
      'Causing **serious impairment of a body function**: felony, up to 5 years and/or $1,000–$5,000.',
      'Causing **death**: felony, up to 15 years and/or $2,500–$10,000. The vehicle may be forfeited or immobilized.',
    ],
    dur: 13,
    build(s) {
      s.bg('road', { lanes: 2, vy: 500 });
      const L = s.lane, e0 = L.E(0), e1 = L.E(1);
      [[200, e0], [380, e1], [640, e0], [860, e1], [1100, e0]].forEach(([x, y], i) => {
        const c = s.car({ kind: i % 2 ? 'suv' : 'car', color: [COL.gray, COL.gold, COL.white, COL.teal, COL.purple][i], path: s.P(x, y, 0).to(x + 90 * 13, y, 13) });
        if (i === 2) c.set(2.2, 'brake', true).set(3, 'brake', false);
      });
      const r = s.car({
        kind: 'car', color: COL.red,
        path: s.P(-150, e0, 0).curve(-30, e0, 102, e1, 0.6).to(312, e1, 1.1).curve(400, e1, 459, e0, 1.45).to(627, e0, 1.85)
          .curve(720, e0, 774, e1, 2.2).to(921, e1, 2.55).curve(1010, e1, 1068, e0, 2.9).to(1760, e0, 4.5),
      });
      r.mph([[0, 95]]).set(0, 'labelColor', 'bad');
      s.mark(2.2, 4, 800, 380, 'x');
      s.raw(K.table(800, 300, [
        ['Reckless driving', 'Misdemeanor · up to 93 days / $500', '#d88a0f'],
        ['→ serious injury', 'Felony · up to 5 years', '#d0452f'],
        ['→ death', 'Felony · up to 15 years', '#7a160f'],
      ], { title: 'Reckless driving (MCL 257.626)', w: 1000, lw: 260 }), { t0: 5.6, t1: 13, fade: 0.4, layer: 'fx' });
      s.say(0, 'A driver at 95 mph cuts back and forth between cars in heavy traffic.', 'bad')
        .say(2.2, 'Other drivers have to brake to avoid a crash.', 'bad')
        .say(3.6, 'This is willful or wanton disregard for others’ safety: reckless driving.', 'bad')
        .say(5.8, 'A misdemeanor, or a felony if it seriously injures or kills someone.', 'warn')
        .say(9.6, 'The law covers highways, parking lots, and frozen public lakes, streams, and ponds.');
    },
  });

  LAW.add({
    sec: '626a', div: 'owi', title: 'Drag racing',
    penalty: 'misd', penaltyText: 'Misdemeanor (general penalty, MCL 257.901)',
    rule: [
      'No one may operate a vehicle on a highway or any place open to the public (including parking lots) in a **speed or acceleration contest, drag race,** or attempt to set a speed record, or **assist** someone who does.',
      'Two or more vehicles going over the speed limit, or **rapidly accelerating from a common starting point** to above the limit, is prima facie evidence of a drag race.',
      'Doesn’t apply in the Silver Lake State Park scramble area.',
    ],
    dur: 10,
    build(s) {
      s.bg('road', { lanes: 2, curb: true, city: true, vy: 500 });
      const L = s.lane;
      s.raw(`<line x1="480" y1="${L.y + 6}" x2="480" y2="${L.bot}" stroke="#f3f3f0" stroke-width="7"/>`);
      s.light(440, L.bot + 90, [[0, 'R'], [1.6, 'G']]);
      s.sign(1240, L.bot + 90, 'speed', '35');
      const a = s.car({ kind: 'car', color: COL.red, labelBelow: true, path: s.P(444, L.E(0), 0).wait(1.7).to(1800, L.E(0), 4.4, 'in') });
      const b = s.car({ kind: 'car', color: COL.gold, path: s.P(444, L.E(1), 0).wait(1.7).to(1800, L.E(1), 4.5, 'in') });
      a.mph([[0, 0], [2.4, 40], [3, 65], [3.6, 85]]).set(0, 'labelColor', 'bad');
      b.mph([[0, 0], [2.4, 38], [3, 62], [3.6, 82]]).set(0, 'labelColor', 'bad');
      s.person({ kind: 'ped', color: '#e3a72a', label: 'Starter', at: [560, L.curbE + 26, 270] });
      s.note(0.4, 1.7, 560, L.curbE + 26, 'Ready… GO!', 'warn', { dy: 100 });
      s.raw(K.checkRow(470, 230, 'Side by side from a common start', true, { w: 660 }) , { t0: 4.8, layer: 'fx', fade: 0.3 });
      s.raw(K.checkRow(470, 300, 'Rapid acceleration past the 35 mph limit', true, { w: 660 }), { t0: 5.6, layer: 'fx', fade: 0.3 });
      s.raw(K.checkRow(470, 370, '= prima facie evidence of a drag race', false, { w: 660 }), { t0: 6.4, layer: 'fx', fade: 0.3 });
      s.say(0, 'Two cars line up side by side at a red light while a friend signals the start.')
        .say(1.7, 'Green: both floor it.', 'bad')
        .say(3.2, 'Racing is illegal on any road or place open to the public, and so is helping, like the person who started them.', 'bad')
        .say(5, 'Rapid acceleration from a common start to above the speed limit is enough evidence of a drag race.', 'warn');
    },
  });

  LAW.add({
    sec: '626b', div: 'owi', title: 'Careless driving',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Operating a vehicle on a highway, frozen public lake, or other place open to the public (including parking lots) in a **careless or negligent manner** likely to endanger any person or property, but **without** the willfulness or wantonness of reckless driving.',
      'A civil infraction, not a crime.',
    ],
    dur: 12,
    build(s) {
      s.bg('road', { lanes: 2, vy: 500 });
      const L = s.lane;
      const c = s.car({ kind: 'car', color: COL.you, label: 'Distracted', path: s.P(-100, L.E(1), 0).to(500, L.E(1), 2).curve(650, L.E(1), 760, L.E(0) - 18, 2.9).curve(830, L.E(0) - 12, 900, L.E(1), 3.6).to(1760, L.E(1), 6.2) });
      c.set(0, 'labelColor', 'warn');
      const o = s.car({ kind: 'suv', color: COL.white, path: s.P(380, L.E(0), 0).to(700, L.E(0), 2.6).to(800, L.E(0), 3.4, 'out').to(1760, L.E(0), 7, 'in') });
      o.set(2.6, 'brake', true).set(3.6, 'brake', false).set(2.6, 'waves', 'horn').set(3.4, 'waves', null);
      s.raw(`<g transform="translate(800,260)">
        <rect x="-560" y="-90" width="1120" height="180" rx="18" fill="#18202a" stroke="rgba(255,255,255,.2)" stroke-width="2"/>
        <rect x="-540" y="-70" width="520" height="140" rx="12" fill="#2f6fd6"/><rect x="20" y="-70" width="520" height="140" rx="12" fill="#c62f25"/>
        <text x="-280" y="-22" text-anchor="middle" font-size="30" font-weight="900" fill="#fff" ${F}>CARELESS (626b)</text>
        <text x="-280" y="16" text-anchor="middle" font-size="22" font-weight="600" fill="#fff" ${F}>Negligent, likely to endanger</text>
        <text x="-280" y="48" text-anchor="middle" font-size="22" font-weight="800" fill="#fff" ${F}>Civil infraction</text>
        <text x="280" y="-22" text-anchor="middle" font-size="30" font-weight="900" fill="#fff" ${F}>RECKLESS (626)</text>
        <text x="280" y="16" text-anchor="middle" font-size="22" font-weight="600" fill="#fff" ${F}>Willful or wanton disregard</text>
        <text x="280" y="48" text-anchor="middle" font-size="22" font-weight="800" fill="#fff" ${F}>Misdemeanor or felony</text></g>`, { t0: 6, layer: 'fx', fade: 0.4 });
      s.say(0, 'A driver glances down at the radio and drifts toward the next lane.')
        .say(2.6, 'The other driver has to brake and honk.', 'bad')
        .say(4, 'Not deliberate, but negligent and likely to endanger others: careless driving.', 'warn')
        .say(6.2, 'The difference from reckless driving is the driver’s state of mind.');
    },
  });
})();
