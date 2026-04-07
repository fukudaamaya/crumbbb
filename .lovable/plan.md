

# Make Draft Placeholder Full-Size Circle

## Problem
Draft bake placeholders use the tiny dot size (`w-2 h-2`) instead of filling the full cell like photo thumbnails do.

## Change: `src/components/DotCalendar.tsx`

Update the draft bake rendering (lines 140-146) to use `w-full h-full` instead of `${dotSize}`, matching the photo thumbnail size. Keep the dashed border with brand color and the muted brand fill. The click handler already routes drafts to the continuation flow, so no navigation changes needed.

**Before:**
```tsx
<div className={`${dotSize} rounded-full`} style={{
  backgroundColor: 'hsl(var(--primary) / 0.2)',
  border: '1.5px dashed hsl(var(--primary))',
}} />
```

**After:**
```tsx
<div className="w-full h-full rounded-full" style={{
  backgroundColor: 'hsl(var(--primary) / 0.15)',
  border: '2px dashed hsl(var(--primary))',
}} />
```

