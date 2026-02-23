

# Stretch & Fold Cards -- 3x2 Grid Layout

## What changes

Replace the 6-row vertical checklist with a 3x2 grid of 6 individual cards. Each card represents one stretch-and-fold interval, shows the target clock time, and gets a checkmark when complete.

## How it looks

```text
Row 1:
+----------+  +----------+  +----------+
| S&F #1   |  | S&F #2   |  | S&F #3   |
| 12:30    |  | 13:00    |  | 13:30    |
+----------+  +----------+  +----------+

Row 2:
+----------+  +----------+  +----------+
| S&F #4   |  | S&F #5   |  | Done!    |
| 14:00    |  | 14:30    |  | 15:00    |
+----------+  +----------+  +----------+
```

- Before proofing starts, times are projected based on "if started now"
- Once started, times lock to actual schedule
- Completed intervals show a checkmark with highlighted styling

## Technical Details

**File: `src/pages/wizard/Step2Proofing.tsx`**

1. **Add `proofingStartTime` state** (number or null) to lock clock times when "Start Proofing" is tapped. Set it in `startProofing`, clear it in `stopAll`.

2. **Derive clock times** for each interval:
   - Base = `proofingStartTime ?? Date.now()`
   - Each interval's time = `new Date(base + m * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })`

3. **Replace the checklist** with a `grid grid-cols-3 gap-3` containing 6 cards:
   - Each card uses `crumb-card` styling (compact padding)
   - Shows: fold number or "Done!" label, checkmark circle when complete, and the target clock time
   - Completed cards get `bg-primary/10` tint and a check icon
   - Pending cards show the number in a muted circle

4. **Keep all existing timer logic unchanged** -- the countdown, notifications, and `completedFolds` tracking remain the same.

## Files Modified
- `src/pages/wizard/Step2Proofing.tsx` -- replace 6-row checklist with a 3-column, 2-row grid of 6 individual interval cards, add start-time tracking for clock-time display

