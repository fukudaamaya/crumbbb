

# Add Secondary "Continue to Baking" CTA on Step 1

## Overview
Add a second button below "Save" on the Recipe Setup page. "Save" saves as draft and returns to calendar (Flow 1 — two-day bake). "Continue to Baking →" saves and advances to Step 2 (Flow 2 — log everything in one session).

## Changes

### `src/pages/wizard/Step1Recipe.tsx`
- Add a new `onContinue` callback prop alongside `onNext`
- Below the "Save" button, add a secondary text/link-style button: **"Continue to Baking →"**
- "Save" calls `onNext` (existing behavior). "Continue to Baking" calls `onContinue` with the same data.

### `src/pages/NewBakeWizard.tsx`
- Pass a new `onContinue` handler to `Step1Recipe`
- For new bakes: saves the bake as draft (same as current `handleStep1`), then instead of navigating home, stores the new bake ID and advances to Step 2 with `?continue=<id>` behavior (sets bakeData + step 2)
- For edits: both buttons advance to Step 2 (same behavior, since editing is always a single flow)

