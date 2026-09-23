import type {
  AboutContent,
  BoxContent,
  CollectionContent,
  GalleryPageContent,
  GroupsContent,
  InquiryContent,
  NotFoundContent,
  OrderContent,
  PatternBreakContent,
  PosterContent,
  ProductPageContent,
} from "@/types/content";
import { groups } from "./groups";
import { photo } from "./media";

/**
 * PLACEHOLDER CONTENT — the copy deck.
 *
 * Voice: loud, short, warm, second person. Not the editorial family's craft
 * register and not the Swiss one's specification register — this is a
 * confectioner shouting a short sentence at you from behind a glass counter.
 *
 * Nothing below states a fact about a real business, and nothing states a
 * claim a reader could act on: no allergen or dietary line, no health or
 * nutrition claim, no certification, no award, no ranking, no shelf life, no
 * number that measures reality.
 *
 * Words this family does not use: خلاق، حرفه‌ای، باتجربه، منحصربه‌فرد، پیشرو،
 * بهترین، باکیفیت. Words this site specifically does not use: سنتی as a
 * claim، اصیل، مادربزرگ، دست‌ساز with no explanation، طعم واقعی، خاطره‌انگیز.
 * Every one of them is a compliment the brand pays itself.
 *
 * TYPING RULE: every export is annotated with an interface from
 * `@/types/content`, never left to inference. An inferred type describes the
 * literal that happens to be written here; a declared one describes what any
 * source — this file, or a CMS response — has to provide. Only the second is
 * a contract.
 *
 * LINK RULE: every `href` is written from the site root — a route as
 * `/products/`, an in-page target as `/#order`. A bare `#order` resolves
 * against whatever page the component is rendered on, which is nothing at all
 * outside the homepage, and `next/link` applies the deployment base path only
 * to a root-relative href.
 */

/* ---- Home band 1 — POSTER ------------------------------------------------ */

export const poster: PosterContent = {
  claim: ["نُه شیرینی، سه دسته، یک جعبه", "هر دسته، رنگ خودش را دارد"],
  badges: ["زعفران و پسته", "جعبهٔ نُه‌تایی", "سفارش تلفنی"],
  primary: { label: "دیدن جعبه", href: "/products/" },
  secondary: { label: "سفارش", href: "/#order" },
  /**
   * The one photograph on the band, and it is the brand's namesake — the same
   * file the نبات زعفرانی item uses, with its own alt for its own context.
   * Eight image files exist in total; a ninth for the poster alone would be a
   * photograph shot to say what one of the six already says.
   */
  image: photo("p-05", "کریستال‌های نبات زعفرانی روی چوب، در نور روز"),
};

/* ---- Home band 2 — THE BOX ---------------------------------------------- */

export const box: BoxContent = {
  eyebrow: "جعبه",
  heading: "نُه شیرینی، کنار هم",
  lead: "هر شیرینی جای خودش را در جعبه دارد. برای دیدن جزئیات، وارد صفحهٔ آن شوید.",
  linkLabel: "دیدن شیرینی",
  allLabel: "صفحهٔ جعبه",
  allHref: "/products/",
};

/* ---- Home band 3 — PATTERN BREAK ---------------------------------------- */

/**
 * One line, on nothing but pattern. The band carries no product and no
 * photograph, which is the only reason it can be this loud.
 */
export const patternBreak: PatternBreakContent = {
  line: "نقش، پیش از طعم می‌رسد.",
};

/* ---- Home band 4 — THREE GROUPS ----------------------------------------- */

export const groupsBand: GroupsContent = {
  eyebrow: "سه دسته",
  heading: "جعبه از سه قسمت بسته می‌شود",
  lead: "خشک، تر، و قند. در هر قسمت سه شیرینی هست.",
  linkLabel: "دیدن دسته",
  /** The registry, not a second copy of it — a group's name is written once. */
  groups,
};

/* ---- Home band 5 — ORDER ------------------------------------------------ */

/**
 * The site's conversion point, and the whole of it. There is no cart, no
 * price and no form: a form needs a backend to post to, and one posting
 * nowhere reloads the page and writes whatever was typed into the URL and
 * therefore into history.
 */
export const order: OrderContent = {
  eyebrow: "سفارش",
  heading: "یک تماس، یک جعبه",
  lead: "سفارش را تلفنی یا در واتساپ می‌گیریم. چیدن جعبه با خودتان است.",
  labels: {
    phone: "تلفن",
    whatsapp: "واتساپ",
    hours: "ساعت کار",
    address: "نشانی",
  },
};

/* ---- /products/ --------------------------------------------------------- */

/**
 * Deliberately a different voice from `box` above. The homepage band presents
 * the nine as one object you are being handed; this page is the register of
 * what is in it, grouped, so it opens by describing the structure rather than
 * by arguing for it. Nothing here counts the items in prose — the count is
 * rendered from the data, so it cannot go stale.
 */
