

# Move "Forgot password" Below Password Input

## What changes

1. Remove the question mark from "Forgot password?" so it reads "Forgot password"
2. Move the link from above the password input to below it, left-aligned
3. Restore the password label to a standalone element (remove the flex wrapper)

## Technical Details

**File: `src/pages/Login.tsx`**

Replace the current password field block (flex row with label + link, then input) with:

```tsx
<div>
  <label className="crumb-label">Password</label>
  <input
    type="password"
    className="crumb-input"
    value={password}
    onChange={e => setPassword(e.target.value)}
    required
    autoComplete="current-password"
  />
  <Link
    to="/forgot-password"
    className="text-[13px] text-muted-foreground underline mt-1 inline-block"
    style={{ fontFamily: 'DM Sans, sans-serif' }}
  >
    Forgot password
  </Link>
</div>
```

## Files Modified
- `src/pages/Login.tsx`

