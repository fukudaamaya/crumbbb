# Make Bake Thumbnails Larger in Zoomed-In View

## Change

In `src/components/DotCalendar.tsx`, when not in compact mode, scale up photo thumbnails to ~1.5× the cell size so baked loaves visually pop against the regular dots.

**Approach:** In normal mode, apply `scale-150` (Tailwind's 1.5× transform) to the `<img>` element. This enlarges the photo beyond its cell without affecting grid layout. Add `z-10` so enlarged thumbnails render above neighboring cells. In compact mode, keep `w-full h-full` (no scale).

**File:** `src/components/DotCalendar.tsx` — line 128-132, add conditional scale class to the `<img>`.