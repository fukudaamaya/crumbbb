

# Save & Reuse Recipes

## Overview
Allow users to save a recipe from any bake, view saved recipes on the dashboard, and "Bake Again" to pre-fill the wizard with that recipe's ingredients.

## Database

**New table: `recipes`**
```sql
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  loaf_count integer NOT NULL DEFAULT 1,
  loaf_weight_g integer NOT NULL DEFAULT 500,
  flours jsonb NOT NULL DEFAULT '[]',
  water_g integer NOT NULL DEFAULT 0,
  starter_g integer NOT NULL DEFAULT 0,
  leaven_g integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes" ON public.recipes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON public.recipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON public.recipes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON public.recipes FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

## New Files

1. **`src/hooks/useRecipes.ts`** — CRUD hook for recipes using `@tanstack/react-query` + Supabase, mirroring the `useBakes` pattern. Exports `useRecipes()` with `recipes`, `addRecipe`, `deleteRecipe`.

2. **`src/components/RecipeCard.tsx`** — Small card component showing recipe name, flour summary, and a "Bake Again" button.

## Modified Files

3. **`src/pages/BakeDetail.tsx`** — Add a "Save Recipe" button (e.g. `BookmarkPlus` icon) below the flour blend card. On tap, extract `name`, `loaf_count`, `loaf_weight_g`, `flours`, `water_g`, `starter_g`, `leaven_g` from the bake and insert into `recipes` via `useRecipes().addRecipe()`. Show a toast on success.

4. **`src/pages/Dashboard.tsx`** — Add a "Saved Recipes" section after favourites. Render each recipe as a `RecipeCard`. "Bake Again" navigates to `/bake/new/1?recipe={recipeId}`.

5. **`src/pages/NewBakeWizard.tsx`** — Read `recipe` search param. If present, fetch the recipe and pass its fields as `initialData` to `Step1Recipe`, pre-filling name, loaf count, weight, flours, water, starter, leaven. Date defaults to today.

6. **`src/pages/wizard/Step1Recipe.tsx`** — No structural changes needed; it already accepts `initialData` and uses it to initialize state.

## User Flow

1. User opens a bake detail → taps "Save Recipe" → recipe saved, toast confirms
2. User visits Dashboard → sees "Saved Recipes" section → taps "Bake Again"
3. Wizard opens at Step 1 with all recipe fields pre-filled, date set to today
4. User adjusts if needed → proceeds through wizard normally

