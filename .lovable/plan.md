

# Fix Back Button on Bake Detail Page

## Problem

The back button on the Bake Detail page calls `navigate(-1)`, which relies on browser history. If the page is opened directly (via refresh, shared link, or bookmark), there is no previous history entry, so the button silently does nothing.

## Fix

Update the back button handler in `src/pages/BakeDetail.tsx` to detect whether there is browser history to go back to. If not, fall back to navigating to the Journal page (`/` or `/demo` for demo mode).

**File: `src/pages/BakeDetail.tsx` (line ~107)**

Change:
```typescript
<button onClick={() => navigate(-1)} className="p-1" aria-label="Back">
```

To logic like:
```typescript
<button
  onClick={() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isDemo ? '/demo' : '/');
    }
  }}
  className="p-1"
  aria-label="Back"
>
```

This preserves the existing behavior (going back to wherever the user came from, maintaining scroll/state) while adding a safe fallback when there is no history.

## Files Modified
- `src/pages/BakeDetail.tsx` -- update the back button click handler (~1 line change)

