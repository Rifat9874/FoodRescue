// Built-in food image gallery (files live in /public/images/food). Data comes from gallery.json,
// which is written by scripts/generate-gallery.mjs and updated by scripts/fetch-photos.mjs.
import data from "./gallery.json";

export const GALLERY = data;

export const GALLERY_PATHS = GALLERY.map((image) => image.src);

// Gallery images that fit a category (used by the listing form).
export const galleryFor = (category) => GALLERY.filter((image) => image.category === category);
