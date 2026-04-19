
## Findings

The current scroll fix targeted `Journal` and `DotCalendar`, but the remaining blocker is likely the flex chain inside `Journal`:

- `Journal` outer wrapper is now correctly bounded with `flex-1 min-h-0`
- `DotCalendar` already has `flex-1 overflow-y-auto min-h-0`
- But `Journal`’s `<main className="flex-1 flex flex-col">` is still missing `min-h-0`

In a column flex layout, that missing `min-h-0` often prevents the child scroll area from shrinking to the available height, so the calendar grows to its full content height instead of becoming a scrollable region.

## Fix

### 1. Restore the missing flex constraint in `src/pages/Journal.tsx`
Change:
- `className="flex-1 flex flex-col"`
to:
- `className="flex-1 min-h-0 flex flex-col"`

That gives `DotCalendar` a real bounded height to scroll within.

### 2. Preserve the existing calendar fix in `src/components/DotCalendar.tsx`
Keep:
- outer wrapper as `flex-1 flex flex-col`
- scroll area as `flex-1 overflow-y-auto min-h-0`

No FAB style/size/color changes.

### 3. If list view is also clipped, give it the same bounded scroll behavior
If needed, wrap `BakeListView` in a `flex-1 min-h-0 overflow-y-auto` container from `Journal`, so both journal modes behave consistently.

## Verification

After implementing:
- Standard 7-column calendar should scroll vertically again
- Grid should still extend behind the New Bake FAB with no white band
- FAB stays visually unchanged
- Check mobile, tablet, and desktop
- Confirm compact zoom mode still behaves as intended without breaking layout

## Files likely modified
- `src/pages/Journal.tsx`
- possibly `src/components/BakeListView.tsx` or the list-view wrapper in `Journal.tsx` if list mode also needs bounded scrolling

## Technical detail

This is a classic nested flexbox overflow issue: the scrollable child already exists, but one parent in the chain still has the default `min-height: auto`, which blocks overflow from activating. The fix should be surgical: add `min-h-0` at the `main` level rather than changing the FAB, the bottom nav, or the calendar visuals.
