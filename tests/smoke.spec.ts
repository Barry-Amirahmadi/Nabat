import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke pass — deliberately small.
 *
 * Scope is the regression baseline: the site renders, it is genuinely RTL, the
 * lightbox opens, an item route survives a hard load under the base path, and
 * nothing 404s. It is not coverage, and it should not grow into coverage — add
 * cases when a page is added, not speculatively.
 *
 * Every assertion here corresponds to a defect that actually happened on one
 * of the sites in this family, which is the only reason each one is worth a
 * test. The selectors and counts are this site's; the assertions are inherited
 * wholesale, because the defects are properties of the engine and the host,
 * not of the design sitting on top of them.
 *
 * Layout correctness — grid placement, contrast, rotation overflow — is not
 * here. That is a separate measured pass in `scripts/verify.mjs`, which walks
 * every route at two widths and prints numbers.
 */

/**
 * The deployment base path. Spelled out rather than folded into `baseURL`:
 * these tests exist largely to catch base-path regressions, so it should be
 * visible at every call site.
 */
const rawBase = process.env.SMOKE_BASE_PATH ?? "/nabat";
const BASE = rawBase === "/" ? "" : rawBase.replace(/\/+$/, "");

/** Persian digits back to a number, so a rendered count can be compared. */
function fromFa(text: string): number {
  return Number(text.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, ""));
}

/**
 * Every control on the page must have a non-empty accessible name.
 *
 * This exists because the interface strings live in `src/content/ui.ts`. A
 * mistyped path there does not throw and does not render visibly wrong — the
 * button still draws, still works, and simply stops announcing itself, or
 * announces the word "undefined". That is invisible to every other check in
 * this file and to anyone looking at the screen.
 */
async function namelessControls(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll("button, a[href]")]
      .filter((el) => (el as HTMLElement).checkVisibility({ visibilityProperty: true }))
      // An aria-hidden subtree is not in the accessibility tree, so nothing in
      // it needs a name — skipping these is the difference between a check and
      // a false alarm.
      .filter((el) => el.closest('[aria-hidden="true"]') === null)
      .filter((el) => {
        const label = el.getAttribute("aria-label");
        const name = label === null ? (el.textContent ?? "") : label;
        return name.trim() === "" || name.includes("undefined");
      })
      .map((el) => `${el.tagName.toLowerCase()}.${el.className || "(no class)"}`),
  );
}

/** Collects console errors and failed responses for the lifetime of a page. */
function watch(page: Page) {
  const consoleErrors: string[] = [];
  const failed: string[] = [];

  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });

  return { consoleErrors, failed };
}

/** Walks the page so lazy images and scroll reveals all fire. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const height = document.body.scrollHeight;
    for (let y = 0; y < height; y += 400) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 50));
    }
  });
}

/**
 * Regression: next/image does not apply basePath when images are unoptimized,
 * which silently broke every image on the first project site in this family.
 */
async function brokenImages(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0)
        .length,
  );
}

async function overflowsHorizontally(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

test("the poster renders, the page is RTL, and every asset loads", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  await page.goto(`${BASE}/`);

  // The brand name is the homepage's h1 — the poster is type on pattern, not a
  // headline over a photograph.
  await expect(page.locator("h1")).toHaveText("نبات");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");

  // Native RTL, not just an attribute — the grid must resolve right-to-left.
  const direction = await page.evaluate(() => getComputedStyle(document.body).direction);
  expect(direction).toBe("rtl");

  // Band 2 is the whole box: nine items, every one of them a tile.
  await expect(page.locator("article[id^='item-']")).toHaveCount(9);

  await scrollThrough(page);

  expect(await brokenImages(page), "images failing to load").toBe(0);
  expect(await overflowsHorizontally(page), "horizontal overflow").toBe(false);
  expect(failed, "failed requests").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
});

test("every control on the homepage announces itself", async ({ page }) => {
  await page.goto(`${BASE}/`);

  // Nothing else in this suite sees the header, footer and tile controls at
  // rest, and they are where most of `ui.ts` is consumed.
  expect(await namelessControls(page), "controls with no accessible name").toEqual([]);
});

