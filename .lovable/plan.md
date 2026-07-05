## Goal

Clean up the bake detail photo section: drop the dot indicator, replace the "Add photo" text button with an add-tile at the end of the thumbnail row, and gate the per-photo X delete on the page's edit mode.

## Changes (single file: `src/pages/BakeDetail.tsx`)

1. **Remove dot indicators.** Delete the `{/* Dot indicators */}` block (the `photos.map` rendering `.bg-primary/.bg-border` dots). The carousel still swipes/scrolls; thumbnails already show position.

2. **Remove the standalone "Add photo (n/MAX)" text button** under the photo block.

3. **Add-tile in the thumbnail strip.** Extend `ReorderStrip`:
   - Add prop `onAdd?: () => void` and `canAdd: boolean`.
   - Change the guard from `photos.length < 2` to `photos.length < 1` so the strip renders whenever there's at least one photo (needed so the add-tile shows with 1 photo).
   - After the mapped thumbnails, when `canAdd` is true, render an extra 14x14 tile styled like a thumbnail (dashed border, centered `Plus` icon, same rounded/shadow treatment) that calls `onAdd`. Not draggable, no grip bar.
   - When there is exactly 1 photo, hide the drag grip bar overlay (reorder is meaningless with 1) — small conditional on `photos.length > 1`.

4. **Render the strip for `photos.length >= 1`.** In the main render:
   - Keep the single-photo main image block as-is.
   - Below both the single-photo and multi-photo blocks, render `<ReorderStrip …  onAdd={() => setShowPhotoOptions(true)} canAdd={!isDemo && photos.length < MAX_PHOTOS} />` (moved out of the `photos.length >= 2` branch).
   - For single-photo case there's no carousel, so pass `currentSlide={0}` and an `onSelect` that just opens the lightbox — but simpler: only render the strip if `photos.length >= 2 || (!isDemo && photos.length >= 1 && photos.length < MAX_PHOTOS)`. When only 1 photo + add-tile, `onSelect` maps to opening the lightbox on that photo.

5. **Gate the per-photo X delete on edit mode.** Change the two `!isDemo &&` conditions wrapping the `X` remove button (single-photo block at line ~506 and carousel block at line ~533) to `!isDemo && editing &&`. The `editing` state already exists on the page (main edit pencil toggles it).

## Notes

- Zero photos empty state ("Tap to add photo" full-height tile) is unchanged — that's the entry point when there are no photos yet.
- `MAX_PHOTOS` cap still respected: add-tile hidden when at max.
- No backend or schema changes.