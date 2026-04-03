# Split Bake Flow: Save on Day 1, Continue on Day 2

## Concept

After completing the recipe (Day 1), the bake is saved immediately as a "draft" and the user returns to the calendar. A placeholder circle appears for that bake's date. The next day, tapping the placeholder opens Day 2 (Baking) followed by Review.

## How to detect a draft bake

A bake is considered a draft if it has no photos AND `bake_temp_c === 0` (no baking data entered). No new DB column needed.

## Changes

### 1. `src/pages/wizard/Step1Recipe.tsx`

- Change the bottom CTA button text from "Next — Proofing Timer" to "Save"

### 2. `src/pages/NewBakeWizard.tsx`

- When `handleStep1` fires (and it's not an edit), immediately create and save the bake to the database with recipe-only data (baking fields zeroed, no photos), then navigate to `/` (calendar)
- Add support for a `?continue=<bakeId>` query param: when present, load the existing bake and start the wizard at Step 2 (Day 2 - Baking), then proceed to Step 3 (Review), then update the bake on save

### 3. `src/components/DotCalendar.tsx`

- Currently, tapping a date with a bake navigates to `/bake/:id`
- Change behavior: if the bake is a draft (no photos, `bake_temp_c === 0`), navigate to `/bake/new/2?continue=<bakeId>` instead of `/bake/:id`
- Draft bakes should render as a distinct placeholder (e.g., a dashed-border filled in with a light color to match the theme) rather than a photo thumbnail

### 4. `src/pages/BakeDetail.tsx`

- No changes needed — drafts won't be navigated to from the calendar (they go to the wizard instead)

## Technical Details

- The "continue" flow reuses `updateBake` (same as edit mode) but starts at Step 2 instead of Step 1
- The wizard's `handleSave` in continue mode calls `updateBake` with baking + review data, then navigates to `/bake/:id`
- `addBake` in useBakes already handles the insert; the new bake just has empty baking/photo fields