/**
 * Placeholder and plate generator.
 *
 * Two different kinds of file come out of here, and the difference matters:
 *
 * **Eight photographic placeholders** — `p-01…p-06`, `v-01`, `v-02`. These are
 * temporary. Every one is a square "material study": a warm cream ground, one
 * defocused mass in the sweet's own colour, light falling from the top-right,
 * which is the RTL reading origin. They share one treatment so the page reads
 * as a single shoot rather than eight unrelated pictures, and each maps 1:1
 * onto a real photograph later — same slot name, same directory, same 1:1
 * ratio at 1024×1024. Only the extension changes, and it is spelled once, in
 * `src/content/media.ts`.
 *
 * **Three pattern plates** — `plate-baghlava`, `plate-bamieh`, `plate-sohan`.
 * These are permanent. Three of the nine items carry no photograph at all, by
 * design: their tile is geometry and type. On the page that geometry is drawn
 * live by `src/components/pattern/Pattern.tsx`, so these files are never
 * actually fetched by a browser — they exist so that every `src` in the
 * content deck resolves to a real file rather than to a 404 waiting for the
 * first component that renders it without checking `alt`. The geometry and the
 * hue of each one match what its group renders on the page.
 *
 * Nothing here draws type. Rendering Persian into a generated image needs a
 * font pipeline this project does not have, and the three runtime dependencies
 * are `next`, `react` and `react-dom` — no image library is getting added to
 * draw a square.
 *
 *   node scripts/generate-media.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "media");
mkdirSync(outDir, { recursive: true });

/** Kept in sync with src/app/tokens.css. */
const C = {
  shir: "#FFF8EC",
  shirDeep: "#F6EAD4",
  ink: "#231409",
  zafaran: "#F5A623",
  golab: "#E88FB0",
  anar: "#D6265A",
  pesteh: "#33753F",
  lajvard: "#2B3A8F",
  tala: "#C9A227",
};

/* -------------------------------------------------------------------------- */
/*  The eight photographic slots                                              */
/* -------------------------------------------------------------------------- */

/** Every slot is 1:1 at 1024, because every real photograph will be. */
const SIZE = 1024;

/**
 * `tone` is the dominant colour of the study and is taken from the sweet the
 * slot will hold, not from the palette: a placeholder that is exactly a brand
 * hue reads as a coloured rectangle, while one a shade off reads as a
 * photograph that has not loaded sharply yet.
 *
 * `mass` is [x, y, size] in fractions of the frame. Fixed values, like every
 * other number in this project — a placeholder set that comes out different on
 * the next run cannot be compared against the run before it.
 */
const slots = [
  { name: "p-01", tone: "#D9A05B", ground: C.shirDeep, mass: [0.5, 0.52, 0.56], seed: 3 },
  { name: "p-02", tone: "#E4C79A", ground: C.shir, mass: [0.48, 0.5, 0.6], seed: 7 },
  { name: "p-03", tone: "#F2E2CE", ground: C.shirDeep, mass: [0.52, 0.54, 0.54], seed: 11 },
  { name: "p-04", tone: "#E7A9BE", ground: C.shir, mass: [0.5, 0.5, 0.58], seed: 13 },
  { name: "p-05", tone: "#F0B93F", ground: C.shirDeep, mass: [0.5, 0.53, 0.5], seed: 17 },
  { name: "p-06", tone: "#E9B457", ground: C.shir, mass: [0.49, 0.5, 0.62], seed: 19 },
  { name: "v-01", tone: "#F6EBDA", ground: C.shirDeep, mass: [0.46, 0.52, 0.72], seed: 23 },
  { name: "v-02", tone: "#EFC15A", ground: C.shir, mass: [0.54, 0.48, 0.74], seed: 29 },
];

