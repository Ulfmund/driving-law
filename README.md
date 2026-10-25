# Michigan Driving Law

Animated, classroom-ready walkthrough of the Michigan Vehicle Code, Chapter VI ("Obedience to and Effect of Traffic Laws," MCL 257.601–257.750). Each section gets a short top-down (or side-view) animation with narrated captions, a plain-language summary, the penalty class, and a link to the statute on legislature.mi.gov.

Built for a criminal justice course: projected in front of the class and driven by the instructor.

## Using it

**For the classroom, use `Michigan-Driving-Law.html`.** It's the whole thing in one file: copy it to a USB drive, email it, or download it on its own, then double-click it. No install or internet connection is needed (the statute links are the only external links).

`index.html` also works, but only alongside its `css/` and `js/` folders. Opened by itself (for example straight from inside a ZIP without extracting it first), it shows a blank page and “Failed to load resource” errors.

To work on the code, serve the folder with any static server, for example:

```bash
python -m http.server 8765
```

Controls:

- **Space**: play or pause. **R**: restart. **← / →** (or a presentation clicker's Page Up / Page Down): previous or next section. **F**: presentation mode (full screen, list hidden).
- Click a dot above the timeline to jump to that step of the narration.
- **Pause at steps** stops at each new caption so the class can discuss it. **Auto-advance** plays straight through the chapter.
- Link to a specific section with a hash, for example `index.html#257.682`.

## What's covered

114 sections, from 257.601b to 257.725. Per the scope set for this project, sections that can't easily be shown visually or don't govern operating a motor vehicle are left out: repealed sections, funds, reports, studies, local-authority powers, sign-placement rules, citation and court procedure, technical lamp specifications, and bicycle-only or pedestrian-only rules.

Summaries were written from the statute text published on legislature.mi.gov in October 2026. They are teaching aids, not legal advice. Check the linked statute before relying on a detail.

## Project layout

- `index.html`, `css/app.css`, `js/app.js`: the player (section list, playback, captions, statute panel).
- `js/engine.js`: the scene engine. Roads, intersections, and other backgrounds; vehicles and people that follow timed paths; signals, gates, signs, callouts, measurements, and night lighting.
- `js/kit.js`: the section registry (`LAW.add`) plus shared drawings (side views, car interiors, tables, checklists).
- `js/scenes/*.js`: one file per group of sections. Each `LAW.add({...})` holds the section number, title, penalty, plain-language rules, and a `build(s)` function that scripts its animation.
- `Michigan-Driving-Law.html`: the single-file build. Regenerate it after any change with `python tools/build_standalone.py`.
- `dev/sheet.html`: a contact sheet for checking scenes. `dev/sheet.html?s=682,683` renders each caption moment of those sections; `dev/sheet.html?t=0.5` renders every section at the halfway point.
