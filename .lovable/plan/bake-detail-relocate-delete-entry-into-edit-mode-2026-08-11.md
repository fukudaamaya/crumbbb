# Bake Detail: Relocate Delete Entry into Edit Mode

## Goal
Make the "Delete Entry" action less prominent by hiding it from the regular bake detail view and only surfacing it inside the on-page edit flow.

## Current State
- `src/pages/BakeDetail.tsx` renders a full-width "Delete Entry" button at the bottom of the page for all non-demo bakes (lines ~833-842).
- The page already has a global edit mode toggled by the pencil icon in the header, with `Save` / `Cancel` controls in the header while editing.

## Changes
1. **Hide "Delete Entry" in read-only view**
   - Remove the existing bottom "Delete Entry" button from the default (non-editing) layout.

2. **Show save/delete actions while editing**
   - When `editing` is true, render a new action block at the bottom of the scrollable content:
     - Primary "Save Entry" button (uses existing `saveEdit` logic).
     - Below it, a less prominent "Delete Entry" button that opens the existing delete confirmation modal (`setShowDelete(true)`).
   - Keep the existing header `Check` / `Cancel` controls as the quick way out of edit mode; the bottom "Save Entry" gives a clear call-to-action near the delete option.

3. **Preserve existing delete confirmation**
   - Reuse the current `showDelete` modal and `confirmDelete` flow so no new deletion logic is introduced.

## Files Affected
- `src/pages/BakeDetail.tsx`

## Verification
- Build/type-check passes.
- In read-only view, no "Delete Entry" button is visible.
- Tapping the pencil enters edit mode and reveals both "Save Entry" and "Delete Entry" at the bottom.
- Tapping "Delete Entry" still opens the confirmation modal and deletes the bake on confirm.
