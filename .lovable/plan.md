

## Goal

On desktop/tablet (≥768px), opening a bake (from grid thumbnail, list card, or Dashboard "recent bakes") shows the bake detail in a centered modal sized to match Dashboard/Settings content width (640px). Clicking the backdrop dismisses the modal and returns to the previous page. Mobile (<768px) keeps the current full-page behavior unchanged.

## Approach

Render `BakeDetail` differently based on viewport using the existing `useIsMobile` hook:

- **Mobile**: same full-page layout, wrapped by `AppShell` as today.
- **Desktop**: render the underlying page that was visited *before* opening the bake (Journal or Dashboard) in the background, with a Radix Dialog overlaying it. The dialog `onOpenChange={false}` triggers `navigate(-1)` (or fallback to `/` / `/dashboard`).

## Design

### 1. New `BakeDetailModalRoute` wrapper

Create `src/pages/BakeDetailRoute.tsx`:
- Uses `useIsMobile()`.
- If mobile → returns `<AppShell><BakeDetail /></AppShell>` (current behaviour).
- If desktop → renders the previous route's page underneath (Journal as the default background since that's the canonical entry, with `fullBleed`) + a `Dialog` containing `<BakeDetail asModal />`.

To keep it simple and avoid re-implementing routing-as-background, the desktop branch will render `<AppShell fullBleed><Journal /></AppShell>` (or `<Dashboard />` if `location.state?.from === '/dashboard'`) as the backdrop, plus the Dialog. Demo variant mirrors this.

### 2. Update `App.tsx` routes

Replace:
```tsx
<Route path="/bake/:id" element={<ProtectedRoute><AppShell><BakeDetail /></AppShell></ProtectedRoute>} />
<Route path="/demo/bake/:id" element={<AppShell demo><BakeDetail demo /></AppShell>} />
```
With:
```tsx
<Route path="/bake/:id" element={<ProtectedRoute><BakeDetailRoute /></ProtectedRoute>} />
<Route path="/demo/bake/:id" element={<BakeDetailRoute demo />} />
```

### 3. `BakeDetail` component — add `asModal` prop

Add optional `asModal?: boolean` prop. When `asModal` is true:
- Skip the outer `min-h-dvh` wrapper; use a contained `flex flex-col max-h-[85vh]` so it fits inside the dialog.
- Header back button still calls `navigate(-1)` (closes dialog naturally because the route changes).
- Hide the sticky `top-0` on the header (keep it within the dialog scroll container).

Internals (photos, edit forms, lightbox, delete confirm) unchanged.

### 4. Dialog setup

Use the existing `@/components/ui/dialog` with custom content sizing:
```tsx
<Dialog open onOpenChange={(o) => { if (!o) navigate(-1); }}>
  <DialogContent className="max-w-[640px] w-[calc(100vw-2rem)] max-h-[85vh] p-0 overflow-hidden">
    <BakeDetail asModal demo={demo} />
  </DialogContent>
</Dialog>
```
- `max-w-[640px]` matches Dashboard/Settings desktop content width.
- Radix Dialog already supports click-outside-to-close (overlay click) and Escape key — `onOpenChange(false)` fires, we `navigate(-1)`.
- `DialogContent` already includes a close X button (top-right), which is fine.

The lightbox (already `fixed inset-0 z-50`) will stack above the dialog correctly.

### 5. Backdrop page

The `Journal` (or `Dashboard`) rendered behind the modal preserves URL state context so dismissing returns the user to where they were. Direct entry (e.g. shared link) → backdrop is Journal by default; `navigate(-1)` falls back to `/` or `/demo`.

## Files to modify

- **New**: `src/pages/BakeDetailRoute.tsx` — viewport-aware wrapper (mobile = current page; desktop = backdrop + dialog).
- `src/pages/BakeDetail.tsx` — add `asModal?: boolean` prop; when true, swap outer container classes (no `min-h-dvh`, no sticky header) and use bounded height (`max-h-[85vh]` with internal scroll).
- `src/App.tsx` — route `/bake/:id` and `/demo/bake/:id` now point to `BakeDetailRoute`.

## Notes

- No memory updates required — this is a desktop UX refinement consistent with existing visual identity.
- Mobile behaviour, URL structure, deep links, and the `navigate(-1)` back logic are all preserved.

