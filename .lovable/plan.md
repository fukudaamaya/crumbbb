

# Move "Explore Demo" CTA to a Top Banner

## What changes

Remove the `crumb-card` demo link from within the form area and replace it with a full-width maroon banner pinned to the top edge of the login page, matching the style of the existing `DemoBanner` component (`bg-primary text-primary-foreground`).

## Layout Order (top to bottom)

1. **Demo banner** -- full-width maroon bar at the top: "New here? Explore the demo first" with a "Try It" link
2. Centered form area: wordmark, subtitle, login form, dividers, Google sign-in, sign-up button

## Technical Details

**File: `src/pages/Login.tsx`**

1. Remove the `<Link to="/demo" className="crumb-card ...">` block (lines 29-38)
2. Restructure the outer wrapper so the banner sits at the very top of the viewport, outside the centered form container
3. Add a banner matching DemoBanner's styling:

```tsx
return (
  <div className="min-h-dvh bg-background flex flex-col">
    {/* Demo banner at top edge */}
    <Link
      to="/demo"
      className="bg-primary text-primary-foreground px-4 py-2.5 flex items-center justify-between gap-3 z-50"
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      <p className="text-[13px] font-medium">
        New here? Explore the demo first
      </p>
      <span className="shrink-0 text-[13px] font-bold underline underline-offset-2">
        Try It
      </span>
    </Link>

    {/* Centered form area fills remaining space */}
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* ...existing form content without the old demo card... */}
      </div>
    </div>
  </div>
);
```

## Files Modified
- `src/pages/Login.tsx` -- replace in-form demo card with a top-edge maroon banner matching DemoBanner style
