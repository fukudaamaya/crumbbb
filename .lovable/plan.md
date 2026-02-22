

# Make Text Colors Adapt to Accent Color

## What changes

When you change the accent color, section labels (like "Start of the Week", "Temperature Unit") and other muted text will shift to match the accent's hue instead of staying warm brown. For example, selecting Forest Green will give those labels a muted green tone.

## How it works

Each accent color definition will get a new `muted` property -- a softer, lighter version of the accent hue suitable for secondary text. The `applyAccent` function will then also update the `--muted-foreground` CSS variable, so all text using that token automatically adapts.

## Technical Details

**File: `src/contexts/SettingsContext.tsx`**

1. Add a `muted` field to the `AccentColor` interface and each entry in `ACCENT_COLORS`. Each muted value uses the same hue as the accent but with lower saturation and moderate lightness (around 35-40%) so it reads well on cream:

| Color         | Primary HSL        | Muted HSL (new)     |
|---------------|--------------------|--------------------|
| Maroon        | 0 46% 33%          | 28 40% 35%         |
| Terracotta    | 16 60% 40%         | 16 30% 38%         |
| Forest        | 152 40% 28%        | 152 25% 32%        |
| Navy          | 220 50% 30%        | 220 30% 35%        |
| Charcoal      | 0 0% 25%           | 0 0% 35%           |
| Teal          | 180 45% 30%        | 180 25% 35%        |
| Plum          | 290 35% 35%        | 290 20% 38%        |
| Burnt Orange  | 25 80% 42%         | 25 35% 38%         |

2. Update `applyAccent()` to also set `--muted-foreground`:

```tsx
function applyAccent(name: string) {
  const color = ACCENT_COLORS.find(c => c.name === name) ?? ACCENT_COLORS[0];
  document.documentElement.style.setProperty('--primary', color.primary);
  document.documentElement.style.setProperty('--accent', color.accent);
  document.documentElement.style.setProperty('--ring', color.primary);
  document.documentElement.style.setProperty('--secondary-foreground', color.primary);
  document.documentElement.style.setProperty('--muted-foreground', color.muted);
}
```

No changes needed to Settings.tsx or any other component -- they already use `text-muted-foreground` which will now respond to the accent choice.

## Files Modified
- `src/contexts/SettingsContext.tsx` -- add `muted` field to accent colors and update `applyAccent` to set `--muted-foreground`
