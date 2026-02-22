

# Make Demo Banner Sticky

## What changes

Make the demo banner stick to the top of the viewport when scrolling on the Journal and Dashboard pages in demo mode.

## Technical Details

**File: `src/components/DemoBanner.tsx`**

Add `sticky top-0` to the banner's className so it stays pinned to the top edge on scroll.

```tsx
<div
  className="sticky top-0 bg-primary text-primary-foreground px-4 py-2.5 flex items-center justify-between gap-3 z-50"
  style={{ fontFamily: 'DM Sans, sans-serif' }}
>
```

**File: `src/pages/Journal.tsx`**

Update the header's `sticky top-0` to account for the banner height so it stacks below the banner instead of overlapping it. Change the header to use a dynamic top offset when in demo mode:

```tsx
<header
  className={`sticky ${demo ? 'top-[44px]' : 'top-0'} z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between`}
  style={{ paddingTop: demo ? '12px' : 'calc(env(safe-area-inset-top) + 40px)' }}
>
```

The `44px` value matches the banner's rendered height (py-2.5 + text line height). This ensures the header sticks directly below the banner.

**File: `src/pages/Dashboard.tsx`**

No changes needed -- the Dashboard header is not sticky, so the banner simply scrolls naturally at the top. Making the banner itself sticky is sufficient.

## Files Modified
- `src/components/DemoBanner.tsx` -- add `sticky top-0`
- `src/pages/Journal.tsx` -- offset sticky header top position in demo mode

