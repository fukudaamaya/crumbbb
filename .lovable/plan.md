

## Findings

Verified at all three viewports:
- **Mobile (390x844)**: Grid extends behind FAB correctly — no empty band ✓
- **Tablet (820x1180)**: Grid ends ~250px above the FAB, leaving a large empty cream band ✗
- **Desktop (1920x1080)**: Same issue — grid ends ~150px above the FAB ✗

## Root cause

In `src/components/DotCalendar.tsx` (line 95), the non-compact view wraps the grid in `max-h-[65vh] overflow-y-auto`. On taller viewports (tablet/desktop), `65vh` is shorter than the available space between the header and bottom nav, so the grid scroll area stops short and the page background shows through behind the FAB.

The dots inside the scroll container also size at `aspect-square` per cell (1/7 of width), so on wider/taller frames the grid naturally contains itself within `65vh` without overflowing.

## Fix

### `src/components/DotCalendar.tsx`

Replace the fixed `max-h-[65vh]` with `flex-1 min-h-0` so the scroll container fills all remaining vertical space between the header and the bottom nav, regardless of viewport height. Also make the outer wrapper a flex column that fills its parent.

**Change:**
- Outer wrapper: `relative px-4 pb-4 pt-2 min-h-full` → `relative px-4 pb-4 pt-2 flex-1 flex flex-col`
- Scroll container: `compact ? '' : 'max-h-[65vh] overflow-y-auto'` → `compact ? '' : 'flex-1 overflow-y-auto min-h-0'`

The grid inside keeps its `aspect-square` cells, so dots remain the same size; only the available scroll area extends, allowing the dots to render all the way down behind the FAB.

## Files Modified
- `src/components/DotCalendar.tsx`

