

# Fix Broken Sesame Semolina Boule Photo

## Problem

The demo-5 "Sesame Semolina Boule" entry in `src/data/sampleBakes.ts` uses the Unsplash image `photo-1590137876181-2a5a7e340de2` which no longer resolves, resulting in a broken image.

## Fix

Replace the broken URL on line 126 of `src/data/sampleBakes.ts` with a working Unsplash image of a seeded bread loaf:

**Current (broken):**
```
https://images.unsplash.com/photo-1590137876181-2a5a7e340de2?w=400&h=400&fit=crop
```

**Replacement (working -- seeded bread loaf):**
```
https://images.unsplash.com/photo-1549931319-a545753467c8?w=400&h=400&fit=crop
```

If that ID also fails, a second alternative using a confirmed-working sesame bread close-up:
```
https://images.unsplash.com/photo-1608198093002-ad4e005571d5?w=400&h=400&fit=crop
```

## File Changed

- `src/data/sampleBakes.ts` -- line 126, swap the `photo_base64` URL.

No other files or backend changes needed.

