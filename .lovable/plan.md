## Goal

Add month separators in the **zoomed-in (7-column)** dot calendar with a small "MARCH"-style label, and align the first dot of each month to the correct weekday. Make this toggleable from `/settings`.

## Findings

- `DotCalendar.tsx` currently builds `normalCells` as one continuous array padded only at the very start. Months flow with no break.
- Compact (15-col) mode is sequential and weekday-agnostic — the user explicitly scoped this to **zoomed-in (7-col)** mode, so compact stays untouched.
- `SettingsContext` already persists `weekStart`, `tempUnit`, `accentColor` in localStorage under `crumb-settings`. Adding a new `showMonthLabels` boolean follows the exact same pattern.
- `Settings.tsx` uses the same `crumb-card` block pattern for each setting — easy to add one more.

## Plan

**1. `src/contexts/SettingsContext.tsx**`

- Add `showMonthLabels: boolean` (default `true`) to state, LS read/write, and context value.
- Add `setShowMonthLabels` setter.

**2. `src/pages/Settings.tsx**`

- Add a new `crumb-card` toggle "Show Month Labels" using the same segmented On/Off button style as Week Start / Temp Unit.

**3. `src/components/DotCalendar.tsx` (zoomed-in / 7-col mode only)**

- Restructure `normalCells` rendering: instead of one flat grid, render **12 month sections stacked vertically**, each as its own 7-column grid:
  - Month label row (small uppercase text, e.g. "MARCH") — only when `showMonthLabels` is true and `!compact`.
  - 7-col grid for that month, padded at the start with empty cells so day 1 aligns to the correct weekday (respecting `weekStart` setting — Sunday or Monday based).
  - Small vertical gap between months (e.g. `mt-4` or `mt-5`) for breathing room.
- When `showMonthLabels` is false in zoomed-in mode, then show the current zoomed-in (7-col) grid unchanged as one continuous array padded only at the very start. Months flow with no break.
- Compact (15-col) mode: **unchanged** — keep the current sequential flat grid.
- Keep auto-scroll-to-today logic working: `todayCellRef` still attaches to today's cell wherever it lands.
- Keep all existing styling: dot sizes, photo thumbnails, draft dashed circles, today outline, future-disabled.

**4. Weekday alignment**

- Use `weekStart` from settings to compute first-day offset per month (Mon=0..Sun=6 vs Sun=0..Sat=6).
- Currently `getDayOfWeek` is hardcoded to Mon=0. Replace with a small helper that respects `weekStart`.

## Visual

```text
   MARCH
   . . . . . . .     ← first row padded to land on correct weekday
   . . . . . . .
   . . . . . . .
   . . . . . .

   APRIL
   . . . . . . .
   ...
```

## Files to modify

- `src/contexts/SettingsContext.tsx`
- `src/pages/Settings.tsx`
- `src/components/DotCalendar.tsx`