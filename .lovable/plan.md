

# UI Tweaks to Add-ins and Flour Blend

## Changes (single file: `src/pages/wizard/Step1Recipe.tsx`)

### 1. Add-ins: Remove percentage column
Remove the `<span>` showing `calcPct(a.grams, totalFlour)%` from each add-in row (lines 280-283). Keep only name input, grams input, and remove button.

### 2. Flour Blend: Remove datalist dropdown
Remove the `<datalist id="flour-types-list">` element (lines 214-216) and the `list="flour-types-list"` attribute from flour type inputs (line 223). Also remove the `flourTypes` state and `getFlourTypes` import since they're no longer needed. The default first flour remains "White bread flour" — users simply type any flour name.

