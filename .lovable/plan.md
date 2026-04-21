

## Goal

Add a true desktop layout instead of the centered 430px mobile frame currently shown on large screens. Mobile experience stays identical.

## Current state

- `#root` in `src/index.css` is `min-height: 100dvh; display: flex; align-items: center; justify-content: center` — this centers the app.
- `src/App.tsx` (or layout shell) wraps routes in a fixed-width `430x844` mobile frame for desktop.
- `BottomNav` and `FAB` are mobile-style fixed bars.
- All pages (`Journal`, `Dashboard`, `BakeDetail`, `Settings`, wizard steps) are designed mobile-first with `px-4`, single-column.

## Clarifying decisions baked into this plan

I'm proposing **one cohesive desktop pattern** rather than asking — but flag two open choices in Options at the bottom in case you want to redirect.

**Default direction:** convert to a responsive web app (not a mobile-frame-on-desktop simulator). Use a left sidebar for navigation on desktop, replace bottom nav, and let content breathe to a max-width.

## Plan

### 1. App shell (`src/App.tsx` + new `src/components/AppShell.tsx`)

- Remove the fixed mobile frame wrapper for `md:` and up.
- New shell:
  - **Mobile (`< md`)**: unchanged — full-width content + `BottomNav` fixed bottom + `FAB`.
  - **Desktop (`>= md`)**: 
    - Left **sidebar** (240px): CRUMB wordmark top, nav items (Journal, Dashboard, Settings) as vertical list, "+ New Bake" primary button at top of nav.
    - Main content area: max-width `1100px`, centered, generous padding (`px-8 py-6`).
    - Hide `BottomNav` and floating `FAB` on `md+`.

### 2. Root CSS (`src/index.css`)

- Remove `#root` flex centering on `md+` (keep on mobile only) so content can fill width.
- Body bg stays cream; sidebar gets a slightly different surface tone for separation.

### 3. Page-level responsive tweaks

- **`Journal.tsx`**:
  - Header: keep as is on mobile; on desktop integrate year selector + view toggle into a top bar inside main content.
  - Dot calendar: in zoomed-in 7-col mode on desktop, render months in a **3- or 4-column grid** (each month a self-contained 7-col mini-grid) instead of one tall vertical stack — uses horizontal space.
  - Compact 15-col mode: widen to use available width.
  - List view: keep single column but wider cards (max-width ~720px centered).
- **`Dashboard.tsx`**: 2-column stat grid on desktop (`md:grid-cols-2 lg:grid-cols-3`).
- **`BakeDetail.tsx`**: 2-column on desktop — left: photo gallery + lightbox; right: editable fields. Stays single-column on mobile.
- **`NewBakeWizard` steps**: cap form width at ~560px centered; keep step progress bar at top.
- **`Settings.tsx`**: cap card list at ~640px centered.
- **`Login`, `Signup`, `ForgotPassword`, `ResetPassword`**: cap card at ~420px centered (current look already works, just ensure no mobile frame).

### 4. Components

- **`BottomNav`**: add `md:hidden`.
- **`FAB`**: add `md:hidden`.
- **New `Sidebar` component** (desktop only, `hidden md:flex`): wordmark, nav links reusing `NavLink` styling, "+ New Bake" button, account/settings at bottom.
- **`DemoBanner`**: full-width on both; unchanged.

### 5. Breakpoints

- Use Tailwind defaults: `md` = 768px (tablet+ shows sidebar), `lg` = 1024px (more breathing room).
- Below 768px: current mobile experience, untouched.

## Visual sketch

```text
Desktop (>=768px):
┌─────────────┬──────────────────────────────────────────┐
│  CRUMB      │  Journal              2025 ▾   [grid|list]│
│             │                                           │
│  + New Bake │   JANUARY     FEBRUARY     MARCH          │
│             │   . . . . .   . . . . .    . . . . . .    │
│  Journal    │   . . . . .   . . . . .    . . . . . .    │
│  Dashboard  │   . . . .     . . . .      . . . .        │
│  Settings   │                                           │
│             │   APRIL       MAY          JUNE           │
│             │   ...                                     │
└─────────────┴──────────────────────────────────────────┘

Mobile (<768px):  unchanged — current single-column + bottom nav.
```

## Files to modify

- `src/App.tsx` — wrap routes in new `AppShell`.
- `src/index.css` — relax `#root` centering on `md+`.
- `src/components/AppShell.tsx` *(new)* — sidebar + main layout.
- `src/components/Sidebar.tsx` *(new)* — desktop nav.
- `src/components/BottomNav.tsx` — add `md:hidden`.
- `src/components/FAB.tsx` — add `md:hidden`.
- `src/components/DotCalendar.tsx` — multi-column month layout on desktop.
- `src/pages/Journal.tsx` — integrated header on desktop.
- `src/pages/Dashboard.tsx` — multi-col stat grid.
- `src/pages/BakeDetail.tsx` — 2-col layout on desktop.
- `src/pages/Settings.tsx`, `src/pages/wizard/*.tsx`, auth pages — max-width caps.

## Memory updates

- Update `mem://style/visual-identity` to reflect: mobile-first responsive (not fixed-frame), with desktop sidebar shell at `md+`.

## Open questions (only if you want to redirect)

1. **Sidebar vs top nav on desktop?** Plan uses sidebar. Top horizontal nav is the alternative.
2. **Keep mobile frame as an opt-in "preview" mode on desktop?** Plan removes it entirely. Could keep a toggle.

