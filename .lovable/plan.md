

## Goal

Hide the scrollbar in the zoomed-in dot calendar grid while keeping scroll functionality intact on all viewports.

## Change

**`src/components/DotCalendar.tsx`** — the scroll container is the `div` with `ref={scrollRef}` and classes `flex-1 overflow-y-auto min-h-0 overscroll-contain`. Add a utility class to hide its scrollbar cross-browser.

Two-part fix:

1. **Add a global utility in `src/index.css`** (once, reusable):

```css
@layer utilities {
  .scrollbar-hide {
    scrollbar-width: none;          /* Firefox */
    -ms-overflow-style: none;       /* IE/old Edge */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;                  /* Chrome/Safari/WebKit */
  }
}
```

2. **Apply it in `src/components/DotCalendar.tsx`** on the scrollRef div:

```tsx
<div
  ref={scrollRef}
  className="flex-1 overflow-y-auto min-h-0 overscroll-contain scrollbar-hide"
  ...
>
```

Scroll still works (wheel, touch, keyboard) — only the visible track/thumb is hidden.

## Files to modify

- `src/index.css` — add `.scrollbar-hide` utility.
- `src/components/DotCalendar.tsx` — add `scrollbar-hide` class to the scroll container.

