

# Multi-Photo Support (Up to 5 Photos per Bake)

## What changes

When logging a bake in Step 4 (Capture), users can add up to 5 photos instead of just one. Photos display in a swipeable carousel with dot indicators and left/right arrows. The first photo is mirrored to the legacy `photo_base64` column for backward compatibility (list thumbnails, etc.).

## How it works

- The "Tap to add photo" button lets you add photos one at a time (camera or library)
- After adding a photo, a small "+ Add" button appears to add more (up to 5)
- When 2+ photos exist, they display in a horizontal carousel with dot indicators below
- Each photo has a small "X" button to remove it
- The Bake Detail page also shows the carousel when viewing a saved bake

## Technical Details

### 1. Database migration -- add `photos` JSONB column

```sql
ALTER TABLE public.bakes
  ADD COLUMN photos jsonb NOT NULL DEFAULT '[]'::jsonb;
```

### 2. `src/types/bake.ts` -- add `photos` field

Add `photos: string[]` to the Bake interface (array of base64 strings).

### 3. `src/pages/wizard/Step4Capture.tsx` -- multi-photo capture

- Replace `loafPhoto` (single string) with `photos` (string array, max 5)
- Update `onSave` interface: replace `photo_base64` / `crumb_photo_base64` with `photos: string[]`
- Show a carousel (using Embla via the existing `Carousel` UI component) when 2+ photos
- Show single image view when exactly 1 photo
- Show "Tap to add photo" placeholder when 0 photos
- Add "+ Add photo" button below photos when count is between 1 and 4
- Each photo gets a small "X" remove button
- Dot indicators below the carousel showing current slide

### 4. `src/pages/NewBakeWizard.tsx` -- update handleSave

- Accept `photos: string[]` from Step4Capture instead of `photo_base64` / `crumb_photo_base64`
- Set `photo_base64` to `photos[0] ?? ''` for backward compatibility (list thumbnails)
- Set `crumb_photo_base64` to `''`
- Pass `photos` array to the Bake object

### 5. `src/hooks/useBakes.ts` -- persist photos array

- Map the `photos` JSONB column in `rowToBake`
- Include `photos` in the insert/update payloads (cast as `any` for JSONB)

### 6. `src/pages/BakeDetail.tsx` -- show photo carousel

- Read `bake.photos` (fall back to `[bake.photo_base64].filter(Boolean)` for older bakes)
- Display carousel with dot indicators when 2+ photos
- Single image when 1 photo
- "Tap to add photo" placeholder when 0

### 7. `src/data/sampleBakes.ts` -- add `photos` to demo data

Populate the `photos` field with the existing Unsplash URLs so demo bakes show at least 1 photo each.

## Files Modified
- Database migration (new `photos` column)
- `src/types/bake.ts`
- `src/pages/wizard/Step4Capture.tsx`
- `src/pages/NewBakeWizard.tsx`
- `src/hooks/useBakes.ts`
- `src/pages/BakeDetail.tsx`
- `src/data/sampleBakes.ts`

