

# Fix App Shell to Fixed Mobile Height

## What changes

Instead of using `max-h-dvh` (which stretches to full viewport height on desktop), the app container will have a fixed maximum height typical of a mobile device (e.g. `max-h-[844px]`), so it looks like a phone on desktop screens. On actual small screens, it will still fill the viewport.

## Technical Details

**File: `src/App.tsx` (line 46)**

Change the wrapper div classes:
- Replace `min-h-dvh max-h-dvh` with `h-[844px] max-h-dvh`
- This sets the container to 844px tall (iPhone 14 size), but on short viewports it won't exceed the screen

The class list becomes:
```
relative mx-auto w-full max-w-[430px] h-[844px] max-h-dvh overflow-hidden bg-background shadow-[...] flex flex-col
```

## Files Modified
- `src/App.tsx` -- replace `min-h-dvh max-h-dvh` with `h-[844px] max-h-dvh`

