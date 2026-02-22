

# Remove Thumbnail Borders in Journal

## What changes

Remove the border from bake thumbnails in the list view so they appear borderless.

## Technical Details

**File: `src/components/BakeListView.tsx`**

On the thumbnail container div (around line 55), remove `border border-border` from the className and remove the `boxShadow` style:

```tsx
// Before:
<div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border border-border"
  style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}>

// After:
<div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden">
```

## Files Modified
- `src/components/BakeListView.tsx` -- remove border and box-shadow from thumbnail container

