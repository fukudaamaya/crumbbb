# Restructure Bake Wizard: Day 1 → Day 2 → Review

## Overview

Replace the current 4-step flow with a 3-step flow: Day 1 (Recipe), Day 2 (Baking), and Review. Remove all timers. Add new baking fields for preheat time, lid-on duration, and lid-off duration.

## Database

Add three new columns to the `bakes` table:

- `preheat_time_mins` (integer, default 0)
- `lid_on_mins` (integer, default 0)
- `lid_off_mins` (integer, default 0)

## Changes

### Types (`src/types/bake.ts`)

Add `preheat_time_mins`, `lid_on_mins`, `lid_off_mins` to the `Bake` interface.

### Delete `src/pages/wizard/Step2Proofing.tsx`

### Rewrite `src/pages/wizard/Step3Baking.tsx`

- Header: "Day 2 — Baking"
- Remove all timer logic
- Fields: Oven Temp, Preheat Time (min), Lid On (min), Lid Off (min)
- Pass all values to `onNext`

### Update `src/pages/wizard/Step1Recipe.tsx`

- Header text: "Day 1 — Recipe"

### Update `src/pages/wizard/Step4Capture.tsx`

- Header text: "Review"

### Update `src/pages/NewBakeWizard.tsx`

- Remove Step2Proofing import and handler
- Step 1 → Step 2 (Baking) → Step 3 (Review)
- Past dates: Step 1 → Step 3 directly
- Include new fields in save logic

### Update `src/pages/BakeDetail.tsx` ProcessCard

- Replace single bake time with Preheat, Lid On, Lid Off
- Keep oven temp; remove proofing time (or show for legacy)

### Update `src/hooks/useBakes.ts`

- Include new columns in mapping, insert, update