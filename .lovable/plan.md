# Compact View: Dense Year-at-a-Glance Grid

## Problem

The current compact mode keeps the 7-column calendar layout, which creates large gaps and wastes space. The year doesn't feel like a true "at a glance" view.

## Solution

When compact mode is active, switch from the 7-column weekly layout to a dense sequential grid. All 365/366 days are laid out left-to-right, top-to-bottom in a grid with enough columns (around 15) so the entire year fits in a tight, uniform block with minimal trailing blanks.

## Technical Details

**File: `src/components/DotCalendar.tsx**`

1. **Compute compact column count**: Use `Math.ceil(Math.sqrt(totalDays * 1.5))` which yields ~23 columns for 365 days (roughly 16 rows). This creates a near-square, visually balanced grid. Alternatively, hardcode 15 columns (yields 25 rows) for a taller, narrower layout -- will use ~15 columns to keep dots from being too spread horizontally on mobile.
2. **Separate cell arrays for each mode**:
  - **Normal mode** (existing): 7 columns, day-of-week aligned with leading padding cells.
  - **Compact mode**: Simply render all `days` sequentially (no day-of-week alignment padding). Pad only the trailing cells to fill the last row.
3. **Grid columns**: Change `gridTemplateColumns` from always `repeat(7, 1fr)` to `repeat(compact ? compactCols : 7, 1fr)`.
4. **Keep everything else the same**: click behavior, today highlighting, photo thumbnails all remain unchanged, but dot sizes should be bigger to fit the new grid layout.

This eliminates the awkward gaps because there are no day-of-week offset cells in compact mode -- every cell is a real day, packed tightly.

## Files Modified

- `src/components/DotCalendar.tsx` -- change compact grid to ~15 columns with sequential day layout (no weekday alignment padding)