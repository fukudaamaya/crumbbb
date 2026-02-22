

# Add Log Out Option to Settings

## What changes

Add a "Log Out" button at the bottom of the Settings page. Tapping it signs the user out and redirects to the login page.

## Technical Details

**File: `src/pages/Settings.tsx`**

1. Import `useAuth` from `@/contexts/AuthContext` and `LogOut` icon from `lucide-react`
2. Add a log out button at the end of the settings cards (inside the scrollable area), styled as a full-width outlined button with a log-out icon
3. On click, call `signOut()` from the auth context, then `navigate('/login')`
4. For demo mode, the button either hides or navigates to `/login` without calling signOut

```tsx
// Add to imports
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Check, LogOut } from 'lucide-react';

// Add after the last crumb-card div, inside the scrollable area
<button
  onClick={async () => {
    if (!isDemo) await signOut();
    navigate('/login');
  }}
  className="w-full flex items-center justify-center gap-2 py-3 rounded-[6px] border border-border text-destructive font-semibold text-[14px] hover:bg-destructive/10 transition-colors"
  style={{ fontFamily: 'DM Sans, sans-serif' }}
>
  <LogOut size={18} />
  Log Out
</button>
```

## Files Modified
- `src/pages/Settings.tsx` -- add log out button with auth integration

