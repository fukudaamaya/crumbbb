

## Problem
After switching the grid container to `flex-1 overflow-y-auto min-h-0`, scrolling no longer works because the parent flex chain doesn't establish a bounded height for the scroll area to overflow against.

## Root cause
- `App.tsx` wrapper is `max-h-dvh overflow-hidden flex flex-col` (bounded height ✓)
- `Journal.tsx` outer div uses `min-h-screen` + `paddingBottom: 64px`. `min-h-screen` makes Journal **at least** viewport tall, with no upper bound. Inside the parent's `overflow-hidden`, Journal extends beyond the visible area instead of being constrained to it.
- Because Journal isn't height-bounded, its inner `<main className="flex-1">` and the grid's `flex-1 overflow-y-auto` have no fixed height to scroll within — they just grow to fit content.

## Fix

### `src/pages/Journal.tsx`
Change the outer wrapper from `min-h-screen` (no height ceiling) to `h-dvh` (exact viewport height) so the flex chain has a bounded total height. The bottom padding stays so content clears the BottomNav.

**Change line 36:**
- `className="flex flex-col min-h-screen bg-background"` → `className="flex flex-col h-dvh bg-background"`

With Journal now exactly `100dvh` tall:
- Header takes its natural height
- `<main className="flex-1 flex flex-col">` fills the remaining space
- `DotCalendar`'s inner `flex-1 overflow-y-auto min-h-0` now has a real bounded height → scrolling works again
- Dots still extend behind the FAB (the fix from the previous step is preserved)

## Files Modified
- `src/pages/Journal.tsx`

