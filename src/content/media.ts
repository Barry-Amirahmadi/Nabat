import type { MediaAsset, Ratio } from "@/types/content";

/**
 * Where the eight photographic slots live, and the one constant that moves
 * them from placeholder to photograph.
 *
 * This site needs eight image files. Not fifty — the pattern system in
 * `src/components/pattern/Pattern.tsx` carries the visual load, so photography
 * is reserved for the six items that are actually shown and the two close
 * views. That is a design decision, not an omission.
 *
 * **`PHOTO_EXT` is the whole Phase B → Phase C swap.** Phase A ships generated
 * placeholders from `scripts/generate-media.mjs`, which are SVG because this
 * project has three runtime dependencies and none of them can encode a JPEG.
 * The real files arrive as `p-01.jpg … p-06.jpg`, `v-01.jpg`, `v-02.jpg` at
 * the same slot names, the same directory and the same 1:1 ratio. Changing
 * this one string is what points the site at them, and nothing else in the
 * content deck moves. An extension cannot be "the same path" across a vector
 * placeholder and a raster photograph, so it is spelled once here rather than
 * nine times across the products file.
 */
/** The two states this file switches between. */
type PhotoExt = "svg" | "jpg";

// Asserted rather than annotated. With a plain annotation TypeScript narrows a
// `const` to its initialiser, which makes the `=== "svg"` below an impossible
// comparison and fails `typecheck` — so the switch only compiled in one of its
// two positions, which is the one thing a switch must not do. `as PhotoExt`
// keeps the declared type wide so both positions build.
const PHOTO_EXT = "jpg" as PhotoExt;

/** True while the slots are still generated vector placeholders. Read by the
 *  image component, which must not hand an SVG to a raster optimiser. */
export const photosAreVector = PHOTO_EXT === "svg";

/** One of the eight photographic slots. */
export function photo(slot: string, alt: string, ratio: Ratio = "1/1"): MediaAsset {
  return { src: `/media/${slot}.${PHOTO_EXT}`, alt, ratio };
}

/**
 * A pattern plate — the stand-in for the three items that carry no photograph
 * at all, and the ground of the poster's offset image slot.
 *
 * Always SVG, permanently: these are geometry, and the Phase C swap does not
 * touch them. `alt` is empty because they are decorative — the item's name is
 * always adjacent in text, and describing a plate of geometry to a screen
 * reader as though it were a picture of a sweet would be a lie told quietly.
 * `productSchema()` reads that empty alt as "this is not a photograph of the
 * item" and omits the structured-data image rather than asserting one.
 */
export function plate(slot: string, ratio: Ratio = "1/1"): MediaAsset {
  return { src: `/media/${slot}.svg`, alt: "", ratio };
}
