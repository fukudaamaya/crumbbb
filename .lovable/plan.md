

## Goal

Replace the desktop/tablet sidebar with two pieces of chrome on Journal and Dashboard:

1. **Fixed top header**: `CRUMB` wordmark left, Settings icon right.
2. **Tab navigation** at the top of the page content: `Journal` / `Dashboard` (Twitter-style — bold active label with primary-colored underline, muted inactive label, thin divider beneath the row).

Mobile (<768px) is unchanged (`BottomNav` + `FAB`).

## Design

```text
┌─────────────────────────────────────────────────────────────┐
│  CRUMB                                                  ⚙   │  ← fixed header, h-16, border-b
├─────────────────────────────────────────────────────────────┤
│   Journal    Dashboard                                       │  ← tabs row, border-b
│   ━━━━━━━                                                    │     active = bold + underline
├─────────────────────────────────────────────────────────────┤
│                       page content                           │
└─────────────────────────────────────────────────────────────┘
```

- Wordmark uses existing `.wordmark` class, links to `/` (or `/demo` in demo mode).
- Settings icon = `lucide-react` `Settings`, ghost button, links to `/settings`.
- Header: `sticky top-0 z-40`, `bg-background`, `border-b border-border`, `hidden md:flex`, padded to align with content.
- Tabs use `NavLink` to `/` and `/dashboard` (or `/demo` and `/demo/dashboard`); active state derived from `useLocation` so the underline tracks the route.
- Tabs styling: `font-semibold` text, ~`text-[15px]`, gap-6, active gets `text-foreground` + 2px primary underline via a positioned bottom border; inactive gets `text-muted-foreground`.
- The `+ New Bake` action stays accessible via the existing `FAB` on all viewports (it already renders on mobile + desktop). No header button needed.

## Files

### New: `src/components/TopHeader.tsx`
Fixed desktop header. Props: `{ demo?: boolean }`. Renders wordmark (link → Journal) and Settings icon button (link → `/settings`). Hidden below `md`.

### New: `src/components/TopTabs.tsx`
Renders the `Journal` / `Dashboard` tab row with active underline. Props: `{ demo?: boolean }`. Uses `NavLink` with `end` on Journal so `/dashboard` doesn't mark it active. Hidden below `md`.

### Modify: `src/components/AppShell.tsx`
- Remove `<Sidebar />`.
- Add prop `showHeader?: boolean` (default `false`); when true, render `<TopHeader demo={demo} />` above content and `<TopTabs demo={demo} />` at the top of the scroll area.
- Layout becomes vertical (`flex flex-col`).
- `fullBleed` continues to control the inner content cap; tabs render inside the scroll container above the page content so they scroll with content (acceptable per the reference image) — if we want the tabs sticky too, we apply `sticky top-0` within the scroll area. **Decision: tabs scroll with content** to match the reference screenshot's behavior and keep implementation simple.

### Modify: `src/App.tsx`
Pass `showHeader` only on Journal & Dashboard routes:
- `/` → `<AppShell fullBleed showHeader>`
- `/dashboard` → `<AppShell showHeader>`
- `/demo` → `<AppShell demo fullBleed showHeader>`
- `/demo/dashboard` → `<AppShell demo showHeader>`

All other desktop routes (Settings, wizard, recipe history, bake detail backdrop) render without header/tabs and keep their existing in-page chrome.

### Remove
`src/components/Sidebar.tsx` is no longer imported. Delete it to keep the codebase clean.

## Notes

- `FAB` continues to provide the "New Bake" entry point on every viewport.
- Settings page on desktop is reachable via the header gear icon and direct URL; the page's own back button handles return.
- Mobile `BottomNav` is untouched — it remains the navigation surface below `md`.
- `BakeDetailRoute` desktop modal renders Journal/Dashboard as the backdrop; the new header + tabs will appear in that backdrop, which is consistent.

