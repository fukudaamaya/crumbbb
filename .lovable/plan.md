# Restructure Bake Wizard: Day 1 → Day 2 → Review

## Overview
Replace the current 4-step flow (Recipe → Proofing → Baking → Capture) with a 3-step flow (Day 1: Recipe → Day 2: Baking → Review). Remove timers entirely. Add new baking fields: preheat time, lid-on duration, lid-off duration.

## Database Migration
Add three new columns to the `bakes` table:
```sql
ALTER TABLE public.bakes ADD COLUMN preheat_time_mins integer NOT NULL DEFAULT 0;
ALTER TABLE public.bakes ADD COLUMN lid_on_mins integer NOT NULL DEFAULT 0;
ALTER TABLE public.bakes ADD COLUMN lid_off_mins integer NOT NULL DEFAULT 0;
```
The existing `bake_time_mins` and `proofing_time_mins` columns stay (proofing becomes unused but harmless; `bake_time_mins` can be kept or ignored).

## Type Changes (`src/types/bake.ts`)
Add `preheat_time_mins`, `lid_on_mins`, `lid_off_mins` to the `Bake` interface.

## Delete Files
- `src/pages/wizard/Step2Proofing.tsx` — removed entirely

## Rewrite Step 3 → Step 2: Day 2 Baking (`src/pages/wizard/Step3Baking.tsx`)
- Rename header to "Day 2 — Baking", step "2 of 3"
- Remove all timer logic (no start/stop/countdown)
- Fields: Oven Temp (respecting temp unit setting), Preheat Time (min), Duration with Lid On (min), Duration with Lid Off (min)
- Simple input form, same styling as Step 1
- Pass all four values to `onNext`

## Update Wizard (`src/pages/NewBakeWizard.tsx`)
- Remove Step2Proofing import and `handleStep2`
- Step 1 header: "Day 1 — Recipe Setup" (update in Step1Recipe)
- After Step 1 → go to Step 2 (was Step 3)
- Step 2 (Baking) → go to Step 3 (Review/Capture)
- Update `handleStep3` to accept new fields (`preheat_time_mins`, `lid_on_mins`, `lid_off_mins`)
- Include new fields in `addBake` / `updateBake` calls
- For past dates, skip from Step 1 directly to Review (step 3)

## Update Step Headers
- **Step1Recipe**: Change subtitle to "Day 1 — Recipe" and "Step 1 of 3"
- **Step4Capture**: Change to "Step 3 of 3" and "Review"

## Update BakeDetail ProcessCard
- Replace single "Bake Time" with Preheat, Lid On, Lid Off fields
- Keep oven temp as-is
- Remove proofing time display (or keep if value > 0 for legacy bakes)

## Update `useBakes.ts`
- Include new columns in row mapping, insert, and update calls

## Files Modified
- `src/types/bake.ts`
- `src/pages/wizard/Step1Recipe.tsx` (header text only)
- `src/pages/wizard/Step3Baking.tsx` (rewrite)
- `src/pages/wizard/Step4Capture.tsx` (header text)
- `src/pages/NewBakeWizard.tsx`
- `src/pages/BakeDetail.tsx` (ProcessCard)
- `src/hooks/useBakes.ts`
- Delete `src/pages/wizard/Step2Proofing.tsx`
