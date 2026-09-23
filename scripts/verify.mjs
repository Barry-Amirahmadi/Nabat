/**
 * The verification pass — one script, every route, numbers only.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * **Nothing here renders an image and looks at it.** That is the rule this
 * whole file exists to satisfy: a screenshot costs about as much as a hundred
 * pages of text and gets re-read on every later turn, and a page that is
 * *looked at* is a page nobody measured. So every question this site could
 * fail is asked as a number instead — computed styles, contrast ratios,
 * bounding boxes, `scrollWidth` against `clientWidth`, console errors, HTTP
 * statuses, resource weights, the accessibility of the decorative layers.
 *
 * It catches strictly more than an eye would. An eye does not notice 6.8:1
 * where 7:1 was required, and it certainly does not notice it on the second,
 * fourth and sixth bands only.
 *
 * What it does *not* judge is whether the thing is any good. That is Barry's
 * call and is not simulated here.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Run against the exported output, served the way a dumb static host serves
 * it — never `next dev`, which resolves routes through Next's router and hides
 * exactly the class of defect this is looking for:
 *
 *   npm run build:pages
 *   node scripts/verify.mjs
 *
 * The route list is read from the exported sitemap rather than written here,
 * so it cannot fall behind the content. `/404` and an unknown path are added
 * on top, because neither belongs in a sitemap.
 */
import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

/**
 * This project's own port, and not the family default.
 *
 * Several of these template repos live side by side in one folder and each
 * ships the same `serve-static.mjs`. A leftover server from a sibling repo
 * answers on the shared port, under a *different* base path, and returns 404
 * for everything here — which reads as "the whole site is broken" and is
 * really "you are talking to the wrong process". The handshake below refuses
 * to proceed against a server that is not this one, and the port is distinct
 * so the collision is rare in the first place.
 */
const PORT = Number(process.env.VERIFY_PORT ?? 4357);
const BASE = "/nabat";
const ORIGIN = `http://localhost:${PORT}`;

/** §13.8 — a route whose HTML passes this is re-emitting pattern markup. */
const HTML_BUDGET = 150 * 1024;

/**
 * Widths. 390 is the narrowest phone this site is expected on and the only
 * width where a horizontal scrollbar is a shipping defect; 1440 is where the
 * overlaps and the three-column grids exist at all.
 *
 * 900 runs the grid check alone. The `md` column of every placement table is
 * live only between 768 and 1024, so it is the one breakpoint that could be
 * wrong in a way neither other width would reveal — and a page load with no
 * screenshot in it is cheap.
 */
const WIDTHS = [
  { w: 390, h: 844, bp: "base", full: true },
  { w: 900, h: 900, bp: "md", full: false },
  { w: 1440, h: 900, bp: "lg", full: true },
];

/* -------------------------------------------------------------------------- */
/*  The page-side measurement                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Everything measured inside the page, in one pass.
 *
 * Written as a single function passed to `page.evaluate` because each of these
 * needs the live computed style of the same elements, and eleven separate
 * round trips over the same DOM is eleven chances for the page to be in a
 * different state each time.
 */
