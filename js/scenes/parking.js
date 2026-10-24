/* Stopping, standing, and parking: MCL 257.672 – 257.675 */
(function () {
  const { COL } = K;
  const FT = DL.FT;

  LAW.add({
    sec: '672', div: 'park', title: 'Don’t stop in the travel lane',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      '**Outside city and village limits**, don’t stop, park, or leave a vehicle (attended or not) on the paved or main traveled part of a highway when it’s possible to stop off of it.',
      'On a **limited access highway** (freeway), inside or outside a city, don’t stop, park, or leave a vehicle on the paved **or unpaved** part, except in an **emergency or mechanical breakdown**.',
      'Also applies to school buses stopping under the Pupil Transportation Act.',
    ],
    dur: 11,
    build(s) {
      s.bg('road', { lanes: 1, center: 'dashed', shoulder: 44 });
      const L = s.lane;
      s.prop(1300, 240, 'tree', { s: 1.3 });
      const c = s.car({ kind: 'suv', color: COL.red, label: 'Stopped in the lane', path: s.P(-100, L.E(0), 0).to(820, L.E(0), 2.2, 'out').wait(6) });
      c.set(0, 'labelColor', 'bad').set(2.2, 'brake', true).set(5.6, 'show', false);
      const o = s.car({ kind: 'car', color: COL.gold, path: s.P(-100, L.E(0), 1.6).to(640, L.E(0), 3.4, 'out').wait(4).curve(720, L.E(0), 760, L.W(0), 4.6).to(900, L.W(0), 5).curve(960, L.W(0), 1000, L.E(0), 5.4).to(1760, L.E(0), 6.4) });
      o.set(3.2, 'brake', true).set(4, 'brake', false).set(4, 'sig', 'L');
      s.mark(2.6, 5.4, 820, L.top - 90, 'x');
      const g = s.car({ kind: 'suv', color: COL.you, hi: true, from: 6, path: s.P(-100, L.E(0), 6).to(600, L.E(0), 7.6).curve(700, L.E(0), 760, L.bot + 26, 8.2, 'out').to(820, L.bot + 26, 8.6, 'out').wait(11) });
      g.set(7.2, 'sig', 'R').set(8.6, 'sig', 'H');
      s.car({ kind: 'car', color: COL.teal, path: s.P(-100, L.E(0), 8.4).to(1760, L.E(0), 10.8) });
      s.mark(9, 11, 820, L.bot + 120, 'ok');
      s.say(0, 'On a rural highway, a driver stops right in the travel lane to look at something.', 'bad')
        .say(3.2, 'Traffic has to stop or swing into the oncoming lane to get by.', 'bad')
        .say(6.2, 'Outside cities and villages, if you can pull completely off the pavement, you must.', 'good')
        .say(8.8, 'On freeways, don’t stop anywhere, paved or unpaved, except for an emergency or breakdown.');
    },
  });

  LAW.add({
    sec: '674', div: 'park', title: 'Places you may not park',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'Among the places parking is prohibited (unless needed to avoid traffic, or directed by police or a sign): on a **sidewalk**; in front of a **driveway**; within an **intersection**; within **15 feet of a fire hydrant**; on a **crosswalk** or within **20 feet** of one; within **30 feet** of a stop sign, flashing beacon, or traffic signal at the roadside; within **50 feet** of a railroad crossing.',
      'Also: on the roadway side of a parked vehicle (**double parking**); on a bridge or in a tunnel; within 20 feet of a fire station driveway; blocking emergency exits, fire escapes, alleys, fire lanes, or rural mailboxes; at expired meters; or where signs prohibit it.',
      'Don’t park in a space reserved for people with **disabilities** (or its access aisle, or blocking a curb ramp) without a disability placard or plate, unless parking for the benefit of a person with a disability.',
      'Outside cities and villages: not within 500 feet of a crash or fire where police or fire apparatus are in attendance.',
    ],
    dur: 14,
    build(s) {
      s.bg('road', { lanes: 1, curb: true, parking: true, city: true, center: 'double', zoom: 1300 });
      const L = s.lane;
      let z = '';
      for (let y = L.curbW; y < L.curbE; y += 16) z += `<rect x="1300" y="${y + 3}" width="40" height="9" fill="#f3f3f0"/>`;
      s.raw(z);
      s.raw(`<rect x="660" y="${L.curbE}" width="80" height="54" fill="#bdb8ae"/><rect x="560" y="${L.curbW - 46}" width="78" height="46" fill="#2a6bd8" opacity=".85"/>
        <text x="599" y="${L.curbW - 14}" text-anchor="middle" font-size="26" fill="#fff">♿</text>`);
      s.sign(1380, L.curbE + 60, 'stop');
      s.prop(420, L.curbE + 14, 'hydrant', { layer: 'labels' });
      s.car({ kind: 'car', color: COL.gold, at: [470, L.parkE, 0] });
      s.note(1, 14, 470, L.parkE, 'Within 15 ft of a hydrant', 'bad', { dx: -120, dy: 140 });
      s.car({ kind: 'suv', color: COL.gray, at: [700, L.parkE, 0] });
      s.note(3, 14, 700, L.parkE, 'Blocking a driveway', 'bad', { dx: 60, dy: 210 });
      s.car({ kind: 'car', color: COL.teal, at: [1240, L.parkE, 0] });
      s.note(5, 14, 1240, L.parkE, 'Within 20 ft of a crosswalk', 'bad', { dx: -60, dy: 140 });
      s.car({ kind: 'car', color: COL.purple, at: [600, L.parkW, 180] });
      s.note(7, 14, 600, L.parkW, 'Disabled space, no placard', 'bad', { dx: 0, dy: -150 });
      const dbl = s.car({ kind: 'van', color: COL.white, path: s.P(-100, L.E(0), 8).to(940, L.E(0), 9.4, 'out').wait(14) });
      dbl.set(9.4, 'sig', 'H');
      s.car({ kind: 'car', color: COL.red, at: [940, L.parkE, 0] });
      s.note(9.6, 14, 940, L.E(0), 'Double parked', 'bad', { dx: 0, dy: -150 });
      s.car({ kind: 'car', color: COL.you, hi: true, at: [1060, L.parkW, 180] });
      s.mark(11.6, 14, 1060, L.parkW - 70, 'ok');
      s.say(0, 'A city block, and a lot of places you can’t park.')
        .say(1, 'Within 15 feet of a fire hydrant.', 'bad')
        .say(3, 'In front of a driveway.', 'bad')
        .say(5, 'On a crosswalk or within 20 feet of one, or within 30 feet of a stop sign or signal.', 'bad')
        .say(7, 'In a space reserved for people with disabilities, without a placard or special plate.', 'bad')
        .say(9.4, 'Double parking: stopping on the roadway side of a parked car.', 'bad')
        .say(11.6, 'This car is legally parked: away from hydrants, driveways, crosswalks, and signs.', 'good');
    },
  });

  LAW.add({
    sec: '675', div: 'park', title: 'Parallel parking within 12 inches of the curb',
    penalty: 'civil', penaltyText: 'Civil infraction',
    rule: [
      'A vehicle stopped or parked on a street must have its wheels **parallel to the roadway** and **within 12 inches** of the right-hand curb.',
      'Local ordinances may allow parking against the left curb on one-way streets, or angle parking (angle parking on state trunk lines needs MDOT approval).',
      'Don’t stop, stand, or park in violation of official signs. This section also governs disability windshield placards. Lying or committing fraud to get or use one is a misdemeanor.',
    ],
    dur: 10,
    build(s) {
      s.bg('road', { lanes: 1, curb: true, parking: true, center: 'double', scenery: false });
      const L = s.lane;
      s.view([[0, 800, L.curbE - 40, 900]]);
      for (const x of [380, 1280]) s.car({ kind: 'car', color: COL.gray, at: [x, L.parkE, 0] });
      const far = L.curbE - 15 - 30 * FT / 12;
      const a = s.car({ kind: 'car', color: COL.red, path: s.P(-100, L.E(0), 0).to(720, L.E(0), 1.6, 'out').curve(680, L.E(0), 640, (L.E(0) + far) / 2, 2.1, 'lin', true).curve(600, far, 560, far, 2.7, 'out', true).wait(5) });
      a.set(1.2, 'sig', 'R').set(2.6, 'sig', null).set(5, 'show', false);
      s.dim(2.8, 5, 560, L.curbE, 560, far + 15, '30 in', { color: '#d63a2f', lx: 60, ly: 0, bg: '#d63a2f' });
      s.mark(3, 5, 560, far - 90, 'x');
      const near = L.curbE - 15 - 8 * FT / 12;
      const b = s.car({ kind: 'car', color: COL.you, hi: true, from: 5.2, path: s.P(-100, L.E(0), 5.2).to(720, L.E(0), 6.8, 'out').curve(680, L.E(0), 640, (L.E(0) + near) / 2, 7.3, 'lin', true).curve(600, near, 560, near, 7.9, 'out', true).wait(10) });
      b.set(6.4, 'sig', 'R').set(7.8, 'sig', null);
      s.dim(8, 10, 560, L.curbE, 560, near + 15, '8 in', { color: '#1f9d55', lx: 60, ly: 0, bg: '#1f9d55' });
      s.mark(8.2, 10, 560, near - 90, 'ok');
      s.say(0, 'Parallel parking: wheels parallel to the road and within 12 inches of the curb.')
        .say(2.8, 'This car ends up about 30 inches out, too far from the curb.', 'bad')
        .say(7.9, 'This one is about 8 inches from the curb. Legal.', 'good');
    },
  });
})();
