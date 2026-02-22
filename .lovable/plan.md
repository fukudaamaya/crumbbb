

# Improve Login Page CTA Hierarchy

## Problem

1. **"Sign Up" is buried** -- it's a tiny inline link in muted text at the bottom, easily missed.
2. **"Explore demo" is an afterthought** -- it sits below Sign Up as another small muted link, despite being strategically important for converting new visitors.

## Proposed Changes

### 1. Promote "Sign Up" to a full-width secondary button

Replace the small "Don't have an account? Sign up" text link with a prominent `btn-secondary` button that matches the visual weight of the Sign In button. The "Don't have an account?" text stays as a label above it.

**Before:** Small muted text with an inline link
**After:** A full-width outlined button with hard shadow, using the existing `btn-secondary` class

### 2. Move "Explore demo" into a distinct banner above the form

Pull the demo link out of the footer and place it above the form area as a visually distinct, tappable banner -- a bordered card with an icon and arrow, making it feel like a first-class entry point rather than an afterthought.

## Layout Order (top to bottom)

1. CRUMB wordmark + "Welcome back, baker."
2. **Demo banner** -- e.g. a bordered row: "New here? Explore the demo first" with an arrow
3. Email / Password form + Sign In button
4. "or" divider + Google button
5. **Sign Up button** -- full-width `btn-secondary`: "Create an Account"

## Technical Details

**File: `src/pages/Login.tsx`**

**Demo banner (after the subtitle, before the form):**
```tsx
<Link
  to="/demo"
  className="crumb-card flex items-center justify-between px-4 py-3 mb-6 hover:bg-muted transition-colors"
  style={{ fontFamily: 'DM Sans, sans-serif' }}
>
  <span className="text-[14px] text-foreground font-medium">
    New here? Explore the demo first
  </span>
  <span className="text-muted-foreground text-[16px]">→</span>
</Link>
```

**Sign Up section (replace current footer):**
```tsx
<div className="mt-6 text-center space-y-3">
  <p className="text-[13px] text-muted-foreground"
     style={{ fontFamily: 'DM Sans, sans-serif' }}>
    Don't have an account?
  </p>
  <Link to="/signup" className="btn-secondary w-full py-3 text-[15px] block text-center">
    Create an Account
  </Link>
</div>
```

## Files Modified
- `src/pages/Login.tsx` -- restructure CTAs with promoted sign-up button and demo banner
