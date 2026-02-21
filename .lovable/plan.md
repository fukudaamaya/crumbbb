

# Allow Up to 5 Photos Per Bake

## Overview

Replace the single "Loaf Photo" field with a multi-photo gallery supporting up to 5 photos. The first photo remains the "hero" image shown in list views and cards.

## Database Change

Add a new `photos` jsonb column to the `bakes` table to store an array of base64 strings. Keep the existing `photo_base64` column for backward compatibility (it will hold the first photo for list/card thumbnails).

```sql
ALTER TABLE bakes ADD COLUMN photos jsonb NOT NULL DEFAULT '[]'::jsonb;
```

## Changes

### 1. `src/types/bake.ts`
- Add `photos: string[]` field to the `Bake` interface.

### 2. `src/hooks/useBakes.ts`
- Map the new `photos` column from DB rows, defaulting to `[]`.
- When inserting/updating, include the `photos` field (cast as jsonb).

### 3. `src/pages/wizard/Step4Capture.tsx` (major change)
- Replace single `loafPhoto` state with `photos: string[]` state.
- Show a horizontal scrollable row of photo thumbnails with an "add" button (visible when < 5 photos).
- Each thumbnail has an "X" button to remove it.
- The action sheet (Camera / Photo Library) adds a new photo to the array.
- On save, pass `photo_base64: photos[0] || ''` and `photos` to the parent.
- Show a "1 / 5", "2 / 5" counter so users know their limit.

### 4. `src/pages/NewBakeWizard.tsx`
- Update `handleSave` to include `photos` in the bake object.
- Update the `Step4Capture` `onSave` callback type to include `photos: string[]`.

### 5. `src/pages/BakeDetail.tsx`
- Show a horizontally scrollable photo gallery instead of a single image.
- Allow adding more photos (up to 5) via the existing action sheet.
- Allow removing individual photos.
- Keep `photo_base64` synced with `photos[0]` when updating.

### 6. `src/components/BakeListView.tsx`
- No change needed -- it already uses `bake.photo_base64` for the thumbnail, which will continue to hold the first photo.

## Technical Details

### Photo array state in Step4Capture:
```typescript
const [photos, setPhotos] = useState<string[]>([]);

const addPhoto = async (file: File) => {
  if (photos.length >= 5) return;
  const compressed = await compressImage(file);
  setPhotos(prev => [...prev, compressed]);
};

const removePhoto = (index: number) => {
  setPhotos(prev => prev.filter((_, i) => i !== index));
};
```

### Gallery UI (Step4Capture):
- Horizontal scroll row with photo thumbnails (80x80px, rounded).
- Each has an X overlay button in the corner.
- A dashed "+" card at the end when count < 5.
- Tapping "+" opens the Camera/Library action sheet.

### Save payload update:
```typescript
onSave({
  photo_base64: photos[0] || '',
  crumb_photo_base64: '',
  photos,
  notes,
  rating,
});
```

### BakeDetail gallery:
- Horizontal scroll of all photos from `bake.photos` (falling back to `[bake.photo_base64]` for older bakes).
- Tap any photo to view it larger (or keep current full-width display for the selected photo).

