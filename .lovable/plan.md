
Problem: the calendar still behaves like a fixed-height panel because one flex item in the scroll chain can still grow to its content height instead of shrinking to the available space.

Findings:
- `App.tsx` already bounds the mobile frame with `max-h-dvh overflow-hidden`.
- `Journal.tsx` now correctly uses `flex-1 min-h-0`, and `<main>` also has `min-h-0`.
- `DotCalendar.tsx` still has an outer wrapper of `flex-1 flex flex-col` but is missing `min-h-0`.
- In nested column flex layouts, that missing `min-h-0` can stop the inner `overflow-y-auto` container from ever becoming the actual scroll region.
- The session replay shows zoom toggling works, but the grid remains visually fixed after toggle, which matches a flex/overflow constraint issue more than a routing or data issue.

Plan:
1. Tighten the final missing flex constraint in `src/components/DotCalendar.tsx`
   - Change the outer wrapper from `relative px-4 pb-4 pt-2 flex-1 flex flex-col`
   - To `relative px-4 pb-4 pt-2 flex-1 min-h-0 flex flex-col`
   - Keep the inner scroll area as `flex-1 overflow-y-auto min-h-0`

2. Harden scrolling behavior on touch devices
   - Add touch-friendly scrolling styles/classes to the scroll container so swipe gestures work reliably on mobile:
     - keep `overflow-y-auto`
     - add `overscroll-contain`
     - add inline `WebkitOverflowScrolling: 'touch'`
   - This is especially useful because the calendar is made of many tappable `button` cells.

3. Preserve current journal behavior
   - Keep auto-scroll-to-today logic on the same scroll container
   - Keep the grid extending behind the FAB
   - Do not change FAB size, placement, or visual styling
   - Keep both calendar layouts working:
     - 7-column aligned mode
     - 15-column compact mode

4. Verify after implementation
   - Mobile: swipe up/down in calendar works
   - Tablet and desktop: mouse wheel/trackpad scroll works
   - Toggling zoom still works and does not freeze scroll
   - Auto-scroll still lands near today on initial load
   - Grid still visually reaches behind the FAB with no empty cream band

Files to update:
- `src/components/DotCalendar.tsx`

Technical detail:
This is the same nested-flex overflow issue, just one level deeper than the earlier fixes. The likely missing piece is not in `Journal` anymore, but in `DotCalendar` itself: the outer flex child needs `min-h-0` so the inner scrollable div can become smaller than its content and actually scroll.
