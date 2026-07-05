## Goal

Replace the heart in `BakeDetail`'s header with a Pencil icon that toggles a full on-page edit mode for **title, date, notes, and ingredients**. The favourite (heart) moves to a button beside the existing "Save Recipe" card.

## Behavior

### Header
- Remove the `Heart` toggle from the top-right of the header.
- Replace it with a `Pencil` icon (same size/stroke as other header icons: `size={22} strokeWidth={2}`).
- While editing, the pencil becomes a `Check` icon that saves and exits edit mode. A small "Cancel" text button appears to its left.
- Also remove the existing inline "Edit" pencil-link next to the title (it currently opens the wizard) — its role is superseded by the new on-page mode.

### Edit mode (toggled by the pencil)
When `editing === true`, these blocks swap from read-only to editable inputs:

- **Title**: `<input>` bound to a local `name` state, styled with `crumb-input` at h1-ish size.
- **Date**: `<input type="date">` bound to a local `date` state (ISO `YYYY-MM-DD`). Rendered right under the title where the formatted date currently is.
- **Notes**: the existing textarea keeps its shape, but is fully controlled by local state (no more `onBlur` autosave).
- **Flour Blend** (`crumb-card`): each row becomes `type text` + `type number` pair, with a trash button; a `+ Add flour` row appends a new entry. Backed by a local `flours` array state.
- **Add-ins** (`crumb-card`): same pattern. Local `addIns` state. The card is always shown while editing (even when empty) so users can add entries.
- **Baker's percentages inputs**: also editable while in edit mode — treat `water_g`, `starter_g`, `leaven_g` as the "ingredients" inputs. Show three number inputs (`Water (g)`, `Starter (g)`, `Salt/Leaven (g)`) inside the same "Ingredients" area so the derived percentages recompute on save. (Percentages are computed from grams elsewhere, so we only save the grams.)

Outside edit mode: everything renders exactly as it does today.

### Save/cancel
- **Save (header check)**: writes a single `updateBake(bake.id, { name, date, notes, flours, add_ins, water_g, starter_g, leaven_g })` call, then exits edit mode.
- **Cancel**: discards local state, exits edit mode.
- If any required field is empty (name blank, no flours) — disable Save and highlight the offending field with `border-destructive`.

### Non-editable in this mode (unchanged)
- Photos, rating stars, process card (already has its own edit affordance), delete button.

### Favourite (heart) relocation
- New button rendered right beside the existing "Save Recipe" card at the same width, using `crumb-card` styling to match:
  - Label: "Add to Favourites" (or "Favourited" when `is_favourite`)
  - Left icon: `Heart` with the same fill/stroke logic used in the header today.
  - Clicking toggles `is_favourite` via `updateBake`.
- Layout: stack the two cards vertically (Save Recipe on top, Add to Favourites below) to match the existing spacing rhythm of the surrounding cards.
- In demo mode the button is disabled with reduced opacity (matches other demo-locked actions).

## Files to modify

- `src/pages/BakeDetail.tsx` — all changes are local to this file:
  1. Add `editing` state plus draft state for name/date/notes/flours/addIns/water/starter/leaven, seeded from `bake` when entering edit mode.
  2. Header: swap `Heart` for `Pencil` / `Check` + Cancel button; wire onClick handlers.
  3. Title/date/notes/flour/add-ins/percentages blocks: render editable variants when `editing`.
  4. Remove the current inline `Pencil` "Edit" link that navigates to the wizard.
  5. Add a new "Add to Favourites" `crumb-card` button just under the existing "Save Recipe" button.
  6. Keep the existing `ProcessCard`, delete button, and photo carousel untouched.

No context, hook, or DB changes needed — `updateBake` already accepts a partial `Bake` (`name`, `date`, `notes`, `flours`, `add_ins`, `water_g`, `starter_g`, `leaven_g`, `is_favourite` are all in the type).

## Notes

- The wizard-based edit route (`/bake/new/1?edit=<id>`) still works for users who deep-link to it; we just no longer surface a link to it from `BakeDetail`.
- Percentages (`hydration_pct`, `starter_pct`, `leaven_pct`) are display-only in the card; they recompute automatically wherever the app derives them from grams. If they are persisted values on `bake`, we'll recompute on save the same way the wizard does (I'll match the existing formula in `useBakes`/wizard).