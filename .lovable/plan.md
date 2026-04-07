

# Fix Progress Bar & Inline Lid Durations

## Changes

### 1. Fix progress bar widths across all 3 steps

- **Step1Recipe.tsx** line 149: change `width: '25%'` → `width: '33%'`
- **Step3Baking.tsx** line 60: change `width: '66%'` → `width: '66%'` (already correct)
- **Step4Capture.tsx** line 131: `width: '100%'` (already correct)

### 2. Inline lid-on and lid-off fields in Step3Baking.tsx

Replace the two separate `<div>` blocks for "Duration with Lid On" and "Duration with Lid Off" (lines 74-83) with a single row using a two-column grid layout, so both fields sit side-by-side on the same line.

