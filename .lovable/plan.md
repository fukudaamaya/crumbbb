
Fix list view scrolling by giving it the same bounded scroll region pattern that now works for the calendar.

1. Update `src/components/BakeListView.tsx`
- Make the root element a scroll container: `flex-1 min-h-0 overflow-y-auto overscroll-contain`
- Add `WebkitOverflowScrolling: 'touch'` for reliable mobile swipe scrolling
- Keep the cards inside an inner wrapper with the existing spacing/padding
- Preserve enough bottom padding so the final cards can scroll past the FAB instead of getting trapped behind it

2. Handle the empty state inside the same flex chain
- Wrap the empty state in a `flex-1 min-h-0` container so it still centers correctly without breaking the scroll layout

3. Keep `Journal.tsx` mostly unchanged
- `main` already has `flex-1 min-h-0`, which is correct
- Continue rendering `BakeListView` directly in list mode unless a tiny wrapper is needed for padding consistency

4. Verify behavior after implementation
- List view scrolls on mobile, tablet, and desktop
- Mouse wheel / trackpad works on desktop
- Swipe scrolling works on mobile
- Last cards remain reachable and not blocked by the FAB
- Grid view behavior remains unchanged

Technical detail:
The list is currently just a normal content stack (`px-4 pb-4 flex flex-col gap-3`) with no dedicated overflow container, so once the surrounding shell became height-bounded for the calendar fix, list mode lost its scrollable region. The fix should be surgical: make `BakeListView` itself the bounded scroll container rather than changing the journal shell again.
