

# Dot Calendar Zoom Toggle

## What it does

Adds a small toggle icon in the top-right corner of the dot calendar grid. Clicking it switches between two modes:

- **Normal view** (current default): 7-column grid with larger dots/thumbnails, scrollable
- **Zoomed-out view**: Compact grid showing the entire year at a glance with smaller dots/thumbnails, no scrolling needed

The icon uses `Minimize2` (arrows pointing inward) when in normal view (click to zoom out) and `Maximize2` (arrows pointing outward) when zoomed out (click to zoom back in).

## How it looks

```text
Normal view (current):                 Zoomed-out view:
+---------------------------[><]--+    +---------------------------[<>]--+
|  o  o  o  o  o  o  o           |    | oooooooo ooooooo ooooooo        |
|  o  o  o  o  o  o  o           |    | ooooooo ooooooo oooooooo        |
|  o  o  o  o  o  o  o           |    | ooooooo ooooooo ooooooo         |
|  ...scrolls...                  |    | ...entire year visible...       |
+---------------------------------+    +---------------------------------+
```

## Technical Details

**File: `src/components/DotCalendar.tsx`**

1. Add `compact` boolean state (default `false`).

2. Add a toggle button positioned in the top-right corner above the grid:
   - Normal mode: show `Minimize2` icon from lucide-react
   - Compact mode: show `Maximize2` icon from lucide-react

3. When `compact` is true:
   - Reduce grid gap from `5px` to `2px`
   - Shrink dot size from `w-2 h-2` to `w-1 h-1`
   - Shrink photo thumbnails proportionally
   - Remove `aspect-square` from cells or use a smaller fixed size so the full year fits on screen

4. Add a CSS transition on the grid container for smooth scaling between modes.

## Files Modified
- `src/components/DotCalendar.tsx` -- add compact state, toggle button, and conditional sizing

