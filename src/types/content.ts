/**
 * Content model.
 *
 * These types are the contract between the UI and whatever supplies content.
 * Today the supplier is a set of TypeScript files under `src/content`; the
 * components read only from these shapes, and every field below maps to a CMS
 * field. See `docs/CMS-INTEGRATION-PLAN.md`.
 *
 * Two changes from the editorial template this engine came from:
 *
 * - **`views` is new.** A product may carry extra photographs beyond its
 *   primary one. `image` stays required and unchanged, so nothing that reads
 *   a product has to handle the absent case.
 * - **`ProductLayout` is gone.** It described which of four spreads a product
 *   took in an editorial row. This site presents its nine items as a rotated
 *   tile grid whose angles and overlaps are fixed positional constants in the
 *   component — the same reason the rotation values are not random: a layout
 *   that cannot be reproduced between two builds cannot be reviewed. Keeping
 *   an unused presentation field in the model would have been a field a CMS
 *   editor could fill and nothing would read.
 */

/** Fixed aspect ratios. Crops are part of the art direction, not per-image
 *  guesswork — an editor picks one, never a raw pixel size. */
export type Ratio = "1/1" | "4/5" | "3/4" | "4/3" | "8/5" | "16/9";

export interface MediaAsset {
  /** Path today, CMS asset URL later. */
  src: string;
  /** Describes the picture for someone who cannot see it. Never the filename. */
  alt: string;
  ratio: Ratio;
  /** Optional editorial caption shown under or over the image. */
  caption?: string;
}

export interface Product {
  id: string;
  /** URL segment — /products/[slug]. */
  slug: string;
  /** Persian product name. */
  name: string;
  /** Latin transliteration, used only as a small second line. */
  latin: string;
  /** Persian group label, e.g. «قند و نبات». */
  category: string;
  /** Short Persian description — one line, used wherever the item is listed. */
  description: string;
  /** Detail-page copy. All optional: an item can be published with nothing but
   *  the fields above, and the detail page degrades to the listing copy. */
  statement?: string;
  /** Body paragraphs. An array so the editor controls the breaks, not a regex. */
  body?: string[];
  /**
   * Key information, as label/value pairs rather than a fixed schema, rendered
   * as four coloured chips.
   *
   * Every value restates something the item's own copy already says. There is
   * deliberately no allergen row, no dietary row, no nutrition row and no
   * shelf life: those are the claims a reader could act on and be harmed by,
   * and none of them has been supplied by anybody.
   */
  details?: { label: string; value: string }[];
  /**
   * **Repurposed for this site.** In the editorial template this was a colour
   * driving an ambient wash. Here it is the key of the item's *group* — it
   * selects the plate colour and the pattern geometry the item is presented
   * with, so an item and its group header cannot drift apart into two
   * different colours. See `resolveProducts()` for the fallback.
   */
  tone?: GroupKey;
  image: MediaAsset;
  /** Extra photographs. Two of the nine items have one; the rest have none. */
  views?: MediaAsset[];
  status: "published" | "draft";
  seo?: {
    title?: string;
    description?: string;
  };
}

/**
 * The three groups the collection is organised into.
 *
 * A closed union rather than free text: this key selects a plate colour and a
 * pattern, so a typo would silently fall back instead of failing, and the
 * fallback would put an item in the wrong group's colour.
 */
export type GroupKey = "khoshk" | "tar" | "ghand";

/** Plate hue and pattern geometry for one group. */
export interface GroupStyle {
  /** Plate modifier class suffix — a token name from tokens.css. */
  plate: "zafaran" | "golab" | "lajvard" | "anar" | "pesteh";
  pattern: "tile" | "border" | "dots" | "arch";
}

export interface ProductGroup {
  key: GroupKey;
  /** Persian group name, e.g. «خشک و مغزدار». */
  name: string;
  /** One line about the group, shown on its block. */
  line: string;
}

/**
 * A product with every presentation field guaranteed to be present.
 *
 * `Product` is the *authoring* shape, where presentation fields may be absent;
 * `ResolvedProduct` is the *rendering* shape, where they never are. Keeping the
 * two separate means no component ever carries a `?? fallback`, and the
 * defaulting rules live in exactly one place.
 */
export interface ResolvedProduct extends Product {
  tone: GroupKey;
}

