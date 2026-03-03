

# Fix Compact Grid Spacing

## Problem
In compact mode, the grid cells use a fixed `height: 6px` with `gap: 2px`, making dots cramped vertically while the grid doesn't fill the viewport. The horizontal spacing (governed by `1fr` columns) is also uneven compared to vertical.

## Solution
Use `aspect-square` on compact cells too (same as normal mode) so horizontal and vertical spacing are equal. Remove the fixed `height: 6px`. The dots will naturally space out to fill the available width, and since each cell is square, vertical spacing matches horizontal. Increase the dot size slightly to `w-2 h-2` in compact mode so dots are visible and the grid fills more vertical space.

## Technical Details

**File: `src/components/DotCalendar.tsx`**

1. Remove the `compact ? '' : 'aspect-square'` conditional — always use `aspect-square` on cells
2. Remove the `style={compact ? { height: '6px' } : undefined}` — let aspect-square handle sizing
3. Use uniform gap for compact mode: `3px` instead of `2px` for breathing room
4. Keep dot size at `w-2 h-2` for both modes (the grid columns being narrower in compact mode will naturally make the squares smaller)
5. Adjust compact photo size from `w-[5px] h-[5px]` to `w-full h-full` so thumbnails fill their cell like in normal mode

## Files Modified
- `src/components/DotCalendar.tsx`

