# Add Default Flour Types to Dropdown

## What changes

Expand the default flour types list so the dropdown always includes six common options, plus the ability for users to add their own custom types (which already works via the text input + datalist).

## Technical Details

**File: `src/hooks/useFlourTypes.ts**`

Update the `DEFAULTS` array on line 2 from just `['White bread flour']` to include all six flour types:

```tsx
// Before
const DEFAULTS = ['White bread flour'];

// After
const DEFAULTS = ['White bread flour', 'Whole wheat', 'Spelt', 'Rye', 'Buckwheat', 'Tipo 00'];
```

The "add your own" capability already exists -- the flour type input is a free-text field backed by a `<datalist>`, so users can type any custom flour name and it gets saved to localStorage for future use. No additional UI changes needed.

## Files Modified

- `src/hooks/useFlourTypes.ts` -- expand default flour types array