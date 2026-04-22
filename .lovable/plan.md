

## Bug

In Step 2 of the New Bake wizard (`Step3Baking.tsx`), the **Oven Temp** label can show "(°F)" even when the user's setting is "°C", and/or the numeric value shown doesn't match the unit in the label.

## Root cause

`SettingsContext` initializes `tempUnit` to the hardcoded default `'C'` and only reads the user's saved value from `localStorage` inside a `useEffect` — i.e. **after** the first render.

`Step3Baking` reads `tempUnit` once during render and seeds its input state via `useState(String(initTempDisplay))`. The seed therefore uses the *pre-load* `tempUnit` value. When `SettingsContext`'s effect later flips `tempUnit` to the saved value (e.g. `'F'`), the label re-renders with the new unit, but the input value was already locked in using the old unit — producing the mismatch the user is seeing.

Same class of issue affects any other component that reads settings during initial render (e.g. `BakeDetail`'s `ProcessCard`).

## Fix

Make `SettingsContext` resolve the saved settings **synchronously** during the very first render by using a lazy `useState` initializer that reads `localStorage` directly. This removes the post-mount flip and guarantees every consumer sees the correct `tempUnit` (and other settings) on first render.

### Change in `src/contexts/SettingsContext.tsx`

- Replace the four separate `useState(<hardcoded default>)` calls plus the `useEffect(() => { … readLS … })` block with lazy initializers:

  ```ts
  const initial = typeof window !== 'undefined' ? readLS() : { weekStart: 'sunday', tempUnit: 'C', accentColor: 'Maroon', showMonthLabels: true };
  const [weekStart, setWeekStartState] = useState<WeekStart>(initial.weekStart);
  const [tempUnit, setTempUnitState] = useState<TempUnit>(initial.tempUnit);
  const [accentColor, setAccentColorState] = useState(initial.accentColor);
  const [showMonthLabels, setShowMonthLabelsState] = useState(initial.showMonthLabels);
  ```

- Keep an effect that calls `applyAccent(accentColor)` once on mount (so the CSS variables are set), but no longer use it to seed state.

This is a one-file, surgical change. No API surface changes, no consumer changes required.

## Why this is enough

- `Step3Baking` (and every other consumer) now sees the correct `tempUnit` on its very first render, so the `useState(String(initTempDisplay))` seed is computed against the right unit. Label and value stay consistent.
- No need to sprinkle `useEffect`-based re-syncs in individual consumers.
- `localStorage` access inside a lazy initializer runs only once per `SettingsProvider` mount, so there's no perf concern.

## Files to modify

- `src/contexts/SettingsContext.tsx` — switch to lazy `useState` initializers backed by `readLS()`; reduce the mount effect to only call `applyAccent`.

