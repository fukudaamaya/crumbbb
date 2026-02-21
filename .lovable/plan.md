
# Add Notes and Favourite Heart to List View

## Changes

### `src/components/BakeListView.tsx`

1. **Add `Heart` icon import** from lucide-react alongside the existing `Star` import.

2. **Accept `onToggleFavourite` callback prop** so the heart button can update the bake without navigating away:
   ```
   onToggleFavourite?: (id: string, current: boolean) => void
   ```

3. **Add a heart icon** in the top-right corner of each list card. Tapping it calls `onToggleFavourite` (with `e.stopPropagation()` to prevent navigating into the bake detail). Filled heart for favourites, outline for non-favourites -- same style used in `BakeDetail.tsx`.

4. **Show truncated notes** below the star rating. Display `bake.notes` in a single line with `truncate` styling and muted text, only when notes exist.

### `src/pages/Journal.tsx`

5. **Pass `onToggleFavourite` to BakeListView**, wiring it to the existing `updateBake` from `useBakes`:
   ```
   onToggleFavourite={(id, current) => updateBake(id, { is_favourite: !current })}
   ```
   This requires pulling `updateBake` from the `useBakes` hook (already available but not currently destructured in Journal).

## Layout

Each list card will look like:

```text
+------------------------------------------+
| [photo]  Bake Name               [heart] |
|          12 Jan 2025 . 75% hydration      |
|          * * * * *                        |
|          Great oven spring, nice cr...    |
+------------------------------------------+
```

The card remains a single tappable button that navigates to the detail view. The heart is a nested button with `stopPropagation` so it toggles independently.
