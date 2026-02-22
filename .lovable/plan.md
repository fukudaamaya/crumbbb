
# Move "Forgot password?" Link Above Password Field

## What changes

Relocate the "Forgot password?" link from the bottom of the login form to just above the password input field, aligned to the right.

## Technical Details

**File: `src/pages/Login.tsx`**

1. Remove the "Forgot password?" `<Link>` from the bottom section (around line 88)
2. Add it above the password input, as a right-aligned label row:

```tsx
<div>
  <div className="flex items-center justify-between">
    <label className="crumb-label">Password</label>
    <Link to="/forgot-password" className="text-[13px] text-muted-foreground underline" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      Forgot password?
    </Link>
  </div>
  <input type="password" ... />
</div>
```

## Files Modified
- `src/pages/Login.tsx` -- move forgot password link above password field
