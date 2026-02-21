

# Auto-Select Input Values on Focus

## Problem
When tapping into a numeric input (flour grams, water, leaven, salt), the cursor lands at the end of the existing number. Users have to manually delete before typing a new value.

## Solution
Add an `onFocus` handler that selects all text in the input, so typing immediately replaces the old value. This is a one-line change per input using `e.target.select()`.

## Files to Modify

### `src/pages/wizard/Step1Recipe.tsx`
Add `onFocus={(e) => e.target.select()}` to these numeric inputs:
- Flour grams inputs (line ~163, inside the flour builder loop)
- Target Weight input (line ~131)
- Water, Leaven, and Salt inputs (line ~180, inside the `.map()` loop)

This is a standard browser API -- selecting all text on focus means the next keystroke replaces the entire value rather than appending.

