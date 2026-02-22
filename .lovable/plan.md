

# Fix Baking Streak Calculation

## Problem

The `calcStreak` function uses a custom week-number formula that puts Saturday Feb 21 and Sunday Feb 22 into different weeks. It starts checking from the current week, and since there is no bake in today's computed week, the streak immediately returns 0 -- even though there was a bake yesterday.

## Root Cause

The week formula `Math.ceil((daysSinceJan1 + jan1.getDay() + 1) / 7)` does not align with calendar week boundaries consistently. Saturday and Sunday can end up in different "weeks," causing the streak to reset prematurely.

## Fix

**File: `src/pages/Dashboard.tsx` (lines 13-36, `calcStreak` function)**

Replace the current week-number approach with an ISO-week-based calculation, which uses Monday as the start of each week. This is the standard used in baking/journaling contexts and avoids the Saturday/Sunday split issue.

Updated logic:
1. For each bake date, compute its ISO week number and year, and add it to a Set.
2. Compute the current ISO week.
3. Start checking from the current week. If the current week has no bakes, allow starting from the previous week (so the streak isn't broken just because you haven't baked yet this week).
4. Count consecutive weeks backward.

```typescript
function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  // Set to nearest Thursday (ISO weeks are Thursday-based)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getFullYear(), week };
}

function calcStreak(bakes: Bake[]): number {
  if (bakes.length === 0) return 0;

  const weekSet = new Set<string>();
  bakes.forEach((b) => {
    const d = new Date(b.date + 'T00:00:00');
    const { year, week } = getISOWeek(d);
    weekSet.add(`${year}-W${week}`);
  });

  const now = new Date();
  let { year: y, week: w } = getISOWeek(now);

  // If no bake this week, allow starting from last week
  if (!weekSet.has(`${y}-W${w}`)) {
    w--;
    if (w < 1) { y--; w = 52; }
  }

  let streak = 0;
  while (weekSet.has(`${y}-W${w}`)) {
    streak++;
    w--;
    if (w < 1) { y--; w = 52; }
    if (streak > 52) break;
  }
  return streak;
}
```

This ensures your bake on Feb 21 (Saturday) and today Feb 22 (Sunday) are in the same ISO week (week 8), so the streak correctly shows **1 week**.

## Files Modified
- `src/pages/Dashboard.tsx` -- replace `calcStreak` with ISO-week-based version
