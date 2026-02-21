

# Disable Future Date Dots in Calendar

## Change

In `src/components/DotCalendar.tsx`, prevent tapping on future dates by disabling the button for any date after today.

## Technical Details

In the `handleDayTap` function and the button rendering:

1. Add a `isFuture` check: `const isFuture = ds > today`
2. For future dates, render a non-interactive `div` instead of a `button` (or set `disabled` on the button and skip the `onClick` handler)
3. Keep the existing faded dot styling (`hsl(var(--primary) / 0.12)`) for future dates -- no visual change needed since they already look distinct

### File: `src/components/DotCalendar.tsx`

- In the day cell rendering, add `const isFuture = ds > today`
- Change the `<button>` to disable click for future dates: either render a plain `<div>` when `isFuture` is true, or add `disabled={isFuture}` and guard `onClick` with `if (isFuture) return`
- No other files need changes

