

## Goal

Restrict the desktop modal for bake details to desktop only (≥1024px). Tablet (768–1023px) reverts to the full-page behavior it had before.

## Change

In `src/pages/BakeDetailRoute.tsx`, replace the `useIsMobile()` check (which fires below 768px) with a desktop check that fires at `lg` (≥1024px). Below `lg`, render the full-page `AppShell` + `BakeDetail` (covers both mobile and tablet). At `lg` and up, render the backdrop + dialog modal.

### Implementation

Add a small `useIsDesktop` hook (or inline `matchMedia('(min-width: 1024px)')` with the same SSR-safe pattern as `useIsMobile`) inside `src/hooks/use-mobile.tsx`, then use it in `BakeDetailRoute`:

```tsx
const isDesktop = useIsDesktop(); // ≥1024px

if (!isDesktop) {
  return (
    <AppShell demo={demo}>
      <BakeDetail demo={demo} />
    </AppShell>
  );
}
// ...existing modal branch unchanged
```

Tablet (768–1023px) now falls into the non-desktop branch and gets the original full-page layout. Mobile is unchanged. Desktop modal behavior is unchanged.

## Files to modify

- `src/hooks/use-mobile.tsx` — add `useIsDesktop` (≥1024px) alongside existing `useIsMobile`.
- `src/pages/BakeDetailRoute.tsx` — swap `useIsMobile` for `useIsDesktop`; invert the early-return condition accordingly.

