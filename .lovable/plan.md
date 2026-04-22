

## Change

Match the Dashboard's outer container to Settings' responsive width pattern.

**`src/pages/Dashboard.tsx`** — update the root wrapper className:

From:
```tsx
className="flex flex-col min-h-dvh md:min-h-0 md:flex-1 bg-background"
```

To:
```tsx
className="flex flex-col min-h-dvh md:min-h-0 md:flex-1 md:max-w-[640px] md:mx-auto md:w-full bg-background"
```

This caps Dashboard content at 640px on desktop and centers it, matching Settings exactly. Mobile is untouched. Inner `px-4 md:px-0` already matches Settings, so no further edits are needed.

**File to modify:** `src/pages/Dashboard.tsx` (one line)

