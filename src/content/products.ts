import type { Product } from "@/types/content";
import { photo, plate } from "./media";
import { resolveProducts } from "./resolveProducts";

/**
 * PLACEHOLDER CONTENT — a fictional confectionery brand.
 *
 * The items are named with the ordinary Persian names of Persian sweets, and
 * every line of copy describes either what is in the sweet or what to drink
 * with it. That boundary is deliberate and it is the content-honesty rule of
 * this project in practice:
 *
 * - **Describing components is fine.** «مغز گردو و دارچین» says what is in a
 *   fictional sweet.
 * - **Allergen and dietary claims are forbidden outright**, at any level of
 *   hedging, because a reader can act on one and the consequence is medical.
 *   That is also why the `مغز` row on every item states what *is* in it and
 *   never what is absent — «بدون مغز» would read as a nut-free label, and a
 *   false nut-free label is the single most dangerous string this site could
 *   contain. Nine items, nine positive statements, no exceptions.
 * - **No health, nutrition, certification, halal, award or ranking claim**, no
 *   «اصیل» asserted as fact, no named supplier, no shelf life.
 * - **No number that measures reality.** No years in business, no orders, no
 *   rating, no customer count. The only counts on the site are rendered from
 *   this array, so they cannot go stale or overclaim.
 *
 * `tone` is the item's group key — see `src/content/groups.ts` for what it
 * selects and why it replaced a per-item colour.
 *
 * **Three of the nine carry no photograph**: باقلوا, بامیه and سوهان, one from
 * each group so no group looks under-served. Their tile is pattern and type
 * only, and their `image` is a decorative pattern plate with an empty `alt`
 * rather than a picture. Every image is 1:1 — the whole set is shot to one
 * square standard, which is what a confectionery catalogue actually looks
 * like and what makes nine unrelated sweets read as one box.
 */
