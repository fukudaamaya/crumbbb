

# Constrain App to Mobile Size on Desktop

## What changes

On desktop screens, the app currently stretches vertically to fill the entire viewport because of `min-h-dvh`. We'll cap the height and center the app shell so it looks like a phone-sized container on large screens.

## Technical Details

**File: `src/App.tsx` (line 46)**

Update the wrapper div classes:
- Keep `max-w-[430px]` (already constrains width)
- Add `max-h-dvh` and `overflow-hidden` to prevent vertical stretching
- The inner pages already handle their own scrolling, so clipping at the shell level is safe

**File: `src/index.css`**

Add styles to the `body` or `#root` to center the app shell vertically on desktop:
- Set `#root` to use flexbox centering (`flex items-center justify-center min-h-dvh`)

This way the app appears as a phone-sized frame centered on the page when viewed on a desktop browser.

## Files Modified
- `src/App.tsx` -- add `max-h-dvh overflow-hidden` to wrapper div
- `src/index.css` -- add vertical centering to `#root`

