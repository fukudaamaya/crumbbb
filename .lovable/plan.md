

# Fixes and Updates

## 1. Dashboard: Remove "Top Bakes"
**`src/pages/Dashboard.tsx`** — Delete the entire "Top Bakes" section (the `topBakes` memo and its rendering block). Keep only Streak, Month/Year stats, Favourites, and Saved Recipes.

## 2. Compact Recipe Cards + Move Actions Into Recipe History
**`src/components/RecipeCard.tsx`** — Simplify to a compact tappable card: recipe name, flour summary, and basic stats (loaf count, weight). Remove the trash icon and "Bake Again" button entirely.

**`src/pages/RecipeHistory.tsx`** — Add edit and delete options for the recipe itself (e.g., an options menu or buttons in the header/footer). Keep the existing "Bake Again" button at the bottom. Add a delete confirmation sheet.

**`src/hooks/useRecipes.ts`** — Ensure `deleteRecipe` and `updateRecipe` (if not already available) are exposed and passed through.

## 3. Fix Photo Delete + Add Reorder in BakeDetail
**`src/pages/BakeDetail.tsx`** — The `handleRemovePhoto` function exists but may not work due to carousel state issues. Fix by:
- After removing a photo, reset `currentSlide` to stay in bounds
- Add drag-to-reorder or arrow buttons (move left/move right) for each photo in the carousel
- Add a `handleMovePhoto(fromIndex, toIndex)` function that reorders the `photos` array and calls `updateBake`

## 4. Inline Process Editing in BakeDetail
**`src/pages/BakeDetail.tsx`** — Make the Process card (proofing time, oven temp, bake time) editable inline:
- Add a pencil/edit toggle on the Process card header
- When editing, show number inputs for each field
- On blur or confirm, call `updateBake` with the new values
- Respect the temperature unit setting for display/input

## Technical Details

### Photo reorder UI
Simple approach: show small left/right arrow buttons on either side of each carousel photo when in an "edit photos" mode, or always-visible move buttons below the carousel dots.

### Process inline edit
Toggle between read-only display and input fields within the same card, similar to how notes already work with a textarea.

