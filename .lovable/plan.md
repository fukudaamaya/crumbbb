

# Float Toolbar & FAB Above Grid

## Problem
1. The zoom (expand/compact) toggle button currently sits in its own row above the calendar grid, creating an empty "white row" that pushes the grid down.
2. The "New Bake" FAB is already `position: fixed`, but its background pill makes it feel like it sits on a row rather than floating directly over the grid content.

The user wants both buttons to **overlay** the grid so that dots are visible behind/around them, in all viewports.

## Changes

### 1. `src/components/DotCalendar.tsx` — float zoom toggle over grid

- Remove the dedicated toggle row (`<div className="flex justify-end mb-2">`).
- Make the outer wrapper `relative` and absolutely position the zoom button in the top-right corner of the calendar area, overlapping the grid's top-right padding zone.
- Keep the button's existing border/shadow/background styling so it remains tappable and visible against dots.
- Result: the grid starts at the top of the available space; the zoom button floats over the grid's top-right.

```tsx
<div className="relative px-4 pb-4 pt-2">
  <button
    onClick={() => setCompact((c) => !c)}
    className="absolute top-2 right-4 z-10 p-1.5 rounded-[6px] border border-border bg-background ..."
    ...
  >
    {compact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
  </button>
  <div className={compact ? '' : 'max-h-[65vh] overflow-y-auto'}>
    {/* grid */}
  </div>
</div>
```

### 2. `src/pages/Journal.tsx` — remove top padding above grid

- Change `<main className="flex-1 pt-4">` → `<main className="flex-1">` so the calendar (with its own internal padding) sits flush under the header without an extra blank band.

### 3. FAB — confirmation, no code change needed
The FAB is already `position: fixed` with z-index 40 and floats over content. Its solid pill background is intentional (so the label is readable against dots/photos). The grid is visible around it. **No change** unless the user wants the FAB pill itself to become transparent — flagging this for confirmation after seeing the result.

## Files Modified
- `src/components/DotCalendar.tsx`
- `src/pages/Journal.tsx`

