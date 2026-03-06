

# Scrollable Zoomed-In View

## Problem
The normal (zoomed-in) 7-column grid currently shows all days but doesn't have explicit scroll behavior. The user wants to scroll vertically through the year, with the bottom of the scroll reaching the last day.

## Solution
Wrap the grid in a scroll container with a fixed height (e.g., `max-h-[60vh]` or similar) in normal mode so it becomes scrollable. The compact mode should remain as-is (fits on screen without scrolling).

## Technical Details

**File: `src/components/DotCalendar.tsx`**

1. Wrap the grid `div` in a container with `overflow-y-auto` and a `max-h` constraint, but only in normal (non-compact) mode
2. In compact mode, no height constraint — the dense grid fits naturally
3. Use a reasonable max height like `max-h-[65vh]` so the grid is tall but scrollable within the page layout