export interface GalleryItem {
  id: string;
  title: string;
  /** Persian category label — the axis a future gallery filter uses. */
  category: string;
  caption?: string;
  image: MediaAsset;
  /** Manual sort position, as an editor would set it. */
  order: number;
  /**
   * Tile weight in the gallery grid. The gallery is the one route where the
   * family's uniformity rule is deliberately suspended, so this is content:
   * an editor sequencing the wall decides which pictures get the room.
   */
  weight: "sm" | "md" | "lg";
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteContent {
  brand: {
    name: string;
    latin: string;
    /** One line, used in the footer and as the meta description base. */
    line: string;
  };
  seo: {
    /** The homepage <title>, and the fallback for any route without its own. */
    title: string;
    /** `%s` is the route's own title. */
    titleTemplate: string;
    description: string;
    /** The share card. `src` is root-relative; the absolute URL is composed
     *  at build time, because Open Graph requires one. */
    ogImage: { src: string; alt: string; width: number; height: number };
  };
  nav: NavItem[];
  headerCta: NavItem;
  contact: {
    city: string;
    /** Display string, in Persian digits. */
    phone: string;
    /** Dial string, in Latin digits. Kept separate: Persian digits are not
     *  matched by \d, so a tel: href cannot be derived from `phone`. */
    phoneHref: string;
    /** WhatsApp click-to-chat number, Latin digits only, no punctuation. */
    whatsapp: string;
    /** Street line of the fictional address. */
    address: string;
    /** Opening hours, as a display string in Persian digits. */
    hours: string;
    email: string;
    instagram: { handle: string; href: string };
  };
  social: NavItem[];
  legal: NavItem[];
  footer: {
    navHeading: string;
    contactHeading: string;
  };
  copyright: string;
}

/* -------------------------------------------------------------------------- */
/*  Section copy                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Every band and every page opens the same way: a micro-label, a heading, and
 * a lead paragraph. Declared once here so the shape is a contract rather than
 * a convention the next section might quietly not follow.
 */
export interface SectionIntro {
  eyebrow: string;
  heading: string;
  lead: string;
}

/** Per-route metadata, on the section that owns the route. */
export interface SeoFields {
  title: string;
  description: string;
}

/** Home band 1 — the poster. Not a hero: no image-led masthead, no lead
 *  paragraph, a two-line claim and three sticker badges. */
export interface PosterContent {
  /** Two lines, 5–8 words each. An array so the break is the editor's. */
  claim: string[];
  /** Three sticker badges, 2–3 words each. */
  badges: string[];
  primary: NavItem;
  secondary: NavItem;
  /** The one photograph on the band, offset over the band below. */
  image: MediaAsset;
}

/** Home band 2 — the nine tiles. */
export interface BoxContent extends SectionIntro {
  /** Label on each tile's link through. */
  linkLabel: string;
  allLabel: string;
  allHref: string;
}

/** Home band 3 — pure pattern, one short line reversed out of it. */
export interface PatternBreakContent {
  line: string;
}

/** Home band 4 — the three groups. */
export interface GroupsContent extends SectionIntro {
  linkLabel: string;
  groups: ProductGroup[];
}

/** Home band 5 — the order band. The site's conversion point. */
export interface OrderContent {
  eyebrow: string;
  heading: string;
  lead: string;
  labels: { phone: string; whatsapp: string; hours: string; address: string };
}

export interface CollectionContent extends SectionIntro {
  /** Accessible name of the group index, which is a navigation landmark. */
  indexLabel: string;
  /** Accessible name of the item list itself. */
  listLabel: string;
  /** Follows the rendered count, e.g. «۹ شیرینی». */
  countLabel: string;
  seo: SeoFields;
}

export interface ProductPageContent {
  detailsHeading: string;
  viewsHeading: string;
  relatedEyebrow: string;
  relatedHeading: string;
  backLabel: string;
  breadcrumbHome: string;
  breadcrumbCollection: string;
  breadcrumbLabel: string;
}

export interface InquiryContent {
  label: string;
  /** `{product}` is substituted with the product name at render time. */
  message: string;
  /** The same channel with no item in hand. */
  generalLabel: string;
  generalMessage: string;
  /** Appended for screen readers to any link that leaves the site. */
  newWindow: string;
}

/**
 * The gallery route.
 *
 * There is no gallery band on the homepage — the five bands are the poster,
 * the box, the pattern break, the three groups and the order band — so unlike
 * the editorial template there is only one gallery surface and only one set of
 * gallery copy. `viewLabel` lives here rather than in a second interface for a
 * homepage band that does not exist.
 */
export interface GalleryPageContent extends SectionIntro {
  /** Accessible name of each tile's zoom button. */
  viewLabel: string;
  seo: SeoFields;
}

export interface AboutContent extends SectionIntro {
  /** Four paragraphs. An array so the editor controls the breaks. */
  body: string[];
  /** Pull-quote plates that break the column. One sentence each, ≤12 words. */
  quotes: string[];
  seo: SeoFields;
}

export interface NotFoundContent {
  eyebrow: string;
  heading: string;
  lead: string;
  action: NavItem;
}

/* -------------------------------------------------------------------------- */
/*  Interface strings                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Accessible names, and the few words the interface says on its own behalf
 * rather than the brand's.
 *
 * Modelled for the same reason the copy deck is: a string a component
 * hardcodes is a string no editor and no translator can reach. Most of these
 * are read only by a screen reader, which is not a reason to leave them in the
 * markup.
 */
export interface UiStrings {
  /** First focusable element on every page. */
  skipToContent: string;
  nav: {
    primary: string;
    footer: string;
    /** Trailing half of the wordmark's accessible name, after the brand name. */
    home: string;
    openMenu: string;
    closeMenu: string;
    menuDialog: string;
  };
  gallery: {
    lightbox: string;
    close: string;
    previous: string;
    next: string;
    /** Joins position and total, e.g. «۳ از ۶». */
    counterJoin: string;
  };
}
