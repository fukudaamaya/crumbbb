

# Fix Timers Pausing When App is Backgrounded

## Problem
All timers (autolyse, proofing, baking) use `setInterval` to count down by 1 second. Mobile Safari pauses these intervals when the app is in the background, so the timer freezes and only resumes when you switch back.

## Solution
Instead of decrementing a counter each second, store the **end timestamp** (`Date.now() + duration`). Each tick calculates time remaining from the current time. When the app comes back to the foreground, the timer instantly shows the correct remaining time -- or fires the completion if time has elapsed.

Additionally, listen for the `visibilitychange` event to immediately recalculate when the user returns to the app.

## Files to Modify

### `src/pages/wizard/Step2Proofing.tsx`
- Replace `autolyseSecsLeft` countdown logic with an `autolyseEndTime` ref (stores `Date.now() + 30*60*1000`)
- Replace `proofingSecsLeft` countdown logic with a `proofingEndTime` ref
- On each `setInterval` tick (every 250ms for snappier updates), calculate `Math.max(0, Math.ceil((endTime - Date.now()) / 1000))`
- Add a `visibilitychange` listener that recalculates immediately when the page becomes visible
- Fire completion (notification, state change) if remaining time is 0 when recalculating

### `src/pages/wizard/Step3Baking.tsx`
- Same pattern: store `bakeEndTime` ref instead of decrementing `secsLeft`
- Calculate remaining from `Date.now()` on each tick
- Add `visibilitychange` listener for instant catch-up

## How It Works

```text
Current (broken):
  Start --> secsLeft = 1800
  Tick  --> secsLeft = 1799, 1798, ...
  Background --> intervals paused --> timer freezes

Fixed:
  Start --> endTime = Date.now() + 1800000
  Tick  --> remaining = (endTime - Date.now()) / 1000
  Background --> intervals paused
  Resume --> remaining recalculated instantly from real clock
```

## No visual or functional changes
The timer UI stays exactly the same. Users just get accurate countdowns that survive backgrounding the app.
