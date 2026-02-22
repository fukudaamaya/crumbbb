

# Make Journal Header Non-Sticky

## What changes

Remove the sticky positioning from the Journal page header so it scrolls away with the content instead of staying pinned.

## Technical Details

**File: `src/pages/Journal.tsx`**

Change the header's className from `sticky top-[44px]` / `sticky top-0` to just a static position:

```tsx
<header
  className={`${demo ? '' : ''} z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between`}
  style={{ paddingTop: demo ? '12px' : 'calc(env(safe-area-inset-top) + 40px)' }}
>
```

Specifically, remove the `sticky` class and the conditional `top-[44px]` / `top-0` since they are no longer needed.

## Files Modified
- `src/pages/Journal.tsx` -- remove sticky positioning from header

