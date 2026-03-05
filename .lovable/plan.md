

# Edit Full Bake Entry from BakeDetail

## Problem
The bake detail page only allows inline editing of photos, title, date, rating, and notes. Flour blend, percentages, and process details are read-only. The user wants full edit capability.

## Layout Changes

**Header**: Move `Heart` favourite icon to the header right side (replacing the empty spacer div). No edit button in header.

**Title row**: Remove inline pencil icons from title and date. Add an "Edit" button (pencil icon or text) right-aligned on the same row as the title, where the Heart currently sits. Tapping it navigates to `/bake/new/1?edit={bakeId}`.

```
Header:  [← Back]                    [Heart]
Title:   [Bake Name]                  [Edit ✎]
```

## Changes

### `src/pages/BakeDetail.tsx`
- Move `Heart` toggle into the header (replace `<div className="w-8" />`)
- Replace the Heart button next to the title with an Edit button (Pencil icon) that navigates to `/bake/new/1?edit={bakeId}`
- Remove inline pencil icons from title and date (no longer inline-editable — full edit via wizard)
- Keep notes textarea and star rating as inline-editable

### `src/pages/NewBakeWizard.tsx`
- Read `edit` search param alongside existing `recipe` param
- If `edit` is present, load the bake via `useBakes()` and pre-fill all wizard fields (name, date, flours, water, starter, leaven, proofing time, bake temp, bake time, loaf count, loaf weight)
- On final submit: call `updateBake(editId, ...)` instead of `addBake(...)`, then navigate to `/bake/{id}`

### No database changes needed

