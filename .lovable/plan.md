

# Add Bread Images to Demo Bakes

## Overview
Add real bread photos to the 5 sample bake entries so they appear as circular thumbnails in the year overview calendar and throughout the demo experience.

## Approach
Update `src/data/sampleBakes.ts` to set the `photo_base64` field to Unsplash image URLs for each entry. Despite the field name, it's used directly as an `img src`, so regular URLs work perfectly -- no base64 encoding needed.

## Image Assignments
Each demo bake gets a matching bread photo from Unsplash (using their free image CDN with size parameters for fast loading):

1. **Classic Country Loaf** -- Rustic sourdough boule
2. **Rye and Caraway** -- Dark rye loaf
3. **Olive and Rosemary Focaccia** -- Focaccia flatbread
4. **Spelt Sandwich Loaf** -- Sliced sandwich bread
5. **Sesame Semolina Boule** -- Sesame-topped round loaf

## Technical Details

### File to modify
- **`src/data/sampleBakes.ts`** -- Replace each `photo_base64: ''` with a URL string pointing to an appropriately sized Unsplash image (around 400x400px for fast loading while looking sharp in both the small calendar dots and the detail view).

### No other changes needed
The DotCalendar, BakeListView, Dashboard, and BakeDetail components already handle the `photo_base64` field and will display the images automatically.