function measureInPage(breakpoint) {
  /* ---- colour ---------------------------------------------------------- */

  /**
   * A colour from a computed value.
   *
   * Handles `rgb()`/`rgba()` *and* hex, because the two arrive from different
   * places and only one of them is obvious. `getComputedStyle(el).color`
   * always resolves to `rgb()`, but `getPropertyValue("--color-focus")`
   * returns the custom property's own token — ` #231409`, leading space and
   * all. A parser that only understood `rgb()` silently reported every focus
   * token as missing, which looked exactly like a stylesheet that had not
   * loaded.
   */
  const parse = (value) => {
    const text = String(value).trim();

    const hex = text.match(/^#([0-9a-f]{3,8})$/i);
    if (hex) {
      const h = hex[1];
      const wide = h.length <= 4 ? [...h].map((c) => c + c).join("") : h;
      return {
        r: parseInt(wide.slice(0, 2), 16),
        g: parseInt(wide.slice(2, 4), 16),
        b: parseInt(wide.slice(4, 6), 16),
        a: wide.length >= 8 ? parseInt(wide.slice(6, 8), 16) / 255 : 1,
      };
    }

    const m = text.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.some(Number.isNaN)) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };

  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => {
    const la = luminance(a);
    const lb = luminance(b);
    const hi = Math.max(la, lb);
    const lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Source-over: `top` at its own alpha onto an opaque `bottom`. */
  const over = (top, bottom) => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  });

  const label = (el) => {
    const cls = typeof el.className === "string" ? el.className : "";
    return `${el.tagName.toLowerCase()}${cls ? `.${cls.trim().split(/\s+/).slice(0, 3).join(".")}` : ""}`;
  };

  /**
   * The colour actually behind a text node.
   *
   * Walks up until something opaque is found and composites everything
   * translucent it passed on the way — the resolved background of a text node
   * is not its own `background-color`, and on this site it is almost never the
   * element's own anything.
   */
  const backgroundUnder = (el) => {
    const stack = [];
    let node = el;
    let host = null;

    while (node && node !== document.documentElement.parentNode) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg.a > 0) {
        stack.push(bg);
        if (bg.a >= 1) {
          host = node;
          break;
        }
      }
      node = node.parentElement;
    }

    if (stack.length === 0) return { colour: { r: 255, g: 255, b: 255, a: 1 }, host: null };

    let resolved = stack[stack.length - 1];
    for (let i = stack.length - 2; i >= 0; i -= 1) resolved = over(stack[i], resolved);
    return { colour: resolved, host };
  };

  const intersects = (a, b) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  /* ---- 3 · contrast ---------------------------------------------------- */

  const patternLayers = [...document.querySelectorAll("[data-pattern-layer]")].map((layer) => {
    const ink = layer.querySelector("[data-pattern-ink]");
    const stroke = ink ? parse(getComputedStyle(ink).stroke) : null;
    const opacity = Number(getComputedStyle(layer).opacity) || 1;
    return { layer, host: layer.parentElement, rect: layer.getBoundingClientRect(), stroke, opacity };
  });

  const SKIP = new Set(["SCRIPT", "STYLE", "TITLE", "NOSCRIPT"]);
  const contrast = { worst: null, failures: [], checked: 0 };

  for (const el of document.querySelectorAll("body *")) {
    if (SKIP.has(el.tagName)) continue;
    const ownText = [...el.childNodes]
      .filter((n) => n.nodeType === 3 && n.textContent.trim() !== "")
      .map((n) => n.textContent.trim())
      .join(" ");
    if (ownText === "") continue;
    if (!el.checkVisibility || !el.checkVisibility({ visibilityProperty: true })) continue;

    const rect = el.getBoundingClientRect();
    // Screen-reader-only text is clipped to a 1px box. It is never seen, so it
    // has no contrast to measure and counting it would mean auditing the
    // colour of something invisible.
    if (rect.width <= 2 || rect.height <= 2) continue;

    const style = getComputedStyle(el);
    const fg = parse(style.color);
    if (!fg) continue;

    const { colour: bg, host } = backgroundUnder(el);
    const candidates = [{ bg, via: "plate" }];

    /**
     * Text over pattern.
     *
     * Only when the opaque ancestor *is* the pattern's own host: a pattern
     * paints above its host's background and below its content, so any opaque
     * plate between the two hides it entirely. That is exactly what `.plate`
     * and `.plate-own` are for, and it is why body text on this site is never
     * measured against a stroke.
     */
    if (host) {
      for (const p of patternLayers) {
        if (p.host !== host || !p.stroke || !intersects(rect, p.rect)) continue;
        candidates.push({
          bg: over({ ...p.stroke, a: p.stroke.a * p.opacity }, bg),
          via: `pattern:${p.layer.getAttribute("data-pattern-layer")}`,
        });
      }
    }

    const size = parseFloat(style.fontSize) || 16;
    const weight = Number(style.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);

    for (const candidate of candidates) {
      const value = ratio(fg, candidate.bg);
      // Thresholds are §7's: display type on a hue needs 3:1, cream reversed
      // out of a hue needs 4.5:1, and ink on any plate carrying body text
      // needs 7:1.
      const reversed = luminance(fg) > luminance(candidate.bg);
      const kind = large ? "display" : reversed ? "reversed" : "ink-on-plate";
      const threshold = large ? 3 : reversed ? 4.5 : 7;

      contrast.checked += 1;
      const record = {
        ratio: Number(value.toFixed(2)),
        threshold,
        kind,
        via: candidate.via,
        el: label(el),
        text: ownText.slice(0, 28),
        margin: Number((value - threshold).toFixed(2)),
      };
      if (value + 0.005 < threshold) contrast.failures.push(record);
      if (!contrast.worst || record.margin < contrast.worst.margin) contrast.worst = record;
    }
  }

  /* ---- 4 · grid placement ---------------------------------------------- */

  const attr = { base: "data-grid-base", md: "data-grid-md", lg: "data-grid-lg" }[breakpoint];
  const placement = { checked: 0, failures: [] };
  const grids = new Set();

  for (const el of document.querySelectorAll(`[${attr}]`)) {
    const [row, col] = el.getAttribute(attr).split(",").map(Number);
    const style = getComputedStyle(el);
    const actualRow = style.gridRowStart;
    const actualCol = style.gridColumnStart;
    placement.checked += 1;

    // "auto" is the failure this whole convention exists to catch: sparse
    // auto-placement never moves its cursor backwards, so a cell asking for an
    // earlier column is silently pushed into a new implicit row.
    if (actualRow !== String(row) || actualCol !== String(col)) {
      placement.failures.push({
        el: label(el),
        want: `${row},${col}`,
        got: `${actualRow},${actualCol}`,
      });
    }
    if (el.parentElement) grids.add(el.parentElement);
  }

  const rows = [...grids].map((grid) => ({
    grid: label(grid),
    rows: getComputedStyle(grid).gridTemplateRows.split(" ").filter(Boolean).length,
    cols: getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length,
  }));

  /* ---- 2 + 5 · overflow ------------------------------------------------ */

  const scroll = {
    scrollWidth: document.body.scrollWidth,
    clientWidth: document.body.clientWidth,
    innerWidth: window.innerWidth,
  };

  /**
   * A plate at ±3° is wider than its own box, so its rotated bounding box is
   * what has to fit — not its layout box. Measured for every element that
   * actually computes a rotation, rather than for everything with a class
   * that might.
   */
  const rotated = { checked: 0, failures: [] };
  for (const el of document.querySelectorAll("*")) {
    const style = getComputedStyle(el);
    const spin = style.rotate;
    if (!spin || spin === "none" || spin === "0deg") continue;
    rotated.checked += 1;
    const rect = el.getBoundingClientRect();
    // A one-pixel tolerance: rects are fractional and a sub-pixel edge is not
    // a scrollbar.
    if (rect.right > window.innerWidth + 1 || rect.left < -1) {
      rotated.failures.push({
        el: label(el),
        rotate: spin,
        left: Number(rect.left.toFixed(1)),
        right: Number(rect.right.toFixed(1)),
      });
    }
  }

  /* ---- 6 · focus ring --------------------------------------------------- */

  /**
   * The ring is two-tone — an ink core inside a cream halo — because no single
   * colour clears 3:1 against both cream and lapis. So the requirement is that
   * on every ground the page actually paints, at least one of the two halves
   * carries the contrast.
   */
  const rootStyle = getComputedStyle(document.documentElement);
  const core = parse(rootStyle.getPropertyValue("--color-focus"));
  const halo = parse(rootStyle.getPropertyValue("--color-focus-halo"));
  const focus = { grounds: [], failures: [] };

  if (core && halo) {
    const seen = new Map();
    for (const el of document.querySelectorAll("body, .plate, .plate-own, [data-pattern-layer]")) {
      const host = el.classList.contains("pattern-layer") ? el.parentElement : el;
      if (!host) continue;
      const bg = parse(getComputedStyle(host).backgroundColor);
      if (!bg || bg.a < 1) continue;
      const key = `${bg.r},${bg.g},${bg.b}`;
      if (!seen.has(key)) seen.set(key, { bg, el: label(host) });
    }

    for (const [key, { bg, el }] of seen) {
      const best = Math.max(ratio(core, bg), ratio(halo, bg));
      const record = { ground: key, el, ratio: Number(best.toFixed(2)) };
      focus.grounds.push(record);
      if (best + 0.005 < 3) focus.failures.push(record);
    }
  } else {
    focus.failures.push({ ground: "(tokens missing)", el: "--color-focus", ratio: 0 });
  }

  /* ---- 7 · the decorative layers --------------------------------------- */

  const decorative = { layers: patternLayers.length, failures: [] };
  for (const { layer } of patternLayers) {
    if (layer.getAttribute("aria-hidden") !== "true") {
      decorative.failures.push({ el: label(layer), why: "not aria-hidden" });
    }
    const focusable = layer.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) {
      decorative.failures.push({ el: label(layer), why: `${focusable.length} focusable inside` });
    }
  }

  /* ---- markup weight of the inline pattern ------------------------------ */

  const patternBytes = [...document.querySelectorAll("[data-pattern-layer]")].reduce(
    (sum, el) => sum + el.outerHTML.length,
    0,
  );

  /* ---- fonts ------------------------------------------------------------ */

  const families = new Set();
  for (const el of document.querySelectorAll("body *")) {
    const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() !== "");
    if (text) families.add(getComputedStyle(el).fontFamily.split(",")[0].replace(/['"]/g, ""));
  }

  return {
    contrast,
    placement,
    rows,
    scroll,
    rotated,
    focus,
    decorative,
    patternBytes,
    families: [...families].sort(),
    images: [...document.querySelectorAll("img")].length,
    brokenImages: [...document.querySelectorAll("img")].filter(
      (i) => i.complete && i.naturalWidth === 0,
    ).length,
  };
}

/* -------------------------------------------------------------------------- */
/*  Driver                                                                    */
/* -------------------------------------------------------------------------- */

const fail = [];
const note = (route, width, message) => fail.push(`${route} @${width} — ${message}`);

/**
 * Wait for *this* site's server, not merely for something listening.
 *
 * A 200 and a document that actually contains the brand name — anything less
 * and the measurement below would be of a stranger's page, or of a plain-text
 * 404 with no stylesheet, which produces a spectacular and entirely fictional
 * list of failures.
 */
async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  let last = "never answered";

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const body = await res.text();
        if (body.includes("نبات")) return;
        last = `HTTP ${res.status} but the document is not this site`;
      } else {
        last = `HTTP ${res.status}`;
      }
    } catch {
      last = "connection refused";
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  throw new Error(
    `no usable static server at ${url} — ${last}.
` +
      `Another repo's preview server may hold port ${PORT}; set VERIFY_PORT to a free one.`,
  );
}

