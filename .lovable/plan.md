## Goal

Fold the Process card into the top-level page edit mode so it no longer has its own pencil/check affordance.

## Change

**`src/pages/BakeDetail.tsx`** — `ProcessCard`:

- Remove its internal `editing` state and the local `Pencil` / `Check` header buttons.
- Add a new prop `editing: boolean` passed from the parent.
- When `editing` is true, render inputs (temp / preheat / lid on / lid off); when false, render read-only rows.
- Lift the four numeric values (`temp`, `preheat`, `lidOn`, `lidOff`) into the parent's draft state (`draftTemp`, `draftPreheat`, `draftLidOn`, `draftLidOff`), initialized in `enterEdit` alongside the other draft fields.
- `saveEdit` writes them via the existing `updateBake` call (add `bake_temp_c`, `preheat_time_mins`, `lid_on_mins`, `lid_off_mins` to the payload).
- Empty-state rule stays: if the card had no data before, only show it while `editing` is true (so users can add process values); otherwise hide.
- The `onSave` prop and the standalone save-in-card flow are removed — `ProcessCard` becomes purely presentational, driven by parent state.

No other files affected.