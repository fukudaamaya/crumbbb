

# Fix Broken Demo Bread Images

## Problem

3 of the 5 sample bake images in `src/data/sampleBakes.ts` use Unsplash photo URLs that no longer resolve, causing the circular thumbnails to show the bread emoji fallback instead of actual photos.

**Broken entries:**
- demo-1 (Classic Country Loaf): `photo-1585478259715-876acc5be8eb`
- demo-4 (Spelt Sandwich Loaf): `photo-1549931319-a545753467c8`
- demo-5 (Sesame Semolina Boule): `photo-1555507036-ab1f4038024a`

**Working entries (no change needed):**
- demo-2 (Rye and Caraway): `photo-1509440159596-0249088772ff`
- demo-3 (Olive and Rosemary Focaccia): `photo-1568471173242-461f0a730452`

## Fix

Replace the 3 broken Unsplash URLs in `src/data/sampleBakes.ts` with working bread/sourdough image URLs from Unsplash:

| Bake | Old (broken) ID | New URL |
|------|-----------------|---------|
| Classic Country Loaf | `photo-1585478259715-876acc5be8eb` | A working Unsplash sourdough/country loaf image |
| Spelt Sandwich Loaf | `photo-1549931319-a545753467c8` | A working Unsplash sandwich loaf image |
| Sesame Semolina Boule | `photo-1555507036-ab1f4038024a` | A working Unsplash boule/round bread image |

## File Changed

- `src/data/sampleBakes.ts` -- swap the 3 broken `photo_base64` URLs with verified working Unsplash image links.

No other files or backend changes needed.
