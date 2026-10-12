"use client";
import { useState } from "react";
import { GALLERY, galleryFor } from "@/lib/gallery";

// Lets a donor pick a photo from the built-in food gallery (no links or uploads needed).
export default function GalleryPicker({ category, value, onChange }) {
  const [showAll, setShowAll] = useState(false);
  const suggested = galleryFor(category);
  const images = showAll || suggested.length === 0 ? GALLERY : suggested;
  const isExternal = value && !GALLERY.some((image) => image.src === value);

  return (
    <div className="gallery-picker">
      <div className="row">
        <span className="hint">
          {showAll ? "All gallery images" : `Suggested for ${category}`} · tap to choose
        </span>
        <div className="gap">
          {value && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange("")}>No image</button>}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show suggested" : "Browse all images"}
          </button>
        </div>
      </div>
      <div className="gallery-grid" role="group" aria-label="Food image gallery">
        {images.map((image) => (
          <button
            type="button"
            key={image.id}
            className="gallery-item"
            aria-pressed={value === image.src}
            aria-label={image.label}
            onClick={() => onChange(image.src)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt="" loading="lazy" />
            <span>{image.label}</span>
          </button>
        ))}
      </div>
      {isExternal && <p className="hint">This listing uses an external image. Choose one above to replace it.</p>}
    </div>
  );
}
