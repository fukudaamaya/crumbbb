

# Update Default Values in Step 1 Recipe

## What changes

Update the default ingredient values in Step 1 of the bake wizard so new bakes start with more realistic defaults.

## Current vs New Defaults

| Field  | Current | New |
|--------|---------|-----|
| Water  | 375g    | 375g (no change) |
| Leaven | 0g      | 100g |
| Salt   | 100g    | 10g  |

## Technical Details

**File: `src/pages/wizard/Step1Recipe.tsx`**

Update two `useState` initializers (around lines 50-51):

- Change `leaven` default from `0` to `100`
- Change `starter` (salt) default from `100` to `10`

```tsx
// Before
const [starter, setStarter] = useState(initialData?.starter_g ?? 100);
const [leaven, setLeaven] = useState(initialData?.leaven_g ?? 0);

// After
const [starter, setStarter] = useState(initialData?.starter_g ?? 10);
const [leaven, setLeaven] = useState(initialData?.leaven_g ?? 100);
```

## Files Modified
- `src/pages/wizard/Step1Recipe.tsx` -- update default values for leaven and salt

