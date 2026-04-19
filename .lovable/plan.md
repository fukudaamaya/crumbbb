

## Problem
The FAB itself looks correct (filled brand pill). The issue is the row/area around it appears white, blocking the grid behind. Looking at the screenshot, the white band spans the full width above the bottom nav — this is the BottomNav's top edge or a wrapper around it, not the FAB itself.

## Investigation needed
Need to check `BottomNav.tsx` and the `Journal.tsx` bottom padding to find what's painting that white strip behind the FAB.

## Likely cause
The `<div>` wrapping the page has `paddingBottom: calc(env(safe-area-inset-bottom) + 64px)` for the bottom nav, but the BottomNav itself likely has a solid `bg-background` bar that's 64px tall. The FAB sits 20px above that bar — so the visible "white space around the FAB" is actually just the cream page background showing through where the grid has ended (grid is shorter than viewport).

If the grid is short (few bakes), the page has empty cream space below it, then the bottom nav. The FAB floats in that empty cream space. To make the grid visible behind the FAB, the grid needs to extend further OR the FAB needs to overlap the grid area directly.

## Change

### `src/components/DotCalendar.tsx`
Ensure the dot grid container fills the available vertical space so dots render behind the FAB area instead of the page ending early. Add `min-h-full` or extend the scroll/grid area so the cream "empty" space below the dots is eliminated and the grid visually extends down to where the FAB floats.

Specifically: the grid currently has natural height based on dot count. Wrap it so the container takes `min-h-[calc(100vh-header-bottomnav)]` — this way when you scroll or view a sparse year, dots fill behind the FAB.

If after inspection the actual issue is a solid background element behind the FAB (e.g. BottomNav extending visually upward, or a wrapper with `bg-background`), the fix will instead be to remove that background.

## Files to inspect first
- `src/components/BottomNav.tsx` — confirm it's only 64px tall with no upward extension
- `src/components/DotCalendar.tsx` — confirm grid container height behavior

## Files likely modified
- `src/components/DotCalendar.tsx` (extend grid area to fill viewport)