async function routesFromSitemap() {
  const xml = await readFile(join(root, "out", "sitemap.xml"), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = locs.map((loc) => new URL(loc).pathname.replace(BASE, "") || "/");
  // Neither belongs in a sitemap, and both are routes a reader can land on.
  return [...paths, "/404.html", "/definitely-not-a-page/"];
}

const outExists = await stat(join(root, "out", "index.html")).catch(() => null);
if (!outExists) {
  console.error("no out/index.html — run `npm run build:pages` first");
  process.exit(1);
}

const routes = await routesFromSitemap();

const server = spawn(
  process.execPath,
  [join(here, "serve-static.mjs"), "--port", String(PORT), "--base", BASE.slice(1)],
  { stdio: ["ignore", "ignore", "inherit"] },
);

let browser;
try {
  await waitForServer(`${ORIGIN}${BASE}/`);
  browser = await chromium.launch();

  for (const { w, h, bp, full } of WIDTHS) {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    console.log(`\n══ ${w}px · ${bp} ${full ? "" : "· grid placement only"}`);
    console.log(
      full
        ? "route                          stat  err  scrollW/clientW  worst-contrast              grid  rot  html   img"
        : "route                          grid rows×cols",
    );

    for (const route of routes) {
      const page = await context.newPage();
      const consoleErrors = [];
      const failedRequests = [];
      let imageBytes = 0;
      let htmlBytes = 0;

      page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push(m.text());
      });
      page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
      page.on("response", async (res) => {
        if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
        const type = res.headers()["content-type"] ?? "";
        try {
          const body = await res.body();
          if (type.startsWith("image/")) imageBytes += body.length;
          if (type.startsWith("text/html")) htmlBytes += body.length;
        } catch {
          /* a redirect or an aborted request has no body */
        }
      });

      const response = await page.goto(`${ORIGIN}${BASE}${route}`, { waitUntil: "load" });
      const status = response?.status() ?? 0;

      // Walk the page so lazy images load and every reveal has fired — an
      // element still at opacity 0 has no contrast worth measuring.
      await page.evaluate(async () => {
        const height = document.body.scrollHeight;
        for (let y = 0; y < height; y += 400) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 40));
        }
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      await page.waitForTimeout(250);

      const m = await page.evaluate(measureInPage, bp);

      if (!full) {
        const grid = m.placement.failures.length === 0 ? "ok" : `FAIL ${m.placement.failures.length}`;
        console.log(
          `${route.padEnd(30)} ${grid.padEnd(4)} ${m.rows.map((r) => `${r.rows}×${r.cols}`).join(" ")}`,
        );
        for (const f of m.placement.failures) {
          note(route, `${w}px`, `grid cell ${f.el} wanted ${f.want}, got ${f.got}`);
        }
        await page.close();
        continue;
      }

      const deliberate404 = route === "/definitely-not-a-page/";
      const expectedStatus = deliberate404 ? 404 : 200;
      if (status !== expectedStatus) note(route, `${w}px`, `HTTP ${status}, expected ${expectedStatus}`);

      /**
       * The unknown path is *supposed* to 404, and a browser logs a console
       * error for the navigation that did. Counting that as a defect would
       * mean the only way to pass this check is to not test the 404 at all.
       * Anything else it logs still counts.
       */
      const realErrors = deliberate404
        ? consoleErrors.filter((e) => !/status of 404/.test(e))
        : consoleErrors;
      if (realErrors.length) note(route, `${w}px`, `console: ${realErrors[0]}`);
      // The 404 route is reached by a URL with no file, so its own request is
      // the expected failure; everything else must load clean.
      const unexpected = failedRequests.filter((f) => !f.includes("definitely-not-a-page"));
      if (unexpected.length) note(route, `${w}px`, `failed request: ${unexpected[0]}`);

      if (m.scroll.scrollWidth > m.scroll.clientWidth + 1) {
        note(
          route,
          `${w}px`,
          `horizontal scroll: body scrollWidth ${m.scroll.scrollWidth} > clientWidth ${m.scroll.clientWidth}`,
        );
      }
      for (const f of m.contrast.failures) {
        note(route, `${w}px`, `contrast ${f.ratio}:1 < ${f.threshold} (${f.kind}, ${f.via}) on ${f.el} «${f.text}»`);
      }
      for (const f of m.placement.failures) {
        note(route, `${w}px`, `grid cell ${f.el} wanted ${f.want}, got ${f.got}`);
      }
      for (const f of m.rotated.failures) {
        note(route, `${w}px`, `rotated ${f.el} at ${f.rotate} spans ${f.left}…${f.right} of ${w}`);
      }
      for (const f of m.focus.failures) {
        note(route, `${w}px`, `focus ring ${f.ratio}:1 < 3 on ground rgb(${f.ground}) (${f.el})`);
      }
      for (const f of m.decorative.failures) {
        note(route, `${w}px`, `pattern layer ${f.el}: ${f.why}`);
      }
      if (m.brokenImages > 0) note(route, `${w}px`, `${m.brokenImages} image(s) failed to load`);
      if (htmlBytes > HTML_BUDGET) {
        note(
          route,
          `${w}px`,
          `HTML ${(htmlBytes / 1024).toFixed(0)}KB over the ${HTML_BUDGET / 1024}KB budget — ${(m.patternBytes / 1024).toFixed(1)}KB of it inline pattern`,
        );
      }

      const worst = m.contrast.worst;
      console.log(
        [
          route.padEnd(30),
          String(status).padEnd(5),
          String(consoleErrors.length).padEnd(4),
          `${m.scroll.scrollWidth}/${m.scroll.clientWidth}`.padEnd(16),
          `${worst ? worst.ratio : "—"}:1 ≥${worst ? worst.threshold : "—"} ${worst ? worst.kind : ""}`.padEnd(27),
          (m.placement.failures.length === 0 ? `ok/${m.placement.checked}` : `FAIL`).padEnd(5),
          String(m.rotated.checked).padEnd(4),
          `${(htmlBytes / 1024).toFixed(0)}K`.padEnd(6),
          `${(imageBytes / 1024).toFixed(0)}K`,
        ].join(" "),
      );

      if (route === "/") {
        console.log(`   fonts in use: ${m.families.join(", ")}`);
        console.log(
          `   pattern layers: ${m.decorative.layers} · inline pattern markup ${(m.patternBytes / 1024).toFixed(1)}KB`,
        );
        console.log(
          `   focus ring vs grounds: ${m.focus.grounds.map((g) => `${g.ratio}`).join(", ")}`,
        );
      }

      await page.close();
    }

    await context.close();
  }

  /* ---- reduced motion ---------------------------------------------------- */

  /**
   * §13's last check, and the one with a trap in it.
   *
   * The design's static angles are set with the `rotate` property; the reveal
   * animates `transform`. Under `prefers-reduced-motion` the reveal's
   * `transform` is cleared to `none` — the motion — while the composition's
   * angles survive, because an angle a plate is *drawn* at is not motion.
   * Counting revealed elements with and without the preference is what proves
   * nothing is left hidden: a reveal that fails closed is a blank page.
   */
  console.log("\n══ prefers-reduced-motion");
  const counts = {};
  for (const motion of ["no-preference", "reduce"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: motion === "reduce" ? "reduce" : "no-preference",
    });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}${BASE}/`, { waitUntil: "load" });
    await page.evaluate(async () => {
      const height = document.body.scrollHeight;
      for (let y = 0; y < height; y += 400) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.waitForTimeout(400);

    counts[motion] = await page.evaluate(() => {
      const reveals = [...document.querySelectorAll(".reveal")];
      const visible = reveals.filter((el) => Number(getComputedStyle(el).opacity) > 0.99);
      const moved = reveals.filter((el) => {
        const t = getComputedStyle(el).transform;
        return t && t !== "none";
      });
      const tilted = [...document.querySelectorAll(".tilt")].filter((el) => {
        const r = getComputedStyle(el).rotate;
        return r && r !== "none" && r !== "0deg";
      });
      return { reveals: reveals.length, visible: visible.length, moved: moved.length, tilted: tilted.length };
    });

    console.log(
      `${motion.padEnd(15)} reveals ${counts[motion].reveals}  fully visible ${counts[motion].visible}  with transform ${counts[motion].moved}  still tilted ${counts[motion].tilted}`,
    );
    await context.close();
  }

  /**
   * The counts are printed both ways, and the *asserted* one is that under
   * `reduce` every revealed element is visible.
   *
   * Comparing the two totals directly is the weaker test and it fails for a
   * benign reason: without the preference a reveal below the fold has simply
   * not fired yet, so the no-preference count is legitimately the smaller of
   * the two. What actually matters is that reduced motion loses nothing —
   * `visible === reveals` — and that nothing is left mid-transform.
   */
  if (counts.reduce.visible < counts["no-preference"].visible) {
    fail.push(
      `reduced motion — ${counts.reduce.visible} elements visible against ${counts["no-preference"].visible} without it`,
    );
  }
  if (counts.reduce.visible !== counts.reduce.reveals) {
    fail.push(
      `reduced motion — ${counts.reduce.reveals - counts.reduce.visible} revealed element(s) still transparent`,
    );
  }
  if (counts.reduce.moved !== 0) {
    fail.push(`reduced motion — ${counts.reduce.moved} element(s) still carry a transform`);
  }
  if (counts.reduce.tilted === 0) {
    fail.push("reduced motion — the static composition angles were cleared along with the motion");
  }

  /* ---- the glyph check --------------------------------------------------- */

  /**
   * §8. `گچپژ نبات ۱۲۳۴` in all three faces, in the built output: the four
   * Persian-only letters, the brand name, and Persian digits. A face that
   * falls back renders something — that is the whole problem with a missing
   * glyph — so the test is per-character coverage from the font itself, not
   * whether anything appeared.
   */
  console.log("\n══ glyph coverage");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}${BASE}/`, { waitUntil: "load" });
    await page.waitForTimeout(400);

    const report = await page.evaluate(async () => {
      const SAMPLE = "گچپژ نبات ۱۲۳۴";
      const vars = ["--font-display", "--font-display-alt", "--font-body"];
      const rootStyle = getComputedStyle(document.documentElement);
      const out = [];

      for (const name of vars) {
        const stack = rootStyle.getPropertyValue(name).trim();
        const first = stack.split(",")[0].replace(/['"]/g, "").trim();

        // Load-state, per character: `document.fonts.check` answers for the
        // family it was asked about, so a false here is a real gap rather than
        // a fallback quietly covering for it.
        const missing = [...SAMPLE]
          .filter((ch) => ch.trim() !== "")
          .filter((ch) => !document.fonts.check(`16px "${first}"`, ch));

        const loaded = [...document.fonts].filter((f) => f.family === first).map((f) => f.status);

        // Width against a known-missing-glyph fallback. Two faces that render
        // a string at exactly the same width are the same face.
        const measure = (family) => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          ctx.font = `32px ${family}`;
          return Math.round(ctx.measureText(SAMPLE).width);
        };

        out.push({
          name,
          face: first,
          stack,
          missing,
          faces: loaded.length,
          statuses: [...new Set(loaded)],
          width: measure(`"${first}", monospace`),
          fallbackWidth: measure("monospace"),
        });
      }
      return out;
    });

    for (const f of report) {
      const distinct = f.width !== f.fallbackWidth;
      console.log(
        `${f.name.padEnd(20)} ${f.face.padEnd(14)} faces ${f.faces} ${f.statuses.join("/")}  missing ${f.missing.length}  width ${f.width} vs fallback ${f.fallbackWidth}`,
      );
      if (f.missing.length > 0) {
        fail.push(`glyph coverage — ${f.face} is missing ${f.missing.join(" ")}`);
      }
      if (f.faces === 0) fail.push(`glyph coverage — ${f.face} never loaded`);
      if (!distinct) {
        fail.push(`glyph coverage — ${f.face} measures identically to the fallback; it is not applied`);
      }
    }
    await context.close();
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}

/* -------------------------------------------------------------------------- */

console.log("\n" + "─".repeat(78));
if (fail.length === 0) {
  console.log("PASS — every route, every width, every check.");
  process.exit(0);
}
console.log(`FAIL — ${fail.length} finding(s):\n`);
for (const f of fail) console.log(`  • ${f}`);
process.exit(1);