test("the gallery wall opens the right picture, and the lightbox closes", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  const response = await page.goto(`${BASE}/gallery/`);
  expect(response?.status()).toBe(200);

  await expect(page.locator("h1")).toHaveText("نقش‌ها و شیرینی‌ها، بزرگ");
  await expect(
    page.locator('header nav[aria-label="پیمایش اصلی"] a[aria-current="page"]'),
  ).toHaveText("گالری");

  // Every image must survive the wall. A composition that drops the last item
  // when the count does not fill its final row loses it silently.
  const tiles = page.locator(".gallery-tile");
  await expect(tiles).toHaveCount(8);

  // The cards are placed by an explicit table rather than in document order,
  // so the index handed to the lightbox is the one thing that could disagree
  // with what was clicked. Passing a cell index instead of a gallery index
  // opens the wrong picture — which looks like a working lightbox, not a bug.
  const third = tiles.nth(2);
  await third.scrollIntoViewIfNeeded();
  await third.click();

  const dialog = page.locator("dialog.lightbox");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(dialog).toHaveAttribute("aria-label", /\S/);
  await expect(dialog.locator(".t-name")).toHaveText("نان خامه‌ای");

  // The lightbox's own controls exist only while it is open, so they are
  // absent from the exported HTML and can only be checked here.
  expect(await namelessControls(page), "lightbox controls with no name").toEqual([]);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveJSProperty("open", false);

  expect(await brokenImages(page), "images failing to load").toBe(0);
  expect(await overflowsHorizontally(page), "horizontal overflow").toBe(false);
  expect(failed, "failed requests").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
});

test("a gallery card's control is a button, and it has a pointer cursor", async ({ page }) => {
  await page.goto(`${BASE}/gallery/`);

  // It opens a dialog rather than going anywhere, so it must be a button —
  // that is also what makes it keyboard-reachable with no ARIA at all.
  const tag = await page.locator(".gallery-tile").first().evaluate((el) => el.tagName);
  expect(tag, "the gallery control's element").toBe("BUTTON");

  // A live defect on the template this engine came from: its reset sets
  // `cursor: pointer` on `button`, and a later rule overrode it on a different
  // element, leaving the gallery tiles computing `default`. The computed value
  // is measured here rather than the declaration trusted.
  const cursor = await page
    .locator(".gallery-tile")
    .first()
    .evaluate((el) => getComputedStyle(el).cursor);
  expect(cursor, "the gallery control's cursor").toBe("pointer");
});

test("an item route survives a hard load under the base path", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  // Hard load, not a client-side navigation: this is the case that 404'd on the
  // dynamic route's RSC payload, and the case a static host has to get right.
  const response = await page.goto(`${BASE}/products/ghottab/`);
  expect(response?.status()).toBe(200);

  await expect(page.locator("h1")).toHaveText("قطاب");

  // Regression: a raw <a href="/"> skips basePath and leaves the site entirely.
  const homeLink = page.locator('nav[aria-label="مسیر صفحه"] a').first();
  await expect(homeLink).toHaveAttribute("href", `${BASE}/`);

  // The site's only conversion point. A malformed number or an unencoded
  // message produces a link that looks fine and opens an empty chat.
  const inquiry = page.locator('a[href^="https://wa.me/"]').first();
  const inquiryHref = await inquiry.getAttribute("href");
  expect(inquiryHref, "WhatsApp inquiry link").toBeTruthy();
  expect(decodeURIComponent(inquiryHref!), "item name prefilled").toContain("قطاب");
  expect(inquiryHref!, "digits only in the wa.me path").toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  await expect(inquiry).toHaveAttribute("rel", /noopener/);

  // Related items must lead somewhere else — a page linking to itself here is
  // the failure mode of every naive "related" implementation.
  const relatedLinks = await page
    .locator('section[aria-labelledby="related-heading"] article a[href]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
  expect(relatedLinks.length, "related items").toBe(2);
  expect(relatedLinks.some((href) => href.includes("/products/ghottab"))).toBe(false);

  // The four detail rows are a description list, so a screen reader reads each
  // label with its value rather than as two loose words.
  await expect(page.locator("dl dt")).toHaveCount(4);
  await expect(page.locator("dl dd")).toHaveCount(4);

  await scrollThrough(page);

  expect(await brokenImages(page), "images failing to load").toBe(0);
  expect(await overflowsHorizontally(page), "horizontal overflow").toBe(false);
  expect(failed, "failed requests").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
});

/**
 * Three of the nine items carry no photograph at all — their tile is the
 * group's geometry and type. That is a design decision, and the thing that
 * marks it in the data is an empty `alt` on a generated pattern plate.
 *
 * So the page must render geometry rather than an `<img>` with an empty alt,
 * which is what a fallback would do, and the structured data must not claim a
 * photograph of the sweet exists.
 */
