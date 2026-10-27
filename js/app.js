/* Driving Law — player UI: section list, playback controls, captions, statute panel. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = DL.esc;

  const parseSec = s => { const m = /^(\d+)([a-z]*)$/.exec(s); return [Number(m[1]), m[2]]; };
  const list = LAW.list.slice().sort((a, b) => {
    const [an, as] = parseSec(a.sec), [bn, bs] = parseSec(b.sec);
    return an - bn || as.localeCompare(bs);
  });

  const PEN = {
    civil: 'Civil infraction', misd: 'Misdemeanor', felony: 'Felony', mixed: 'Misdemeanor or felony', none: 'No separate penalty',
  };

  const st = { i: 0, scene: null, t: 0, playing: false, speed: 1, last: performance.now(), cap: null, wait: null, mode: 'diagram' };
  // Drawing style is a per-viewer preference; storage can be unavailable, so it's only a convenience.
  try { if (localStorage.getItem('dl-view') === 'art') st.mode = 'art'; } catch (e) { /* default stays */ }

  /* ---------- Section list ---------- */
  function buildNav(filter = '') {
    const box = $('navList');
    box.innerHTML = '';
    const q = filter.trim().toLowerCase();
    let group = null, groupEl = null, any = false;
    list.forEach((d, i) => {
      const hay = `257.${d.sec} ${d.sec} ${d.title} ${(d.rule || []).join(' ')} ${LAW.divName(d.div)}`.toLowerCase();
      if (q && !hay.includes(q)) return;
      any = true;
      if (d.div !== group) {
        group = d.div;
        groupEl = document.createElement('div');
        groupEl.className = 'nav-group';
        groupEl.innerHTML = `<h3>${esc(LAW.divName(d.div))}</h3>`;
        box.appendChild(groupEl);
      }
      const b = document.createElement('button');
      b.className = 'nav-item' + (i === st.i ? ' active' : '');
      b.dataset.i = i;
      b.innerHTML = `<span class="n">257.${esc(d.sec)}</span><span class="t">${esc(d.title)}</span>`;
      b.addEventListener('click', () => { load(i, true); document.body.classList.remove('nav-open'); });
      groupEl.appendChild(b);
    });
    if (!any) box.innerHTML = `<p style="padding:12px 10px;color:var(--ink-3)">No sections match “${esc(filter)}”.</p>`;
  }
  function markActive() {
    document.querySelectorAll('.nav-item').forEach(b => {
      const on = Number(b.dataset.i) === st.i;
      b.classList.toggle('active', on);
      if (on) b.scrollIntoView({ block: 'nearest' });
    });
  }

  /* ---------- Loading a section ---------- */
  const fmt = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  function load(i, autoplay) {
    st.i = (i + list.length) % list.length;
    const d = list[st.i];
    clearTimeout(st.wait);
    try {
      st.scene = new DL.Scene($('stage'), d, { mode: st.mode });
    } catch (e) {
      console.error('Scene failed for 257.' + d.sec, e);
      $('stage').innerHTML = `<text x="800" y="450" text-anchor="middle" font-size="32" fill="#fff">This animation failed to load.</text>`;
      st.scene = null;
    }
    st.t = 0; st.cap = undefined;
    $('scrub').max = st.scene ? st.scene.dur : 1;
    $('secBadge').textContent = 'MCL 257.' + d.sec;
    $('secTitle').textContent = d.title;
    $('divName').textContent = LAW.divName(d.div);
    const pen = $('penalty');
    pen.className = 'chip ' + (d.penalty || 'none');
    pen.textContent = d.penaltyText || PEN[d.penalty || 'none'];
    $('rules').innerHTML = (d.rule || []).map(r => `<li>${rich(r)}</li>`).join('');
    $('srcLink').href = `https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-257-${d.sec}`;
    document.title = `257.${d.sec} ${d.title} · Michigan Driving Law`;
    if (location.hash !== '#257.' + d.sec) history.replaceState(null, '', '#257.' + d.sec);
    buildTicks();
    buildLegend();
    markActive();
    document.body.classList.remove('started');
    render();
    setPlaying(!!autoplay);
  }

  function buildTicks() {
    const box = $('ticks');
    box.innerHTML = '';
    if (!st.scene) return;
    const dur = st.scene.dur;
    st.scene.says.forEach(c => {
      if (c.t <= 0.01) return;
      const b = document.createElement('button');
      b.className = c.kind;
      b.style.left = (c.t / dur * 100) + '%';
      b.title = c.text;
      b.setAttribute('aria-label', 'Jump to: ' + c.text);
      b.addEventListener('click', () => { st.t = c.t + 0.01; render(); });
      box.appendChild(b);
    });
  }

  function buildLegend() {
    const diagram = !!(st.scene && st.scene.diagram);
    $('diagBadge').hidden = !diagram;
    const box = $('legend');
    const items = diagram ? st.scene.legendItems() : [];
    box.hidden = !items.length;
    box.innerHTML = items.length ? `<span class="lg-title">Legend</span>` + items.map(it =>
      `<span class="lg-item"><svg viewBox="0 0 34 23" width="40" height="27" aria-hidden="true" font-family="system-ui,Segoe UI,Arial">${it.icon}</svg>${esc(it.label)}</span>`).join('') : '';
  }

  function setMode(mode) {
    if (mode === st.mode) return;
    st.mode = mode;
    try { localStorage.setItem('dl-view', mode); } catch (e) { /* not saved; still applies now */ }
    $('viewDiagram').setAttribute('aria-pressed', mode === 'diagram');
    $('viewArt').setAttribute('aria-pressed', mode === 'art');
    // Rebuild the current scene in the new style without losing the playback position.
    const t = st.t, playing = st.playing;
    load(st.i, playing);
    st.t = t; render();
    if (t > 0) document.body.classList.add('started');
  }

  /* ---------- Playback ---------- */
  function setPlaying(on) {
    st.playing = on && !!st.scene;
    if (st.playing) {
      if (st.t >= st.scene.dur - 0.01) st.t = 0;
      document.body.classList.add('started');
    }
    document.body.classList.toggle('playing', st.playing);
    $('play').setAttribute('aria-label', st.playing ? 'Pause' : 'Play');
    $('bigPlay').setAttribute('aria-label', st.playing ? 'Pause' : 'Play');
    st.last = performance.now();
  }

  function render() {
    if (!st.scene) return;
    st.scene.render(st.t);
    const c = st.scene.caption(st.t);
    if (c !== st.cap) {
      st.cap = c;
      const box = $('caption');
      box.className = 'caption ' + (c ? c.kind : '');
      box.querySelector('.cap-text').textContent = c ? c.text : '';
    }
    $('scrub').value = st.t;
    $('time').textContent = `${fmt(st.t)} / ${fmt(st.scene.dur)}`;
  }

  function frame(now) {
    const dt = Math.min(0.1, (now - st.last) / 1000);
    st.last = now;
    if (st.playing && st.scene) {
      let nt = st.t + dt * st.speed;
      if ($('stepMode').checked) {
        const next = st.scene.says.find(c => c.t > st.t + 1e-6 && c.t <= nt && c.t > 0.05);
        if (next) { nt = next.t; st.t = nt; render(); setPlaying(false); requestAnimationFrame(frame); return; }
      }
      if (nt >= st.scene.dur) {
        st.t = st.scene.dur;
        setPlaying(false);
        if ($('autoNext').checked) st.wait = setTimeout(() => load(st.i + 1, true), 1800);
      } else st.t = nt;
      render();
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Wiring ---------- */
  $('play').addEventListener('click', () => setPlaying(!st.playing));
  $('bigPlay').addEventListener('click', () => setPlaying(true));
  $('stage').addEventListener('click', () => setPlaying(!st.playing));
  $('restart').addEventListener('click', () => { st.t = 0; render(); setPlaying(true); });
  $('prevSec').addEventListener('click', () => load(st.i - 1, st.playing));
  $('nextSec').addEventListener('click', () => load(st.i + 1, st.playing));
  $('speed').addEventListener('change', e => { st.speed = Number(e.target.value); });
  $('viewDiagram').addEventListener('click', () => setMode('diagram'));
  $('viewArt').addEventListener('click', () => setMode('art'));
  $('viewDiagram').setAttribute('aria-pressed', st.mode === 'diagram');
  $('viewArt').setAttribute('aria-pressed', st.mode === 'art');
  $('scrub').addEventListener('input', e => { st.t = Number(e.target.value); setPlaying(false); document.body.classList.add('started'); render(); });
  $('search').addEventListener('input', e => { buildNav(e.target.value); markActive(); });
  $('navToggle').addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    $('navToggle').setAttribute('aria-expanded', open);
  });

  function togglePresent() {
    const on = !document.body.classList.contains('present');
    document.body.classList.toggle('present', on);
    if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }
  $('presentBtn').addEventListener('click', togglePresent);
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) document.body.classList.remove('present');
  });

  document.addEventListener('keydown', e => {
    if (e.target.matches('input[type=search], select')) return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); setPlaying(!st.playing); }
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); load(st.i + 1, true); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); load(st.i - 1, true); }
    else if (e.key === 'r' || e.key === 'R') { st.t = 0; render(); setPlaying(true); }
    else if (e.key === 'f' || e.key === 'F') togglePresent();
    else if (e.key === 'Escape') document.body.classList.remove('nav-open');
  });

  window.addEventListener('hashchange', () => {
    const want = location.hash.replace('#257.', '');
    const i = list.findIndex(d => d.sec === want);
    if (i >= 0 && i !== st.i) load(i, false);
  });

  buildNav();
  const want = location.hash.replace('#257.', '');
  const start = Math.max(0, list.findIndex(d => d.sec === want));
  load(start, false);
  requestAnimationFrame(frame);
})();
