

# Constrain App to Mobile Width on Desktop

## What changes

Wrap the entire app in a centered container that caps at a mobile width (e.g. 430px), so on desktop screens the app appears as a phone-sized column centered on the page, rather than stretching edge-to-edge.

## How it works

Add a wrapper `div` in `App.tsx` around all routes that:
- Sets `max-width: 430px` (iPhone Pro Max width -- generous mobile size)
- Centers horizontally with `mx-auto`
- Keeps `min-height: 100dvh` so it fills vertically
- Uses `relative` positioning so fixed elements (BottomNav, FAB) stay within the column

For fixed-position elements (BottomNav, FAB), update them to anchor within the container rather than the full viewport, so they don't stretch across a wide screen.

## Technical Details

### 1. `src/App.tsx` -- Add app shell wrapper

Wrap the `<Routes>` block in a container div:

```tsx
<div className="relative mx-auto w-full max-w-[430px] min-h-dvh bg-background shadow-hard-lg">
  <Routes>
    ...
  </Routes>
</div>
```

### 2. `src/components/BottomNav.tsx` -- Constrain to container

Change from `fixed` full-width to constrained within the app shell:
- Add `max-w-[430px] mx-auto left-0 right-0` so the nav bar stays within the mobile column

### 3. `src/components/FAB.tsx` -- Keep within container

The FAB uses `fixed` positioning with `right: 20px`. On desktop this would place it far to the right. Instead, position it relative to the container by calculating from center, or switch to absolute positioning within a relative parent.

### 4. `src/index.css` -- Optional background

Add a subtle background color or pattern to `html`/`body` so the area outside the app column looks intentional (e.g. a slightly darker shade).

## Files Modified
- `src/App.tsx` -- add max-width container wrapper
- `src/components/BottomNav.tsx` -- constrain fixed nav to container width  
- `src/components/FAB.tsx` -- keep FAB within container bounds
- `src/index.css` -- style the outer background area