test("an item with no photograph renders geometry, and claims none", async ({ page }) => {
  await page.goto(`${BASE}/products/baghlava/`);

  await expect(page.locator("h1")).toHaveText("باقلوا");
  await expect(page.locator("[data-pattern-layer]").first()).toBeAttached();

  const emptyAlt = await page.locator('main img[alt=""]').count();
  expect(emptyAlt, "an image with no alt text").toBe(0);

  const product = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) =>
      els
        .map((el) => JSON.parse(el.textContent ?? "{}") as Record<string, unknown>)
        .find((p) => p["@type"] === "Product"),
    );
  expect(product?.image, "Product must not assert an image it does not have").toBeUndefined();
});

test("the collection page groups the box and its index resolves", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  const response = await page.goto(`${BASE}/products/`);
  expect(response?.status()).toBe(200);

  await expect(page.locator("h1")).toHaveText("همهٔ شیرینی‌ها، دسته به دسته");

  // Regression: nav hrefs written as bare hashes pointed at homepage sections
  // and resolved to nothing once the header rendered on a second page.
  await expect(
    page.locator('header nav[aria-label="پیمایش اصلی"] a[aria-current="page"]'),
  ).toHaveText("جعبه");

  // Three headed runs, and every item in exactly one of them.
  const items = page.locator("article[id^='item-']");
  await expect(items).toHaveCount(9);

  // The index is only structure if its targets exist. A group anchor pointing
  // at a removed group fails silently — the page just does not move.
  const anchors = await page
    .locator(".group-index__link")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
  expect(anchors.length, "group index entries").toBe(3);
  for (const anchor of anchors) {
    const id = anchor.slice(anchor.indexOf("#"));
    await expect(page.locator(id), `index anchor ${id}`).toHaveCount(1);
  }

  // The printed count is derived, so it must never disagree with what is shown.
  const printed = await page.locator(".group-index p.t-meta").innerText();
  expect(fromFa(printed)).toBe(await items.count());

  await scrollThrough(page);

  expect(await brokenImages(page), "images failing to load").toBe(0);
  expect(await overflowsHorizontally(page), "horizontal overflow").toBe(false);
  expect(failed, "failed requests").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
});

test("the about page reads as prose and every link goes somewhere", async ({ page }) => {
  const { consoleErrors, failed } = watch(page);

  const response = await page.goto(`${BASE}/about/`);
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("چرا جعبه نُه‌تایی است");

  // Four paragraphs, interrupted twice. The quotes are blockquotes between
  // paragraphs rather than floated asides, so the reading order is the
  // document order.
  await expect(page.locator("blockquote")).toHaveCount(2);

  // Exactly one order anchor per document. This band closes every route, so a
  // second instance on one page would make the nav anchor land on whichever
  // came first.
  await expect(page.locator("#order")).toHaveCount(1);

  // Both inquiry paths, and neither may be a dead "#".
  const chat = page.locator('#order a[href^="https://wa.me/"]');
  expect(await chat.count(), "WhatsApp links in the order band").toBeGreaterThan(0);
  await expect(chat.first()).toHaveAttribute("rel", /noopener/);

  const instagram = page.locator('footer a[href*="instagram.com"]');
  await expect(instagram).toHaveCount(1);
  await expect(instagram).toHaveAttribute("rel", /noopener/);

  // No link anywhere on the page may be a bare "#": it looks like a link,
  // focuses like a link, and jumps the reader to the top of the page.
  const deadLinks = await page
    .locator('a[href="#"]')
    .evaluateAll((els) => els.map((el) => (el.textContent ?? "").trim()));
  expect(deadLinks, "links pointing at #").toEqual([]);

  expect(await brokenImages(page), "images failing to load").toBe(0);
  expect(await overflowsHorizontally(page), "horizontal overflow").toBe(false);
  expect(failed, "failed requests").toEqual([]);
  expect(consoleErrors, "console errors").toEqual([]);
});

