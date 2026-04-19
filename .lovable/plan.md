
Problem: zoomed-in calendar mode still cannot scroll because `DotCalendar` only makes the inner container scrollable in normal mode. In compact mode, the scroll wrapper gets an empty class (`''`), so the full year grid just renders at natural height and becomes effectively fixed inside the app shell.

Plan:
1. Update `src/components/DotCalendar.tsx` so the same bounded scroll container is used in both calendar modes.
   - Change the wrapper around the grid from `compact ? '' : 'flex-1 overflow-y-auto min-h-0'` to a scrollable flex container for both modes.
   - Keep the grid layout itself mode-specific:
     - normal mode: 7 columns with weekday padding
     - zoomed/compact mode: 15 columns, sequential layout, tighter gap

2. Preserve current behavior while fixing scroll
   - Keep the outer calendar wrapper as `flex-1 flex flex-col`
   - Keep the FAB visually unchanged
   - Keep the grid extending behind the FAB with no white band
   - Keep auto-scroll to today, but make sure it targets the now-scrollable container in both modes

3. Verify the compact-mode UX
   - Ensure vertical scrolling works in zoomed-in view
   - Ensure normal view still scrolls
   - Ensure toggling zoom does not trap the scroll position or snap incorrectly
   - Confirm mobile, tablet, and desktop all still fill correctly behind the FAB

Technical note:
The current code explicitly disables the scroll container in compact mode:
- `className={compact ? '' : 'flex-1 overflow-y-auto min-h-0'}`
That is the most likely direct cause. The fix should be surgical in `DotCalendar.tsx`, not another parent flexbox rewrite.
