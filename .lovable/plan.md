

## Findings

Looking at `src/pages/wizard/Step3Baking.tsx`:

**Default values (current → desired):**
- `bake_temp_c`: 250 → **230**
- `preheat_time_mins`: 60 → 60 (already correct)
- `lid_on_mins`: 20 → **25**
- `lid_off_mins`: 25 → 25 (already correct)

**The "025" bug:**
The number inputs use `value={preheat}` where `preheat` is a `number`. When the state is `0`, the input displays "0". When the user types "25", React appends to the existing "0" because `Number(e.target.value)` followed by re-render doesn't strip the leading zero from typed input — actually the real cause is that `Number("025")` becomes `25`, but when the user types into a field showing `0`, the browser places the cursor after the `0`, so typing "25" produces "025" in the DOM, which `Number()` converts to `25`, but on the next keystroke or if the user clears partially, the displayed value can desync.

The cleaner fix: store the input as a string while editing (or treat empty/NaN gracefully), so `0` doesn't stick as a prefix. Specifically, when the field is focused and the user starts typing, the leading `0` should be replaceable.

The simplest robust fix: use string state for the input fields, parse to number only on submit. Or: on change, if the user types a value, set state to the parsed number directly (which strips leading zeros), AND ensure the displayed `value` reflects the parsed number. The issue here is likely that the user is interpreting "025" appearing momentarily — but more likely the inputs initialize from `initialData ?? <default>`, and when `initialData` is `0` (from the draft created in `NewBakeWizard` which sets `bake_temp_c: 0`, `preheat_time_mins: 0`, etc.), the field shows `0` and typing prepends.

Confirmed: in `NewBakeWizard.tsx`, when a draft is created via "Continue to Baking", all baking fields are initialized to `0`. So `Step3Baking` receives `initialData.preheat_time_mins = 0`, displays `0`, and typing "25" yields "025" → `25` numerically, but visually "025" until blur/re-render.

## Plan

Update `src/pages/wizard/Step3Baking.tsx`:

1. **Update default values** when `initialData` field is missing OR is `0` (treat 0 as "unset" for these baking fields):
   - `bake_temp_c`: default to **230**
   - `preheat_time_mins`: default to **60**
   - `lid_on_mins`: default to **25**
   - `lid_off_mins`: default to **25**

2. **Fix the leading-zero typing bug** by switching the four number inputs to controlled string state:
   - Hold each field as a `string` in local state
   - On change: accept the raw string (allowing empty while editing)
   - On blur: if empty or invalid, snap back to the default
   - On submit (`handleNext`): parse strings to numbers, applying defaults for empty values, then convert temp F→C as needed

This eliminates the "025" display because typing into a string-backed input naturally replaces/edits text without numeric coercion artifacts, and an empty field stays empty instead of reverting to `0`.

3. **Preserve existing behavior:**
   - Temperature unit conversion (°C ↔ °F) on display and submit
   - Layout, styling, header, progress bar, Skip/Back/Next actions all unchanged

**File to modify:** `src/pages/wizard/Step3Baking.tsx` (only)