test("every route carries its own metadata, under the deployed base path", async ({ page }) => {
  const routes = [
    "/",
    "/products/",
    "/gallery/",
    "/about/",
    "/products/ghottab/",
    "/products/nabat-zafarani/",
  ];

  const seen = new Map<string, string[]>();

  for (const route of routes) {
    await page.goto(`${BASE}${route}`);

    const meta = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    }));

    expect(meta.title, `${route} title`).toBeTruthy();
    expect(meta.description, `${route} description`).toBeTruthy();

    // og:title was set once in the root layout and inherited by every route, so
    // a shared link to any page previewed as the homepage.
    expect(meta.ogTitle, `${route} og:title matches the page title`).toBe(meta.title);

    /**
     * This is a demonstration for a brand that does not exist, and on GitHub
     * Pages a `robots.txt` under a subpath is never read by a crawler — only
     * the origin root is. So the meta tag is the thing that actually keeps
     * this template out of a search for شیرینی, and it is asserted per route
     * rather than once.
     */
    expect(meta.robots, `${route} robots meta`).toMatch(/noindex/);

    // The canonical has to carry the base path. `configure-pages` reports the
    // origin and the base path as two separate values, and a canonical built
    // from the origin alone points at someone else's site — which actively
    // tells a search engine to index that one instead of this one.
    for (const [name, value] of [
      ["canonical", meta.canonical],
      ["og:url", meta.ogUrl],
      ["og:image", meta.ogImage],
    ] as const) {
      expect(value, `${route} ${name} is absolute`).toMatch(/^https?:\/\//);
      if (BASE) expect(value, `${route} ${name} carries the base path`).toContain(`${BASE}/`);
    }

    expect(new URL(meta.canonical!).pathname, `${route} canonical points at itself`).toBe(
      `${BASE}${route}`,
    );

    for (const [field, value] of Object.entries(meta)) {
      if (field === "ogImage" || field === "robots") continue; // shared on purpose
      const list = seen.get(field) ?? [];
      expect(list, `${route} ${field} is unique across routes`).not.toContain(value);
      list.push(value as string);
      seen.set(field, list);
    }
  }
});

test("the sitemap and robots.txt are exported, and robots closes the site", async ({ page }) => {
  const sitemap = await page.request.get(`${BASE}/sitemap.xml`);
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();

  // Every exported route must be listed, and every entry absolute — a relative
  // <loc> is invalid in a sitemap and is dropped silently.
  for (const route of ["/", "/products/", "/gallery/", "/about/", "/products/ghottab/"]) {
    expect(xml, `sitemap lists ${route}`).toContain(`${BASE}${route}</loc>`);
  }
  expect(xml.match(/<loc>/g)?.length, "sitemap entry count").toBe(13);
  expect(xml, "no relative loc").not.toMatch(/<loc>\//);
  expect(xml, "the 404 is not advertised").not.toContain("/404");

  const robots = await page.request.get(`${BASE}/robots.txt`);
  expect(robots.status()).toBe(200);
  const text = await robots.text();

  // Disallowed, and deliberately not advertising a sitemap — pointing a
  // crawler at a map of pages it is told not to fetch is a mixed signal.
  expect(text, "robots disallows everything").toMatch(/Disallow:\s*\/\s*$/m);
  expect(text, "robots advertises no sitemap").not.toContain("Sitemap:");
});

test("structured data parses and claims nothing invented", async ({ page }) => {
  await page.goto(`${BASE}/products/nabat-zafarani/`);

  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.map((el) => el.textContent ?? ""));
  expect(blocks.length, "Organization + Product").toBe(2);

  const parsed = blocks.map((b) => JSON.parse(b) as Record<string, unknown>);
  const product = parsed.find((p) => p["@type"] === "Product")!;
  const organization = parsed.find((p) => p["@type"] === "Organization")!;

  expect(product.name).toBe("نبات زعفرانی");
  expect(String(product.url)).toContain(`${BASE}/products/nabat-zafarani/`);

  /**
   * The point of the schema file: it must stay a mapping of data that exists.
   * `offers` and a rating are what a generator would invent to earn a rich
   * result, and this site has no commerce and no reviews at all.
   *
   * `nutrition`, `suitableForDiet` and any allergen field are a harder line
   * than the rest. Schema.org has slots for all of them, a food brand is
   * exactly the case where a generator would fill them in, and a reader who
   * acts on a false one is not merely misinformed. Nobody supplied any of it,
   * so none of it is asserted anywhere — in the markup or in the data.
   */
  for (const field of [
    "offers",
    "aggregateRating",
    "review",
    "sku",
    "gtin",
    "nutrition",
    "suitableForDiet",
    "hasAllergen",
    "award",
  ]) {
    expect(product[field], `Product must not assert ${field}`).toBeUndefined();
  }

  // The social handles are `.example` placeholders; sameAs would claim the
  // brand owns accounts that do not resolve.
  expect(organization.sameAs, "Organization must not assert sameAs").toBeUndefined();
});

