# Remove "Save Recipe" from Bake Detail

## Goal
Eliminate the confusing "Save Recipe" action on the baked-loaf detail page. Bakes are already persisted, so a separate "Save Recipe" button next to "Add to Favourites" feels redundant.

## Changes
1. **Remove the "Save Recipe" button** from `src/pages/BakeDetail.tsx` (the card currently rendered between Notes and Favourites).
2. **Clean up supporting code** in the same file:
   - Remove `isRecipeSaved` computation.
   - Remove `handleSaveRecipe` callback.
   - Remove `addRecipe` from the `useRecipes` hook call and the `BookmarkPlus` / `BookmarkCheck` imports if they are no longer used elsewhere in the file.
3. **Keep "Add to Favourites"** as the single quick action below the bake details.

## Outcome
- The bake detail page has one less redundant action.
- Favouriting remains unchanged.
- Existing recipes in the Dashboard "Saved Recipes" list are unaffected; new recipes can no longer be created from this page.
