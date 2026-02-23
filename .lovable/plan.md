

# Stretch-and-Fold Proofing Timer

## What changes

The Bulk Ferment section currently lets you pick a single total duration and counts down. Instead, it should work as a stretch-and-fold timer: when you tap "Start Proofing", it starts a 3-hour countdown and automatically fires a notification every 30 minutes (at 30m, 1h, 1h30, 2h, 2h30, 3h) to remind you to stretch and fold.

The duration selector pills (30m, 1h, etc.) will be replaced with a visual checklist showing all 6 stretch-and-fold intervals, each checking off as its notification fires.

## How it works for the user

1. Tap **Start Proofing** -- a single 3-hour countdown begins
2. Every 30 minutes, a notification fires: "Stretch & fold #1 (30 min)", "Stretch & fold #2 (1 hr)", etc.
3. The UI shows 6 interval markers. As each one is reached, it gets a checkmark
4. At 3 hours, the final notification says "Bulk ferment complete!"
5. A **Stop** button cancels everything

## Technical Details

**File: `src/pages/wizard/Step2Proofing.tsx`**

1. **Remove the duration selector pills** -- no more choosing between 30m/1h/etc. The total duration is always 3 hours (180 min).

2. **Add state to track completed folds:**
   ```tsx
   const [completedFolds, setCompletedFolds] = useState<number[]>([]);
   ```

3. **Update `recalcProofing`** to check elapsed time and mark folds as complete:
   - Calculate `elapsed = totalDuration - remaining`
   - For each interval in `[30, 60, 90, 120, 150, 180]`, if elapsed >= interval and not already in `completedFolds`, add it

4. **Update `scheduleNotifications`** to send stretch-and-fold messages:
   - At 30m: "Stretch & fold #1 -- 2h 30m remaining"
   - At 60m: "Stretch & fold #2 -- 2h remaining"
   - ...through to 180m: "Bulk ferment complete!"

5. **Replace the duration pills UI** with a vertical checklist of the 6 intervals:
   ```tsx
   <div className="space-y-2 mb-4">
     {INTERVALS.map((m, i) => (
       <div key={m} className="flex items-center gap-3 text-[13px]">
         <div className={completedFolds.includes(m) ? 'checkmark-done' : 'checkmark-pending'}>
           {completedFolds.includes(m) ? '✓' : (i + 1)}
         </div>
         <span>Stretch & fold at {m < 60 ? `${m}m` : `${m/60}h${m%60 ? ` ${m%60}m` : ''}`}</span>
       </div>
     ))}
   </div>
   ```

6. **Set `proofingMins` to a fixed 180** (remove the selector logic). The main countdown still shows the full remaining time.

7. **Pass `proofingMins` (180) to `onNext`** when proceeding to the next step.

## Files Modified
- `src/pages/wizard/Step2Proofing.tsx` -- replace duration selector with stretch-and-fold checklist, update notification messages, fix proofing to always be 3 hours with 30-min interval alerts
