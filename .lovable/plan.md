

## Plan

Make all list view cards the same height by always rendering the notes line — when notes are missing, show italicised placeholder "Add a note...".

## Change

**`src/components/BakeListView.tsx`** — replace the conditional notes block:

```tsx
{bake.notes ? (
  <p className="text-muted-foreground text-[12px] mt-1 truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
    {bake.notes}
  </p>
) : (
  <p className="text-muted-foreground/60 text-[12px] mt-1 truncate italic" style={{ fontFamily: 'DM Sans, sans-serif' }}>
    Add a note...
  </p>
)}
```

This guarantees a fourth text line on every card, so all cards have identical height. The placeholder uses reduced opacity + italic to read as a hint, not real content. Tapping the card still opens the bake detail where the user can add a note.

**File to modify:** `src/components/BakeListView.tsx` (only)

