
# Fix Baker's Percentages Labels

## Problem
The Baker's Percentages box on the bake detail page shows **Hydration, Starter, Leaven** but the recipe setup (Step 1) labels these fields as **Water, Leaven, Salt**. The labels should match: **Hydration, Leaven, Salt**.

## Change

**File: `src/pages/BakeDetail.tsx` (lines 253-256)**

Update the array from:
```typescript
{ label: 'Hydration', value: `${bake.hydration_pct}%` },
{ label: 'Starter', value: `${bake.starter_pct}%` },
{ label: 'Leaven', value: `${bake.leaven_pct}%` },
```

To:
```typescript
{ label: 'Hydration', value: `${bake.hydration_pct}%` },
{ label: 'Leaven', value: `${bake.leaven_pct}%` },
{ label: 'Salt', value: `${bake.starter_pct}%` },
```

This reorders the items to match the recipe setup and renames "Starter" to "Salt". The underlying data fields (`starter_pct`, `leaven_pct`) stay the same -- only the display labels and order change.

## Files Modified
- `src/pages/BakeDetail.tsx` -- 1 line change (swap labels and order)
