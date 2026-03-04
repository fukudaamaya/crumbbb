

# Recipe History Page

## Overview
When a user taps a saved recipe on the Dashboard, navigate to a new page that shows all past bakes matching that recipe name. The list reuses the same visual style as the Journal list view (thumbnail, date, star rating, notes).

## Changes

### New Route & Page
- **`src/pages/RecipeHistory.tsx`** — New page that:
  - Reads `recipeId` from URL params
  - Uses `useRecipes().getRecipe(recipeId)` to get recipe name
  - Uses `useBakes()` to filter bakes where `bake.name === recipe.name`
  - Renders a header with back arrow and recipe name
  - Renders matching bakes in a list identical to `BakeListView` (photo thumbnail, date, stars, notes)
  - Shows empty state if no matching bakes found
  - "Bake Again" button at the bottom

### Modified Files
- **`src/App.tsx`** — Add route `/recipe/:id` → `<RecipeHistory />`
- **`src/components/RecipeCard.tsx`** — Make the card itself tappable (navigates to `/recipe/${recipe.id}`). Keep "Bake Again" as a separate button, or move it to the history page.

### No database changes needed
Bakes are matched to recipes by name. All data already exists.