const study = ({ tone, ground, mass, seed }) => {
  const [mx, my, msize] = mass;
  const cx = SIZE * mx;
  const cy = SIZE * my;
  const rx = SIZE * msize * 0.5;
  const ry = rx * 0.94;
  const blur = SIZE * 0.1;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" role="img">
  <defs>
    <radialGradient id="light" cx="76%" cy="16%" r="90%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.38"/>
      <stop offset="54%" stop-color="#FFFFFF" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${C.ink}" stop-opacity="0.14"/>
    </radialGradient>
    <linearGradient id="fall" x1="1" y1="0" x2="0.15" y2="1">
      <stop offset="0%" stop-color="${tone}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${tone}" stop-opacity="0.18"/>
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${blur.toFixed(1)}"/>
    </filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${seed}" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="g"/>
      <feComponentTransfer in="g" result="gt">
        <feFuncA type="linear" slope="0.42"/>
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="gt" mode="overlay"/>
    </filter>
  </defs>

  <g filter="url(#grain)">
    <rect width="${SIZE}" height="${SIZE}" fill="${ground}"/>
    <rect width="${SIZE}" height="${SIZE}" fill="url(#fall)"/>
    <g filter="url(#soft)">
      <ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="${tone}" opacity="0.9"/>
      <ellipse cx="${(cx + rx * 0.4).toFixed(0)}" cy="${(cy - ry * 0.44).toFixed(0)}" rx="${(rx * 0.46).toFixed(0)}" ry="${(ry * 0.32).toFixed(0)}" fill="#FFFFFF" opacity="0.3"/>
      <ellipse cx="${(cx - rx * 0.6).toFixed(0)}" cy="${(cy + ry * 0.52).toFixed(0)}" rx="${(rx * 0.68).toFixed(0)}" ry="${(ry * 0.36).toFixed(0)}" fill="${C.ink}" opacity="0.16"/>
    </g>
    <rect width="${SIZE}" height="${SIZE}" fill="url(#light)"/>
  </g>
</svg>
`;
};

/* -------------------------------------------------------------------------- */
/*  The three pattern plates                                                  */
/* -------------------------------------------------------------------------- */

/** Eight-pointed star — the same vertex construction as Pattern.tsx. */
function star(cx, cy, outer, inner, points = 8) {
  const vertices = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    vertices.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return vertices.join(" ");
}

/**
 * The three geometries these plates need, authored in a 100-unit cell exactly
 * as in `Pattern.tsx`. Duplicated deliberately rather than imported: this is a
 * plain Node script with no build step and no JSX, and a shared module would
 * have to be one or the other. The component is the source of truth for what
 * the page renders; if a geometry changes there and not here, the only thing
 * that drifts is three files no browser fetches.
 */
const GEOMETRY = {
  tile: {
    aspect: 1,
    body: `<polygon points="${star(50, 50, 30, 12.5)}"/>
      <polygon points="${star(50, 50, 14, 6)}"/>
      <path d="M-9 0H9M0-9V9M91 0h18M100-9V9M-9 100H9M0 91v18M91 100h18M100 91v18"/>`,
  },
  dots: {
    aspect: 1,
    body: `<circle cx="25" cy="25" r="9" stroke-width="0" fill="currentColor"/>
      <circle cx="75" cy="75" r="9" stroke-width="0" fill="currentColor"/>
      <circle cx="75" cy="25" r="3.5" stroke-width="0" fill="currentColor"/>
      <circle cx="25" cy="75" r="3.5" stroke-width="0" fill="currentColor"/>`,
  },
  arch: {
    aspect: 0.75,
    body: `<path d="M10 100V52C10 26 27 8 50 2 73 8 90 26 90 52v48"/>
      <path d="M28 100V56C28 38 37 26 50 21 63 26 72 38 72 56v44"/>
      <path d="M0 100h100"/>`,
  },
};

/** One plate per photograph-less item, carrying its own group's hue and
 *  geometry — khoshk is saffron and tile, tar is rosewater and sugar, ghand is
 *  lapis and arches. */
const plates = [
  { name: "plate-baghlava", kind: "tile", ground: C.zafaran, stroke: C.ink, cell: 128 },
  { name: "plate-bamieh", kind: "dots", ground: C.golab, stroke: C.ink, cell: 128 },
  { name: "plate-sohan", kind: "arch", ground: C.lajvard, stroke: C.tala, cell: 128 },
];

const plate = ({ name, kind, ground, stroke, cell }) => {
  const { aspect, body } = GEOMETRY[kind];
  const w = cell;
  const h = Math.round(cell / aspect);
  const id = `pat-${name}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" role="img">
  <defs>
    <pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${h}" viewBox="0 0 100 ${(100 / aspect).toFixed(0)}">
      <g fill="none" stroke="${stroke}" color="${stroke}" stroke-width="5" stroke-linecap="square">
        ${body}
      </g>
    </pattern>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="${ground}"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#${id})" opacity="0.9"/>
</svg>
`;
};

/* -------------------------------------------------------------------------- */

let count = 0;
for (const slot of slots) {
  writeFileSync(join(outDir, `${slot.name}.svg`), study(slot), "utf8");
  count += 1;
}
for (const p of plates) {
  writeFileSync(join(outDir, `${p.name}.svg`), plate(p), "utf8");
  count += 1;
}
console.log(
  `generated ${count} files → public/media/  (${slots.length} photographic placeholders, ${plates.length} pattern plates)`,
);