export const collection: CollectionContent = {
  eyebrow: "جعبه",
  heading: "همهٔ شیرینی‌ها، دسته به دسته",
  lead: "سه دسته، و در هر دسته سه شیرینی. ترتیب، همان ترتیب جعبه است.",
  indexLabel: "دسته‌های جعبه",
  listLabel: "شیرینی‌ها",
  countLabel: "شیرینی",
  seo: {
    title: "جعبه",
    description: "فهرست کامل نُه شیرینی نبات، در سه دسته: خشک و مغزدار، تر و خامه‌ای، قند و نبات.",
  },
};

/* ---- /products/[slug]/ -------------------------------------------------- */

export const productPage: ProductPageContent = {
  detailsHeading: "مشخصات",
  viewsHeading: "نمای نزدیک",
  relatedEyebrow: "ادامه",
  relatedHeading: "ادامهٔ جعبه",
  backLabel: "بازگشت به جعبه",
  breadcrumbHome: "صفحهٔ اصلی",
  breadcrumbCollection: "جعبه",
  breadcrumbLabel: "مسیر صفحه",
};

export const inquiry: InquiryContent = {
  label: "سفارش این شیرینی",
  /** `{product}` is replaced with the item name at render time. */
  message: "سلام. برای سفارش «{product}» پیام دادم.",
  generalLabel: "سفارش در واتساپ",
  generalMessage: "سلام. برای سفارش جعبه پیام دادم.",
  /** Appended for screen readers to any link that leaves the site. */
  newWindow: "در پنجرهٔ تازه باز می‌شود",
};

/* ---- /gallery/ ---------------------------------------------------------- */

export const galleryPage: GalleryPageContent = {
  eyebrow: "گالری",
  heading: "نقش‌ها و شیرینی‌ها، بزرگ",
  lead: "تصویرها در اندازه‌های مختلف چیده شده‌اند. برای تمام‌صفحه، روی هر کدام بزنید.",
  viewLabel: "بزرگ‌نمایی",
  seo: {
    title: "گالری",
    description: "تصویرهای جعبهٔ نبات — شیرینی‌ها، نقش‌ها و جزئیات نزدیک.",
  },
};

/* ---- /about/ ------------------------------------------------------------ */

/**
 * Short on purpose. There is no founding year, no founder, no shop history,
 * no «since» — none of that has been supplied, and a portfolio piece that
 * invents a company history to fill an about page is telling the same kind of
 * lie as a fabricated certification, just in prose.
 *
 * What is written here is *position*: why the box is the size it is. That is
 * something a brand can assert about itself.
 */
export const about: AboutContent = {
  eyebrow: "دربارهٔ نبات",
  heading: "چرا جعبه نُه‌تایی است",
  lead: "جعبه نُه خانه دارد و قرار نیست بزرگ‌تر شود. دلیلش را اینجا نوشته‌ایم.",
  body: [
    "نُه عدد دلخوشی نیست؛ اندازهٔ چیزی است که می‌شود با هم خورد. سه نفر دور یک میز، هر کس سه بار دست می‌برد و جعبه تمام می‌شود. هر عددی بزرگ‌تر از این یعنی نیمی از جعبه فردا خورده می‌شود، و شیرینیِ فردا شیرینیِ دیگری است.",
    "سه دسته هم از همین می‌آید. خشک و مغزدار برای وقتی چای تازه دم کشیده، تر و خامه‌ای برای همان ساعت و نه بعدش، قند و نبات برای استکانی که هنوز داغ است. سه ساعتِ متفاوت، سه بافت متفاوت، در یک جعبه.",
    "رنگ‌ها را از خود شیرینی‌ها برداشتیم، نه از یک تختهٔ رنگ. زعفران زرد است، انار سرخ، پسته سبز، گلاب صورتی. اگر این صفحه پُررنگ به نظر می‌رسد، به این خاطر است که پیشخان یک قنادی هم همین‌قدر پُررنگ است و ما آن را آرام نکردیم.",
    "نقش‌ها هم همین‌طور. کاشی هشت‌پر، حاشیهٔ قالی، طاق، و دانه‌های قند — چیزی که روی در جعبه چاپ می‌شود، اینجا پشت هر بخش نشسته است. هیچ‌کدام عکس نیستند؛ همه با خط و دایره کشیده شده‌اند، و همین است که این صفحه را سبک نگه می‌دارد.",
  ],
  /** Pull-quote plates that break the column. One sentence each, short. */
  quotes: [
    "جعبه به اندازهٔ یک میز است، نه یک هفته.",
    "رنگ‌ها را از شیرینی‌ها برداشتیم، نه از تختهٔ رنگ.",
  ],
  seo: {
    title: "دربارهٔ نبات",
    description: "چرا جعبهٔ نبات نُه خانه دارد، و رنگ‌ها و نقش‌ها از کجا آمده‌اند.",
  },
};

/* ---- /404 --------------------------------------------------------------- */

/**
 * Copy, like every other page's. A reader arrives here having already gone
 * wrong, so the page says what happened and offers exactly one way out rather
 * than a menu of guesses.
 */
export const notFound: NotFoundContent = {
  eyebrow: "صفحه پیدا نشد",
  heading: "این نشانی وجود ندارد",
  lead: "ممکن است نشانی تغییر کرده باشد. از صفحهٔ اصلی می‌توانید جعبه و گالری را ببینید.",
  action: { label: "بازگشت به صفحهٔ اصلی", href: "/" },
};
