

## Issue

On tablet/desktop (≥768px), the dot calendar's zoomed-in grid can't scroll. Mobile works because the App.tsx wrapper has `max-h-dvh overflow-hidden`, giving the inner `flex-1 overflow-y-auto` container a bounded height. On desktop those classes are removed (`md:max-h-none md:overflow-visible`) and `AppShell` uses `min-h-dvh` (min, not max), so the scroll container in `DotCalendar` has no bounded parent — it just grows and the page scrolls instead (which doesn't work because the sticky sidebar + flex layout context).

## Fix

Constrain the desktop layout to viewport height so the calendar's internal `overflow-y-auto` can take effect.

### Changes

**1. `src/App.tsx`** — on the outer wrapper, also bound height on desktop:
- Change `md:max-h-none md:overflow-visible` → keep `max-h-dvh overflow-hidden` at all breakpoints (the inner scrollable regions handle scrolling). The mobile frame width cap (`max-w-[430px]`) still drops at `md`.

**2. `src/components/AppShell.tsx`** — switch from `min-h-dvh` to `h-dvh` so the flex column has a fixed height to distribute, and ensure inner content area can shrink:
- Outer: `flex w-full h-dvh` (was `min-h-dvh`)
- Inner content wrapper: add `min-h-0 overflow-y-auto` for non-fullBleed pages so they scroll their own content; `fullBleed` stays `flex-1 flex flex-col min-h-0` (Journal manages its own scroll inside DotCalendar).

**3. `src/components/Sidebar.tsx`** — already `h-dvh sticky top-0`; no change needed, but confirm it stays inside the bounded flex row.

### Why this works

- Desktop becomes a fixed-viewport-height app shell (like Gmail/Linear): sidebar + main both `h-dvh`, main is a flex column with `min-h-0`, and `DotCalendar`'s inner `overflow-y-auto` scroll region now has a real bounded parent and scrolls properly.
- Mobile is unaffected — the same `max-h-dvh overflow-hidden` already applied there.
- Non-fullBleed routes (Dashboard, Settings, BakeDetail, wizard) get an outer scroll on the main column so long forms still scroll on desktop.

### Files to modify

- `src/App.tsx` — drop `md:max-h-none md:overflow-visible`.
- `src/components/AppShell.tsx` — `h-dvh` outer; add `min-h-0 overflow-y-auto` to non-fullBleed inner wrapper.

