
# Replace Year Selector with Clickable Dropdown

## What changes

Replace the chevron arrows and "X bakes" line below "CRUMB" with just the year number displayed as clickable text. Tapping it opens a small dropdown listing available years (2025, 2026). Selecting a year closes the dropdown and filters the journal.

## Design

```
CRUMB
2026 v          [grid|list]
```

Tapping "2026" opens a small popover/dropdown beneath it with:
- 2025
- 2026

The selected year is highlighted. Picking one closes the dropdown and switches the view.

## Technical Details

**File: `src/pages/Journal.tsx`**

1. Import `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` from `@/components/ui/dropdown-menu` and `ChevronDown` from `lucide-react`.
2. Remove `ChevronLeft`, `ChevronRight` imports (no longer needed).
3. Replace lines 45-64 (the chevron row + bake count paragraph) with a single dropdown trigger:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className="flex items-center gap-1 text-[13px] font-bold tabular-nums mt-0.5"
      style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {year}
      <ChevronDown size={12} className="text-muted-foreground" />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start" className="min-w-[80px]">
    {Array.from(
      { length: currentYear - minYear + 1 },
      (_, i) => currentYear - i
    ).map((y) => (
      <DropdownMenuItem
        key={y}
        onClick={() => setYear(y)}
        className={y === year ? 'font-bold' : ''}
      >
        {y}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

This generates the year list dynamically from `currentYear` down to `minYear`, so future years are automatically included. The currently selected year appears bold in the menu.

## Files Modified
- `src/pages/Journal.tsx` -- replace chevron year selector and bake count with a dropdown year picker