export const products: Product[] = [
  /* ---- خشک و مغزدار ----------------------------------------------------- */
  {
    id: "i-ghottab",
    slug: "ghottab",
    name: "قطاب",
    latin: "GHOTTAB",
    category: "خشک و مغزدار",
    description: "نیم‌دایرهٔ سرخ‌شده با مغز گردو و دارچین، ترد از بیرون و نرم از درون.",
    statement:
      "قطاب برای لحظه‌ای نوشته شد که چای تازه دم کشیده است. نیم‌دایره‌ای کوچک، ترد، با مغزی که بوی دارچین می‌دهد.",
    body: [
      "قطاب را کوچک می‌بریم تا در دو گاز تمام شود. اندازه تصمیم اول است و بقیهٔ چیزها را تعیین می‌کند: مغز کمتر می‌شود، پوسته نازک‌تر می‌ماند و شیرینی به‌جای آنکه روی زبان بنشیند، سریع می‌رود و جا را به چای می‌دهد.",
      "پودر قند روی رو را در همان ساعتی می‌پاشیم که جعبه بسته می‌شود. اگر زودتر پاشیده شود، رطوبت پوسته آن را می‌خورد و رنگ یکدست سفید از بین می‌رود. این یکی از آن کارهایی است که ترتیبش مهم‌تر از خودش است.",
    ],
    details: [
      { label: "مغز", value: "گردو و دارچین" },
      { label: "شیرینی", value: "ملایم" },
      { label: "بافت", value: "ترد" },
      { label: "همراه", value: "چای تازه" },
    ],
    tone: "khoshk",
    image: photo("p-01", "قطاب نبات، نیم‌دایره‌های کوچک با پودر قند روی سطحی کرم‌رنگ"),
    status: "published",
  },
  {
    id: "i-nan-berenji",
    slug: "nan-berenji",
    name: "نان برنجی",
    latin: "NAN BERENJI",
    category: "خشک و مغزدار",
    description: "آرد برنج و گلاب، نازک و لطیف، با خال خشخاش روی رو.",
    statement:
      "نان برنجی نازک‌ترین شیرینی جعبه است. آرد برنج به آن بافتی می‌دهد که زیر انگشت می‌شکند، پس آن را در لایهٔ پایین جعبه نمی‌گذاریم.",
    body: [
      "گلاب در این یکی بیشتر از بقیه حس می‌شود، چون چیز دیگری نیست که آن را بپوشاند. آرد برنج طعم خودش را تحمیل نمی‌کند و همین باعث می‌شود هر چه اضافه کنید شنیده شود — که هم فرصت است و هم دلیلِ اینکه فهرست مواد کوتاه مانده.",
      "خال خشخاش روی رو تزئین نیست؛ نشانهٔ جهت است. سطح صاف نان برنجی هنگام چیدن در جعبه تشخیص رو و پشت را سخت می‌کند، و خال به کسی که جعبه را می‌بندد می‌گوید کدام طرف باید بالا بماند.",
    ],
    details: [
      { label: "مغز", value: "خشخاش" },
      { label: "شیرینی", value: "ملایم" },
      { label: "بافت", value: "نازک و شکننده" },
      { label: "همراه", value: "چای کم‌رنگ" },
    ],
    tone: "khoshk",
    image: photo("p-02", "نان برنجی نبات، قطعه‌های گرد و نازک با خال خشخاش روی سطحی کرم‌رنگ"),
    status: "published",
  },
  {
    id: "i-baghlava",
    slug: "baghlava",
    name: "باقلوا",
    latin: "BAGHLAVA",
    category: "خشک و مغزدار",
    description: "لایه‌های نازک با پستهٔ ساییده و شربت زعفران، بریده در لوزی‌های کوچک.",
    statement:
      "باقلوا شیرین‌ترین چیز جعبه است و می‌داند. آن را در لوزی‌های کوچک می‌بریم تا یک برش، یک تصمیم باشد نه یک تعهد.",
    body: [
      "تعداد لایه‌ها را کم نگه داشتیم. باقلوای بلند در جعبه می‌شکند و در بشقاب هم بریدنش با چنگال سخت است؛ لوزیِ کوتاه هر دو مشکل را ندارد و نسبت شربت به خمیر را هم قابل کنترل می‌کند.",
      "شربت را سرد روی خمیر گرم می‌ریزیم. اگر هر دو گرم باشند شربت تا ته می‌رود و لایه‌ها را می‌خواباند، و آنچه می‌ماند کیکِ خیس است نه باقلوا. اختلاف دما تنها چیزی است که لایه‌ها را لایه نگه می‌دارد.",
    ],
    details: [
      { label: "مغز", value: "پستهٔ ساییده" },
      { label: "شیرینی", value: "پُر" },
      { label: "بافت", value: "لایه‌لایه" },
      { label: "همراه", value: "چای پررنگ" },
    ],
    tone: "khoshk",
    /* No photograph. The tile is pattern and type only — see the note above. */
    image: plate("plate-baghlava"),
    status: "published",
  },

  /* ---- تر و خامه‌ای ------------------------------------------------------ */
  {
    id: "i-nan-khamei",
    slug: "nan-khamei",
    name: "نان خامه‌ای",
    latin: "NAN KHAMEI",
    category: "تر و خامه‌ای",
    description: "پوستهٔ پفکی با خامهٔ سرد، پودر قند روی رو، در ساعت سفارش پُر می‌شود.",
    statement:
      "نان خامه‌ای را از قبل پُر نمی‌کنیم. پوستهٔ پفکی تا وقتی خالی است ترد می‌ماند، و خامه همان چیزی است که این تردی را از بین می‌برد.",
    body: [
      "پوسته و خامه دو کار جدا هستند که فقط در آخرین دقیقه به هم می‌رسند. پوسته را صبح می‌پزیم و بی‌درپوش می‌گذاریم تا رطوبت خودش را بدهد؛ خامه را سرد نگه می‌داریم و هم نمی‌زنیم تا لحظه‌ای که سفارش روی میز است.",
      "پودر قند آخرین مرحله است و مقدارش کم. روی خامهٔ سرد، قند خیلی زود آب می‌شود و اگر زیاد باشد به‌جای سفیدی یکدست، لکه می‌شود. همین محدودیت باعث شد این شیرینی را در جعبهٔ بسته نفرستیم.",
    ],
    details: [
      { label: "مغز", value: "خامه" },
      { label: "شیرینی", value: "ملایم" },
      { label: "بافت", value: "پفکی و نرم" },
      { label: "همراه", value: "قهوه" },
    ],
    tone: "tar",
    image: photo("p-03", "نان خامه‌ای نبات، پوستهٔ پفکی پُرشده با خامه و پودر قند روی سطحی کرم‌رنگ"),
    views: [photo("v-01", "نمای نزدیک از لبهٔ نان خامه‌ای، خامه بین دو نیمهٔ پوسته")],
    status: "published",
  },
  {
    id: "i-rolet-golab",
    slug: "rolet-golab",
    name: "رولت گلاب",
    latin: "ROLET GOLAB",
    category: "تر و خامه‌ای",
    description: "کیک نرم پیچیده دور خامه و گلاب، برش‌خورده به قطرهای کوچک.",
    statement:
      "رولت گلاب نرم‌ترین چیز جعبه است. هر برش یک مقطع کامل از کار است، پس برش‌ها را نازک می‌زنیم تا نقش پیچ دیده شود.",
    body: [
      "کیک را وقتی داغ است می‌پیچیم. سرد که شود ترک می‌خورد، و ترک در رولت پنهان‌شدنی نیست چون درست همان جایی می‌افتد که قرار است نگاه کنید. این تنها مرحله‌ای است که در آن عجله لازم است.",
      "گلاب را به خامه اضافه می‌کنیم نه به کیک. در خمیر، گرمای فِر بیشترِ عطر را می‌برد و چیزی که می‌ماند مبهم است؛ در خامهٔ سرد همان مقدار کم، واضح می‌ماند و در مقطع برش هم بویش بلند می‌شود.",
    ],
    details: [
      { label: "مغز", value: "خامه و گلاب" },
      { label: "شیرینی", value: "ملایم" },
      { label: "بافت", value: "نرم" },
      { label: "همراه", value: "چای کم‌رنگ" },
    ],
    tone: "tar",
    image: photo("p-04", "رولت گلاب نبات، برش‌های نازک با نقش پیچ خامه روی سطحی کرم‌رنگ"),
    status: "published",
  },
  {
    id: "i-bamieh",
    slug: "bamieh",
    name: "بامیه",
    latin: "BAMIEH",
    category: "تر و خامه‌ای",
    description: "شیارهای سرخ‌شده در شربت زعفران و گلاب، از بیرون براق و از درون نرم.",
    statement:
      "بامیه را کوتاه می‌بریم. شیارها کارشان نگه‌داشتن شربت است و یک بامیهٔ بلند فقط شربت بیشتری می‌گیرد، نه طعم بیشتری.",
    body: [
      "شیار روی سطح، تصمیمی مهندسی است نه تزئینی. سطح صاف شربت را پس می‌زند و شیرینی روی آن نمی‌ماند؛ شیار همان مقدار شربت را در خودش نگه می‌دارد و باعث می‌شود گاز اول و گاز آخر یک اندازه شیرین باشند.",
      "شربت را در دو نوبت می‌دهیم. یک بار وقتی بامیه از روغن بیرون می‌آید و یک بار پس از خنک‌شدن، چون تمام شربت در یک نوبت فقط روی سطح می‌نشیند و می‌چکد. نوبت دوم است که بامیه را از بیرون براق می‌کند.",
    ],
    details: [
      { label: "مغز", value: "شربت زعفران و گلاب" },
      { label: "شیرینی", value: "پُر" },
      { label: "بافت", value: "نرم و شربتی" },
      { label: "همراه", value: "چای داغ" },
    ],
    tone: "tar",
    /* No photograph. */
    image: plate("plate-bamieh"),
    status: "published",
  },

  /* ---- قند و نبات ------------------------------------------------------- */
  {
    id: "i-nabat-zafarani",
    slug: "nabat-zafarani",
    name: "نبات زعفرانی",
    latin: "NABAT ZAFARANI",
    category: "قند و نبات",
    description: "کریستال درشت زعفرانی روی چوب، برای هم زدن در استکان چای.",
    statement:
      "نبات همان چیزی است که نام این جعبه از آن آمده. کریستال را درشت نگه می‌داریم تا آهسته حل شود و استکان دوم هم شیرین بماند.",
    body: [
      "کریستال درشت یعنی زمان. قند ریز در چند ثانیه می‌رود و چای یکدفعه شیرین می‌شود؛ کریستال درشت همان مقدار قند را در دو سه دقیقه می‌دهد، و همین است که هم زدن نبات را از شیرین‌کردن جدا می‌کند.",
      "زعفران را در آب قند دم می‌کنیم، نه روی کریستال آماده. رنگ اگر از بیرون بیاید در استکان اول پاک می‌شود و بقیهٔ چوب سفید می‌ماند؛ از داخل که بیاید، تا آخرین کریستال با آن است.",
    ],
    details: [
      { label: "مغز", value: "زعفران" },
      { label: "شیرینی", value: "خالص" },
      { label: "بافت", value: "کریستال درشت" },
      { label: "همراه", value: "استکان چای" },
    ],
    tone: "ghand",
    image: photo("p-05", "نبات زعفرانی نبات، کریستال‌های درشت زرد روی چوب، روی سطحی کرم‌رنگ"),
    views: [photo("v-02", "نمای نزدیک از کریستال‌های نبات زعفرانی و بازتاب نور روی وجه‌ها")],
    status: "published",
  },
  {
    id: "i-poolaki",
    slug: "poolaki",
    name: "پولکی",
    latin: "POOLAKI",
    category: "قند و نبات",
    description: "ورق‌های نازک و شکننده با زعفران یا دارچین، هر کدام اندازهٔ یک سکه.",
    statement:
      "پولکی نازک‌ترین شکل قند است. یک ورق برای یک استکان کافی است، و همین اندازه‌گیری، دلیل شکل سکه‌ای آن است.",
    body: [
      "نازکی کل ماجراست. ورق ضخیم در چای فرو می‌رود و ته استکان می‌ماند؛ ورق نازک روی سطح شکل خودش را از دست می‌دهد و پیش از رسیدن به قاشق حل شده است. ضخامت را با دست تنظیم نمی‌کنیم، با دمای قند.",
      "زعفران و دارچین را با هم در یک ورق نمی‌آوریم. هر دو در قندِ خالص واضح‌اند و کنار هم فقط همدیگر را گِل می‌کنند، پس هر ورق یکی از آن دو را دارد و جعبه هر دو را.",
    ],
    details: [
      { label: "مغز", value: "زعفران یا دارچین" },
      { label: "شیرینی", value: "خالص" },
      { label: "بافت", value: "نازک و شکننده" },
      { label: "همراه", value: "چای تلخ" },
    ],
    tone: "ghand",
    image: photo("p-06", "پولکی نبات، ورق‌های نازک گرد در دو رنگ روی سطحی کرم‌رنگ"),
    status: "published",
  },
  {
    id: "i-sohan",
    slug: "sohan",
    name: "سوهان",
    latin: "SOHAN",
    category: "قند و نبات",
    description: "برش گرد و کاراملی با خلال پسته و بادام، محکم زیر دندان.",
    statement:
      "سوهان سخت‌ترین چیز جعبه است و باید هم باشد. آن را نازک می‌بریم تا شکستنش تصمیم دندان نباشد.",
    body: [
      "کارامل تا یک دمای مشخص کشدار است و یک درجه بالاتر شکننده. سوهان را در همان مرز می‌گیریم: نه آن‌قدر نرم که به دندان بچسبد، نه آن‌قدر سخت که در جعبه خرد شود. این تنها جایی است که دماسنج از چشم مهم‌تر است.",
      "خلال را روی رو می‌پاشیم نه در مخلوط. داخل کارامل، پسته و بادام نرم می‌شوند و تفاوت بافت از دست می‌رود؛ روی سطح، هر برش هم سختی کارامل را دارد و هم تردی خلال را، که تمام حرفِ سوهان است.",
    ],
    details: [
      { label: "مغز", value: "خلال پسته و بادام" },
      { label: "شیرینی", value: "پُر" },
      { label: "بافت", value: "سخت و کاراملی" },
      { label: "همراه", value: "چای پررنگ" },
    ],
    tone: "ghand",
    /* No photograph. */
    image: plate("plate-sohan"),
    status: "published",
  },
];

/**
 * What the site renders: drafts filtered out, exactly as a CMS would, then
 * resolved so every item has a group.
 *
 * Filter before resolve, never after — the fallback is positional, so
 * resolving a list that still contains drafts would shift the group of
 * everything after the first hidden item.
 */
export const publishedProducts = resolveProducts(
  products.filter((p) => p.status === "published"),
);
