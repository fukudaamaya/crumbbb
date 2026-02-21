
# Fix Baking Streak Calculation

## Root Cause

The `calcStreak` function in `src/pages/Dashboard.tsx` uses `new Date()` (which includes hours/minutes/seconds) to calculate the current week number, but uses midnight (`new Date(b.date + 'T00:00:00')`) for bake dates. The fractional day difference causes `Math.ceil` to round the current week to a higher number than the bake's week, so they never match.

## Fix

In the `calcStreak` function, normalize `now` to midnight before calculating the current week number.

### File: `src/pages/Dashboard.tsx`

In the `calcStreak` function, change:

```typescript
const now = new Date();
const jan1Now = new Date(now.getFullYear(), 0, 1);
const currentWeek = Math.ceil(((now.getTime() - jan1Now.getTime()) / 86400000 + jan1Now.getDay() + 1) / 7);
```

To:

```typescript
const now = new Date();
now.setHours(0, 0, 0, 0);
const jan1Now = new Date(now.getFullYear(), 0, 1);
const currentWeek = Math.ceil(((now.getTime() - jan1Now.getTime()) / 86400000 + jan1Now.getDay() + 1) / 7);
```

Adding `now.setHours(0, 0, 0, 0)` normalizes "now" to midnight, making the week calculation consistent with how bake dates are handled.

No other files or backend changes are needed.
