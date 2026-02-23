# Add "This Month / This Year" Toggle to Dashboard Stats

## What changes

Add a toggle switch instead of the "This Month" heading that lets the user flip between "This Month" and "This Year". Both the loaves count and average rating cards will recalculate based on the selected time range.

## Technical Details

**File: `src/pages/Dashboard.tsx**`

1. Add a `useState` for the toggle: `const [range, setRange] = useState<'month' | 'year'>('month');`
2. Create a filtered bakes list based on the selected range:
  - "month": filter by current month + year (existing `thisMonth` logic)
  - "year": filter by current year
3. Update `avgRating` and loaves count to derive from this filtered list instead of `thisMonth`.
4. Fix loaves count to sum `loaf_count` values (not just count entries).
5. Replace the static "This Month" heading with a segmented toggle using two small buttons (styled like pill tabs):

```tsx
<div className="flex items-center gap-2 mb-3">
  <button
    onClick={() => setRange('month')}
    className={range === 'month' ? 'active-style' : 'inactive-style'}
  >
    This Month
  </button>
  <button
    onClick={() => setRange('year')}
    className={range === 'year' ? 'active-style' : 'inactive-style'}
  >
    This Year
  </button>
</div>
```

The active tab gets a bold/primary style; the inactive tab gets muted text. Styled inline with the existing design system (DM Sans font, uppercase tracking, small text).

## Files Modified

- `src/pages/Dashboard.tsx` -- add range state, toggle UI, and dynamic filtering for both stats cards