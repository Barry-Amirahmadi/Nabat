# نبات / NABAT

A Persian confectionery demo — nine sweets, three groups, one box. RTL-first,
static-exported, and deliberately loud: every band on the page sits on a
geometric ground drawn in SVG, not on a photograph.

**Live:** https://barry-amirahmadi.github.io/nabat/

## Why it looks like this

Density from **geometry**, not from pictures. Four tileable patterns — star
tile, carpet border, sugar dots, pointed arches — take a hue token and a scale,
which is seventy-two grounds from one small component. That is why the whole
site needs **eight image files** rather than fifty, and why three of the nine
items carry no photograph at all: their tile is pattern and type.

Six committed hues, every pair measured. Three typefaces: `Lalezar` and
`Rakkas` for display, `Vazirmatn` for anything that is read.

## Running it

```bash
npm ci
npm run dev              # localhost:3210
npm run build:pages      # static export at the deployed base path
npm run preview:pages    # serve out/ the way GitHub Pages does
```

## Checking it

```bash
npm run typecheck
npm run lint
npm run build:pages && npm run verify     # the measured pass — see below
npm run test:smoke                        # regression baseline
```

`npm run verify` walks every route at three widths and prints a table: HTTP
status, console errors, `scrollWidth` vs `clientWidth`, the worst contrast
ratio on the page *and* which element it was, computed grid placement against
each cell's declared position, the rotated bounding box of every rotated
element, focus-ring contrast on every ground, pattern-layer accessibility,
per-route HTML and image weight, reduced-motion behaviour, and per-character
glyph coverage of all three faces. It exits non-zero on any finding.

Nothing in this repository is judged by looking at it. Run the script.

## Content

Everything editable lives in `src/content/`, typed against
`src/types/content.ts` — a missing field fails `typecheck` rather than
rendering blank. `sections.ts` is the copy deck; `ui.ts` is interface strings,
including accessible names.

Images are generated placeholders (`npm run media`). Swapping in real
photographs is one string: `PHOTO_EXT` in `src/content/media.ts`.

## What this is not

Placeholder brand, unassigned phone number, `.example` handles. No commerce, no
price, no cart, no form — ordering is a phone call or a WhatsApp message,
which is all a static host can honestly offer. Nothing on the site states an
allergen, a diet, a nutrition figure, a certification, an award or a shelf
life, and no number on it measures anything real. `robots.txt` disallows
everything and the pages carry `noindex`.

Engine notes, and the reasoning behind the static-export and base-path
handling: `docs/MASTER-HANDOFF.md` — §54 is this site.
