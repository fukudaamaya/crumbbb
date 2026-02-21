

# Preserve List View When Navigating Back

## Problem

The Journal page stores its view mode (`grid` | `list`) in React component state via `useState('grid')`. When you navigate to a bake detail and then back, the Journal component remounts and resets to the default `'grid'` view.

## Solution

Persist the view mode in the URL search params (`?view=list`). This way, when the user navigates back, the URL retains the query parameter and the correct view is restored.

## Changes

### 1. `src/pages/Journal.tsx`
- Read the initial view mode from `useSearchParams` instead of hardcoding `'grid'`.
- When the user toggles the view, update the search param (using `setSearchParams` with `replace: true` so it doesn't pollute browser history).

### 2. `src/components/BakeListView.tsx`
- Update the navigation links for each bake card to include `?from=list` or simply ensure the Journal route already has `?view=list` in the back path. No change needed here since the browser back button will return to the URL with the query param intact.

### 3. `src/components/DotCalendar.tsx`
- Same as above -- verify that bake links navigate via standard `navigate()` so the browser history stack preserves the Journal URL with its search params.

## Technical Details

In `Journal.tsx`:
```typescript
const [searchParams, setSearchParams] = useSearchParams();
const [view, setView] = useState<ViewMode>(
  (searchParams.get('view') as ViewMode) || 'grid'
);

const handleSetView = (v: ViewMode) => {
  setView(v);
  setSearchParams({ view: v }, { replace: true });
};
```

Then replace `setView('grid')` / `setView('list')` calls with `handleSetView('grid')` / `handleSetView('list')`.

No backend or database changes required.

