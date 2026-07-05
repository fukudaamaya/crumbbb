## Goal

Simplify the photo section on `BakeDetail`: in the default (read-only) view, show a swipeable main photo with dot indicators and no thumbnails. All photo management (add, remove, reorder) is only available in edit mode.

## Changes (single file: `src/pages/BakeDetail.tsx`)

### 1. Default view — clean carousel with dots

- For `photos.length >= 1`, render the main image/carousel with **no thumbnail strip** and **no add tile**.
- Re-introduce dot indicators below the main photo, but **only when `photos.length >= 2`** (single photo needs no dots). Dots use the existing `bg-primary` / `bg-border` styling, tied to `currentSlide`.
- Tapping a dot scrolls the carousel to that slide (same behavior `ReorderStrip.onSelect` used).
- The zero-photo empty state ("Tap to add photo") stays as-is only when not in demo — matches current behavior.

### 2. Edit mode — thumbnails become the management surface

- When `editing` is true, render the `ReorderStrip` below the main photo (replacing the dots for that mode). This is where the user can:
  - Reorder by drag (existing behavior).
  - Tap a thumbnail to jump slides.
  - Tap the `+` add-tile to open the photo source sheet (unchanged).
  - Remove via the per-photo `X` button on the main image (already gated on `editing`, keep as-is).
- Outside edit mode, the `X` remove button and the `ReorderStrip` are both hidden — the photo section is purely presentational.

### 3. Empty state in edit mode

- If `photos.length === 0` and `editing` is true, the "Tap to add photo" tile stays clickable (same as today).
- If `photos.length === 0` and not editing, keep the current tap-to-add tile so users can still add a first photo without entering edit mode. (Confirm-in-review: if you'd rather force edit mode for the very first photo too, say so and I'll gate it.)

## Technical notes

- Conditional structure inside the photos block:
  - `photos.length === 0` → empty state tile (unchanged).
  - `photos.length === 1` → single image; `X` remove button only if `editing`.
  - `photos.length >= 2` → carousel; `X` remove button only if `editing`.
- Below the image block:
  - If `editing && photos.length >= 1` → render `ReorderStrip` (with `onAdd` + `canAdd`).
  - Else if `!editing && photos.length >= 2` → render dot indicators row.
  - Else → render nothing.
- `ReorderStrip` component itself needs no prop changes; we just stop rendering it outside edit mode.
- No changes to data model, backend, or other sections of the page.
