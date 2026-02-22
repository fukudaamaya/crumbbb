
# Add Year Selector to the Journal

## Overview
Add a year indicator with left/right chevron arrows in the Journal header, allowing you to switch between 2025 and 2026 (and any future years). The bake count subtitle will update to reflect the selected year.

## Design
A small year selector placed below the "CRUMB" title, replacing the current static "X bakes this year" text:

```
  < 2026 >
  5 bakes this year
```

- Left arrow goes to the previous year (minimum: 2025)
- Right arrow goes to the next year (maximum: current year)
- The arrows are disabled at the boundaries (no going before 2025, no going past 2026)
- Both the dot calendar and the list view filter to show only bakes from the selected year

## Changes

### 1. `src/pages/Journal.tsx`
- Add a `year` state (default: current year) instead of the hardcoded `new Date().getFullYear()`
- Filter `bakes` to only those matching the selected year before passing to child components
- Replace the subtitle area with a row containing: left chevron, year label, right chevron, and the filtered bake count
- Use `ChevronLeft` and `ChevronRight` icons from lucide-react

### 2. `src/components/BakeListView.tsx`
- No changes needed -- it already renders whatever bakes are passed to it

### 3. `src/components/DotCalendar.tsx`
- No changes needed -- it already accepts a `year` prop

## Technical Details

**Journal.tsx year selector UI (inserted in header):**
```tsx
const currentYear = new Date().getFullYear();
const [year, setYear] = useState(currentYear);
const minYear = 2025;

const yearBakes = useMemo(
  () => bakes.filter(b => b.date.startsWith(String(year))),
  [bakes, year]
);

// In the header, replace the subtitle with:
<div className="flex items-center gap-2 mt-0.5">
  <button
    onClick={() => setYear(y => y - 1)}
    disabled={year <= minYear}
    className="p-0.5 disabled:opacity-30"
  >
    <ChevronLeft size={14} />
  </button>
  <span className="text-[13px] font-bold tabular-nums">{year}</span>
  <button
    onClick={() => setYear(y => y + 1)}
    disabled={year >= currentYear}
    className="p-0.5 disabled:opacity-30"
  >
    <ChevronRight size={14} />
  </button>
</div>
<p className="text-[12px] text-muted-foreground">
  {yearBakes.length} {yearBakes.length === 1 ? 'bake' : 'bakes'}
</p>
```

Then pass `yearBakes` instead of `bakes` to `DotCalendar` and `BakeListView`, and pass `year` to `DotCalendar`.

## Files Modified
- `src/pages/Journal.tsx` -- add year state, filter bakes by year, add chevron year selector UI
