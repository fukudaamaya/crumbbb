

# Fixes: Recipe Cards, Photo Management & Fullscreen View

## 1. Recipe Cards — Show photo, name, loaves, last baked date

**`src/components/RecipeCard.tsx`** — Update to show:
- A small thumbnail (round or square) of the most recent bake's photo for that recipe (passed as a prop from Dashboard)
- Recipe name, loaf count, and "Last baked: [date]"
- Remove flour summary and weight

**`src/pages/Dashboard.tsx`** — For each recipe, find the most recent bake with a matching name to extract `photo_base64` and `date`, pass these to `RecipeCard` as props.

## 2. Photo Library — Multi-select

**`src/pages/BakeDetail.tsx`** — Change the library file input from single to multi-select:
- Add `multiple` attribute to the library `<input>`
- Update the `onChange` handler to loop through all selected files and compress/add each one (up to the MAX_PHOTOS limit)

## 3. Photo Reorder — Drag to reorder

**`src/pages/BakeDetail.tsx`** — Replace the chevron left/right reorder buttons with a drag-and-drop thumbnail strip:
- Below the carousel, render a horizontal row of small thumbnails
- Use `touchstart`/`touchmove`/`touchend` (or a lightweight drag library) to allow tap-hold-and-drag reordering
- On drop, reorder the `photos` array and call `updateBake`
- Keep the dot indicators for navigation but remove the chevron buttons

Implementation approach: Use a simple state-based drag system with `onTouchStart`, `onTouchMove`, `onTouchEnd` on thumbnail items — track dragged index and drop target, swap on release. No external library needed.

## 4. Fullscreen Photo View with Share/Save

**`src/pages/BakeDetail.tsx`** — Add a fullscreen photo lightbox:
- Tapping a photo opens a fullscreen overlay (fixed, z-50, black background)
- Show the photo centered and zoomable (object-contain)
- Header with close (X) button and a share/download button
- Share button: use `navigator.share({ files: [blob] })` if available (Web Share API), otherwise fall back to a download link (`<a download>`)
- Save to photos: convert base64 to blob, create object URL, trigger download

### Files to modify
- `src/components/RecipeCard.tsx` — new layout with photo thumbnail
- `src/pages/Dashboard.tsx` — pass last bake photo/date to RecipeCard
- `src/pages/BakeDetail.tsx` — multi-select photos, drag reorder thumbnails, fullscreen lightbox with share/save

