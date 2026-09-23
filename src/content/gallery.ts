import type { GalleryItem } from "@/types/content";
import { photo } from "./media";

/**
 * PLACEHOLDER CONTENT.
 *
 * The gallery draws on the same eight photographic slots the rest of the site
 * uses — six items and two close views — rather than asking for a second
 * shoot. That is the point of the pattern system: the page is dense because
 * of geometry, so the photography can stay a small, single, consistent set.
 *
 * `weight` is what makes this wall uneven, and it is the one place on the site
 * where the family's uniformity rule is deliberately suspended. Everywhere
 * else a frame that changes per item reads as a mistake; here the mixed sizes
 * *are* the composition. It is content rather than code because the sequence
 * and the emphasis are an editor's decision, the same way the order is.
 *
 * `category` is kept to a small controlled vocabulary rather than free text,
 * because it is the axis a future gallery filter would use.
 */
export const galleryItems: GalleryItem[] = [
  {
    id: "g-01",
    title: "نبات زعفرانی",
    category: "شیرینی",
    caption: "کریستال درشت، روی چوب",
    image: photo("p-05", "کریستال‌های نبات زعفرانی روی چوب"),
    order: 1,
    weight: "lg",
  },
  {
    id: "g-02",
    title: "قطاب",
    category: "شیرینی",
    image: photo("p-01", "نیم‌دایره‌های قطاب با پودر قند"),
    order: 2,
    weight: "sm",
  },
  {
    id: "g-03",
    title: "نان خامه‌ای",
    category: "شیرینی",
    caption: "در ساعت سفارش پُر می‌شود",
    image: photo("p-03", "نان خامه‌ای پُرشده با خامه و پودر قند"),
    order: 3,
    weight: "md",
  },
  {
    id: "g-04",
    title: "لبهٔ خامه",
    category: "نمای نزدیک",
    image: photo("v-01", "نمای نزدیک از خامه بین دو نیمهٔ پوستهٔ نان خامه‌ای"),
    order: 4,
    weight: "sm",
  },
  {
    id: "g-05",
    title: "پولکی",
    category: "شیرینی",
    caption: "زعفران و دارچین، جدا از هم",
    image: photo("p-06", "ورق‌های نازک پولکی در دو رنگ"),
    order: 5,
    weight: "md",
  },
  {
    id: "g-06",
    title: "رولت گلاب",
    category: "شیرینی",
    image: photo("p-04", "برش‌های رولت گلاب با نقش پیچ خامه"),
    order: 6,
    weight: "lg",
  },
  {
    id: "g-07",
    title: "نان برنجی",
    category: "شیرینی",
    image: photo("p-02", "قطعه‌های گرد نان برنجی با خال خشخاش"),
    order: 7,
    weight: "sm",
  },
  {
    id: "g-08",
    title: "وجه‌های نبات",
    category: "نمای نزدیک",
    caption: "بازتاب نور روی کریستال",
    image: photo("v-02", "نمای نزدیک از وجه‌های کریستال نبات و بازتاب نور"),
    order: 8,
    weight: "md",
  },
];

export const sortedGallery = [...galleryItems].sort((a, b) => a.order - b.order);
