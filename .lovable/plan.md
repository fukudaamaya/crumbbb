

# Remove ChevronDown from Year Selector

## What changes

Remove the `ChevronDown` icon from the year dropdown trigger so it just shows the plain year number (e.g. "2026"). The year remains clickable and opens the same dropdown. It stays left-aligned under "CRUMB".

## Technical Details

**File: `src/pages/Journal.tsx`**

1. Remove `ChevronDown` from the lucide-react import (line 3).
2. In the dropdown trigger button, remove the `<ChevronDown>` element and the `gap-1` class (no longer needed since there's only one child).

The trigger becomes:
```tsx
<button className="flex items-center text-[13px] font-bold tabular-nums mt-0.5"
  style={{ fontFamily: 'DM Sans, sans-serif' }}>
  {year}
</button>
```

No other changes needed -- the dropdown menu, year filtering, and left alignment all remain as-is.

## Files Modified
- `src/pages/Journal.tsx` -- remove ChevronDown icon from year selector trigger

