# Driving Law

An interactive animation of Michigan Vehicle Code Chapter VI (MCL 257.601–257.750), section by section, made for a criminal justice professor to use in class.

## Audience and use

- Shown in a classroom, likely projected and driven by the professor, so text must be readable from the back of a room.
- Students are learning criminal justice, not law school: explain legal concepts plainly and cite the statute or case when one applies.
- Legal content must be accurate. When a rule varies by jurisdiction, say which jurisdiction a scenario uses rather than presenting it as universal.

## Scope

- Only sections that govern operating a motor vehicle and can be shown visually are included (the user's instruction). Repealed, administrative, procedural, and bicycle- or pedestrian-only sections are omitted.
- Write each section's `rule` bullets and captions from the statute text itself (legislature.mi.gov, `Laws/MCL?objectName=mcl-257-<sec>`), not from memory. When a section states no penalty, the code's general penalty applies: MCL 257.901 makes it a misdemeanor; equipment sections 683–711 are civil infractions under 257.683(6); sections 656–661a are civil infractions under 257.656.

## Tech

- Plain static site: no build, no dependencies, must work opened from disk on a classroom computer. Don't introduce modules, fetch, or CDNs.
- The instructor uses `Michigan-Driving-Law.html`, a single-file build (an earlier copy failed when `index.html` was opened without its `css/` and `js/` folders). Run `python tools/build_standalone.py` after every change to the site and commit the regenerated file with it.
- Scenes are deterministic functions of time (`Scene.render(t)`), so scrubbing and pausing work everywhere. Never use wall-clock timers inside a scene.
- World coordinates are 1600×900. One lane is 64 px (12 ft); `DL.FT` is pixels per foot in top-down views. Map backgrounds default to a slightly zoomed view (`zoom` option) — keep overlays inside it.
- Check visual changes with `dev/sheet.html?s=<sections>` before committing. Bump the `?v=` query on asset URLs in `index.html` when shipping changes so classroom browsers don't use stale caches.