/**
 * Found in an earlier full-site pass, which was the only pass that ever left
 * the mobile menu by a route rather than by the close button.
 *
 * Four of the six internal controls in the panel carried `onClick={onClose}`.
 * The lockup and the CTA did not — and `Button` accepted an `onClick` it then
 * dropped for links, so even passing one would not have helped. Tapping either
 * navigated underneath a panel that stayed over the whole screen with
 * `body { overflow: hidden }` still set, stranding a phone visitor on the
 * site's primary mobile call to action.
 *
 * Asserted for every control rather than for the two that were broken: the
 * defect is one control forgetting, so the check has to be the whole set.
 */
test("every control that leaves the mobile menu closes it", async ({ page }, testInfo) => {
  // The toggle is `lg:hidden`; above that breakpoint the panel is not part of
  // the interface at all, so this is a mobile-project test by nature.
  test.skip(
    (testInfo.project.use.viewport?.width ?? 0) >= 1024,
    "the mobile panel does not exist at desktop widths",
  );

  await page.goto(`${BASE}/`);

  const panel = page.locator(".menu-panel");
  const internal = page.locator('.menu-panel a[href^="/"]');

  await page.locator(".menu-toggle").first().click();
  await expect(panel).toHaveAttribute("data-open", "true");
  const count = await internal.count();
  expect(count, "the panel's own links").toBeGreaterThan(3);

  for (let i = 0; i < count; i += 1) {
    await page.goto(`${BASE}/`);
    await page.locator(".menu-toggle").first().click();
    await expect(panel).toHaveAttribute("data-open", "true");

    const href = await internal.nth(i).getAttribute("href");
    await internal.nth(i).click();

    await expect(panel, `${href} left the panel open`).toHaveAttribute("data-open", "false");
    // The panel locks page scrolling while it is open; a panel that closes
    // without releasing that lock leaves a page nobody can scroll.
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflow), {
        message: `${href} left the page scroll-locked`,
      })
      .not.toBe("hidden");
  }
});

test("an unknown path serves the styled 404", async ({ page }) => {
  const response = await page.goto(`${BASE}/definitely-not-a-page/`);

  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("این نشانی وجود ندارد");
});

/**
 * A form with nowhere to post is worse than no form: on a static host the
 * browser falls back to a GET at the current URL, so the page reloads, the
 * scroll position is lost, and whatever the visitor typed — an email address,
 * here — is written into the URL and therefore into history and any outgoing
 * referrer. The template this engine came from shipped exactly that until its
 * final pass measured it. A form is permitted only when it posts to a real
 * third-party backend, so this asserts the site has no form resolving to
 * neither.
 *
 * There is also no price and no cart anywhere, for the same reason there is no
 * form: nothing behind the site could take an order.
 */
test("no route carries a form that submits nowhere", async ({ page }) => {
  const routes = ["/", "/products/", "/gallery/", "/about/", "/products/ghottab/"];

  for (const route of routes) {
    await page.goto(`${BASE}${route}`);

    const dead = await page.evaluate(() =>
      [...document.querySelectorAll("form")]
        .filter((f) => {
          const action = f.getAttribute("action");
          return action === null || action === "" || action === "#";
        })
        .map((f) => f.className || "(no class)"),
    );

    expect(dead, `${route} has a form posting nowhere`).toEqual([]);
  }
});

/**
 * The red line on confectionery copy, asserted against the rendered text of
 * every route rather than against the content files — the point is that no
 * such phrase reaches a reader, by any path, including one composed at render
 * time.
 *
 * Describing what a sweet is made of is fine. An allergen or dietary-safety
 * claim is not, in either direction: «بدون گلوتن» on something containing
 * wheat is the dangerous case, and a reader who avoids nuts acting on a
 * «بدون آجیل» label that nobody verified is the same failure. Health,
 * nutrition, certification and award claims are forbidden on the same grounds
 * — they are statements a reader can act on that no one supplied.
 */
test("no route makes an allergen, dietary, health or certification claim", async ({ page }) => {
  const routes = [
    "/",
    "/products/",
    "/gallery/",
    "/about/",
    "/products/ghottab/",
    "/products/baghlava/",
    "/products/nabat-zafarani/",
  ];

  const forbidden = [
    "بدون گلوتن",
    "بدون آجیل",
    "بدون شکر",
    "بدون لاکتوز",
    "رژیمی",
    "سالم",
    "کالری",
    "ارگانیک",
    "حلال",
    "گواهی",
    "استاندارد",
    "برنده",
    "رتبه",
    "اصیل",
  ];

  for (const route of routes) {
    await page.goto(`${BASE}${route}`);
    const text = await page.evaluate(() => document.body.innerText);

    for (const phrase of forbidden) {
      expect(text.includes(phrase), `${route} contains «${phrase}»`).toBe(false);
    }
  }
});
