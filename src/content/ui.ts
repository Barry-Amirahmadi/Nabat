import type { UiStrings } from "@/types/content";

/**
 * Interface strings — accessible names, and the few words the UI says on its
 * own behalf rather than the brand's.
 *
 * Separate from `sections.ts` because the two are edited by different people
 * for different reasons: that file is the copy deck a brand rewrites, this one
 * is what the interface is called.
 *
 * Most of these are read only by a screen reader. That is not a reason to
 * leave them in the markup: a hardcoded string is one no editor and no
 * translator can reach, and a mistyped path here does not throw and does not
 * render visibly wrong — the control still draws, still works, and simply
 * stops announcing itself. The smoke suite checks every visible control has a
 * non-empty name for exactly that reason.
 */
export const ui: UiStrings = {
  skipToContent: "پرش به محتوای اصلی",

  nav: {
    primary: "پیمایش اصلی",
    footer: "پیمایش پانوشت",
    /** Follows the brand name: «نبات — صفحهٔ اصلی». */
    home: "صفحهٔ اصلی",
    openMenu: "گشودن فهرست",
    closeMenu: "بستن فهرست",
    menuDialog: "فهرست اصلی",
  },

  gallery: {
    lightbox: "نمای بزرگ تصویر",
    close: "بستن نمای بزرگ",
    previous: "تصویر قبلی",
    next: "تصویر بعدی",
    /** Between position and total: «۳ از ۸». */
    counterJoin: "از",
  },
};
