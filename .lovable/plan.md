
# Remove Border from Bake Thumbnail in Grid View

## What changes
Remove the border from bake photo thumbnails in the dot calendar (grid view) so they appear borderless.

## Technical Details

**File: `src/components/DotCalendar.tsx`**

On line 104, remove the inline `style` attribute from the `<img>` element:

```tsx
// Before
<img
  src={bake.photo_base64}
  alt={bake.name}
  className="w-full h-full rounded-full object-cover"
  style={{ border: '1.5px solid hsl(var(--border))' }}
/>

// After
<img
  src={bake.photo_base64}
  alt={bake.name}
  className="w-full h-full rounded-full object-cover"
/>
```

## Files Modified
- `src/components/DotCalendar.tsx` -- remove inline border style from thumbnail image
