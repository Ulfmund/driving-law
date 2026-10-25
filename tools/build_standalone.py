"""Build Michigan-Driving-Law.html: the whole site in one file.

The normal site is index.html plus css/ and js/ folders. Opened on its own (straight
from inside a ZIP, or emailed by itself) it can't find those folders and shows nothing.
This inlines the stylesheet and every script so the single file works anywhere.

Run from the repo root:  python tools/build_standalone.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "Michigan-Driving-Law.html"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def main():
    html = read("index.html")

    def css(m):
        return "<style>\n" + read(m.group(1)) + "\n</style>"

    def js(m):
        code = read(m.group(1))
        if "</script" in code.lower():
            raise SystemExit(f"{m.group(1)} contains '</script', which would end the inline script early")
        return "<script>\n" + code + "\n</script>"

    html, n_css = re.subn(r'<link rel="stylesheet" href="([^"?]+)(?:\?[^"]*)?">', css, html)
    html, n_js = re.subn(r'<script src="([^"?]+)(?:\?[^"]*)?"></script>', js, html)
    if n_css != 1 or n_js < 3:
        raise SystemExit(f"Unexpected index.html structure: {n_css} stylesheet(s), {n_js} script(s)")
    leftover = re.findall(r'(?:src|href)="(?!https?:|#|mailto:)[^"]+"', html)
    if leftover:
        raise SystemExit(f"Local references left after inlining: {leftover}")

    OUT.write_text(html, encoding="utf-8", newline="\n")
    print(f"Wrote {OUT.name}: {n_js} scripts and {n_css} stylesheet inlined, {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
