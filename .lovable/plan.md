

# Rearrange BakeDetail Layout

## Changes to `src/pages/BakeDetail.tsx`

### 1. Move the Heart from the header to inline with the title
- Remove the heart button from the sticky header bar (keep only the back arrow in the header).
- Place the heart button on the same row as the bake name, aligned to the right edge. The name and heart will sit in a `flex justify-between items-center` container.

### 2. Move Notes above Flour Blend
- Relocate the Notes section (label + textarea/text) from its current position (below Process) to directly below the star rating row and above the Flour Blend card.

### Layout After Changes

```text
[back arrow]                        <- header (no heart)

[photo]

Bake Name                   [heart] <- same row
Date
* * * * *

Notes                               <- moved up
[textarea / text]

Flour Blend card
Baker's Percentages card
Process card
[Delete button]
```

### Technical Details
- In the header, remove the heart `<button>` entirely.
- Wrap the name heading and a new heart button in a `flex items-center justify-between` div.
- Cut the Notes block from its current location and paste it immediately after the star rating `<div>`, before the Flour Blend card.
- No prop or hook changes needed -- all data and handlers already exist in the component.

