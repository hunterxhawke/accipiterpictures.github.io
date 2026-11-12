#!/usr/bin/env python3
"""Render credits/credits.json into credits/index.html.

Usage (from the repo root):  python3 scripts/build-credits.py

Rewrites only the parts between the <!-- BUILD:name --> ... <!-- /BUILD:name -->
markers in credits/index.html (stats, featured posters, the full list), so the
rest of the page can be edited by hand. Pre-rendered so the list is in the HTML
for search engines and works without JavaScript.
"""
import json, re, sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "credits" / "credits.json"
PAGE = ROOT / "credits" / "index.html"
MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
# filter group for each type (matches the chips on the page)
GROUP = {"Feature": "feature", "Short": "short", "Pilot": "tv", "Series": "tv", "Commercial": "commercial"}


def e(s):
    return escape(s or "", quote=True)


def stats(cs):
    n = lambda t: sum(1 for c in cs if c.get("type") == t)
    items = [(len(cs), "Credits"), (n("Feature"), "Features"), (n("Short"), "Shorts")]
    return "\n".join(f'        <li><b class="display">{v}</b><span class="caps">{l}</span></li>' for v, l in items)


def featured(cs):
    out = []
    for c in cs:
        if not c.get("featured") or not c.get("poster"):
            continue
        year = c["date"][:4] if c.get("date") else ""
        out.append(
            f'          <figure class="poster"><div class="art"><img src="../assets/posters/{e(c["poster"])}" '
            f'alt="Poster for {e(c["title"])}" width="700" height="1050" loading="lazy"></div>'
            f'<figcaption><span class="t">{e(c["title"])}</span><span class="meta rule-top">'
            f'<span class="caps">{e(c["role"])}</span><span class="year">{year}</span></span></figcaption></figure>'
        )
    return "\n".join(out)


def row(c):
    m = (c.get("date") or "")[5:7]
    month = MONTHS[int(m) - 1] if m else ""
    who = []
    if c.get("director"):
        who.append(f'Dir. {e(c["director"])}')
    if c.get("company"):
        who.append(e(c["company"]))
    sub = " · ".join(who)
    loc = f'<small>{e(c["location"])}</small>' if c.get("location") else ""
    title = e(c["title"])
    if c.get("link"):
        title = f'<a href="{e(c["link"])}" target="_blank" rel="noopener">{title}<span class="ext" aria-hidden="true"> ↗</span></a>'
    return (
        f'            <li data-type="{GROUP.get(c.get("type"), "other")}">'
        f'<span class="cr-mo caps">{month}</span>'
        f'<span class="cr-t">{title}<small class="caps">{e(c.get("type"))}</small></span>'
        f'<span class="cr-role">{e(c["role"])}</span>'
        f'<span class="cr-who">{sub}{loc}</span></li>'
    )


def full_list(cs):
    years = {}
    for c in cs:
        years.setdefault((c.get("date") or "0000")[:4], []).append(c)
    out = []
    for y in sorted(years, reverse=True):
        items = sorted(years[y], key=lambda c: c.get("date") or "", reverse=True)
        out.append(
            f'        <section class="kit-group cr-year">\n'
            f'          <h2 class="caps"><span>{y}</span><span class="n">{len(items)}</span></h2>\n'
            f'          <ul>\n' + "\n".join(row(c) for c in items) + "\n          </ul>\n        </section>"
        )
    return "\n".join(out)


def put(html, name, body):
    pat = re.compile(rf"([ \t]*)(<!-- BUILD:{name} -->).*?(<!-- /BUILD:{name} -->)", re.S)
    if not pat.search(html):
        sys.exit(f"marker BUILD:{name} not found in {PAGE}")
    return pat.sub(lambda m: f"{m.group(1)}{m.group(2)}\n{body}\n{m.group(1)}{m.group(3)}", html, count=1)


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    cs = [c for c in data["credits"] if not c.get("hidden")]
    for c in cs:
        for f in ("title", "type", "role", "date"):
            if not c.get(f):
                sys.exit(f"credit {c.get('title', '?')!r} is missing {f}")
    html = PAGE.read_text(encoding="utf-8")
    html = put(html, "stats", stats(cs))
    html = put(html, "featured", featured(cs))
    html = put(html, "list", full_list(cs))
    PAGE.write_text(html, encoding="utf-8")
    hidden = [c["title"] for c in data["credits"] if c.get("hidden")]
    print(f"{len(cs)} credits rendered" + (f"; hidden: {', '.join(hidden)}" if hidden else ""))


if __name__ == "__main__":
    main()
