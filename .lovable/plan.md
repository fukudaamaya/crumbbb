

# Add "Add-ins" Section to Recipe Setup

## Overview
Add a new "Add-ins" section to Step 1 (Recipe Setup) for optional ingredients like poppy seeds, olives, nuts, etc. Each add-in has a name and weight in grams.

## Database
Add an `add_ins` JSONB column to the `bakes` table (matching the pattern used for `flours`):
```sql
ALTER TABLE public.bakes ADD COLUMN add_ins jsonb NOT NULL DEFAULT '[]';
ALTER TABLE public.recipes ADD COLUMN add_ins jsonb NOT NULL DEFAULT '[]';
```

## Type Changes
**`src/types/bake.ts`** — Add `AddIn` interface (same shape as `Flour`: `{ name: string; grams: number }`) and add `add_ins: AddIn[]` to the `Bake` interface.

## Step1Recipe Changes
**`src/pages/wizard/Step1Recipe.tsx`** — Add an "Add-ins" section after the flour builder, using the same UI pattern (list of name + grams inputs, add/remove buttons). Add-ins are optional and start empty. Include a baker's percentage display for each add-in.

## Data Flow
- **`src/pages/NewBakeWizard.tsx`** — Pass `add_ins` through `Step1Data` → `bakeData` → final `Bake` object on save/update.
- **`src/hooks/useBakes.ts`** — Include `add_ins` in insert/update calls (verify it flows through).
- **`src/hooks/useRecipes.ts`** — Include `add_ins` in recipe CRUD so recipes remember their add-ins.
- **`src/pages/BakeDetail.tsx`** — Display add-ins in the recipe details section if any exist.
- **`src/pages/RecipeHistory.tsx`** / **`src/components/RecipeCard.tsx`** — No changes needed (add-ins are detail-level data).

## UI Preview
```
Add-ins (optional)
[Poppy seeds        ] [10 g] [×]
[+ Add ingredient]
```

