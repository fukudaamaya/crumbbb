
# Demo Mode with Sample Data

## Overview
Add a "demo mode" that lets visitors explore the app with pre-loaded sample bakes -- no account required. Users will see a banner prompting them to sign up, and all write actions (add, edit, delete, favourite) will show a sign-up prompt instead of executing.

## How It Works
1. The Login and Signup pages get a "Try Demo" link/button
2. Tapping it navigates to the Journal page without authenticating
3. The app detects the unauthenticated state and loads hardcoded sample bakes instead of querying the database
4. All interactive/write actions (new bake FAB, edit fields, delete, favourite, rating) show a prompt nudging the user to create an account
5. A persistent banner at the top reminds them they're in demo mode with a "Sign Up" button

## User Flow
- Login/Signup screen --> "Explore Demo" button --> Journal with sample data
- User taps around, views bake details, browses dashboard -- all read-only
- Any write action triggers a modal/toast: "Create an account to save your own bakes"
- Banner "Sign Up" or modal button --> navigates to /signup

## Technical Details

### 1. Sample data file (`src/data/sampleBakes.ts`)
- Create 4-5 realistic sample `Bake` objects with varied flour blends, ratings, dates, and notes
- No photos (use the fallback bread emoji)

### 2. Update `ProtectedRoute` in `src/App.tsx`
- Add a new `DemoRoute` wrapper that renders children without requiring auth
- Routes for `/demo`, `/demo/dashboard`, `/demo/bake/:id` using the same page components

### 3. Update `useBakes` hook (`src/hooks/useBakes.ts`)
- Accept an optional `demo` flag (or detect no user)
- When in demo mode: return sample bakes, and make all mutations no-ops that trigger a sign-up prompt (toast from sonner)

### 4. Update `Journal.tsx`, `Dashboard.tsx`, `BakeDetail.tsx`
- Accept a `demo` prop or detect demo mode from context/route
- Show a top banner in demo mode: "You're exploring Crumb -- Sign up to start your own journal"
- Hide or intercept the FAB and edit actions

### 5. Update `Login.tsx` and `Signup.tsx`
- Add an "Explore Demo" button/link below the sign-in form

### 6. Update `BottomNav.tsx`
- In demo mode, point nav links to `/demo` and `/demo/dashboard`

### Files to Create
- `src/data/sampleBakes.ts` -- hardcoded sample bake data

### Files to Modify
- `src/App.tsx` -- add demo routes
- `src/hooks/useBakes.ts` -- add demo mode with sample data and no-op mutations
- `src/pages/Login.tsx` -- add "Explore Demo" link
- `src/pages/Signup.tsx` -- add "Explore Demo" link
- `src/pages/Journal.tsx` -- add demo banner
- `src/pages/Dashboard.tsx` -- add demo banner
- `src/pages/BakeDetail.tsx` -- intercept write actions in demo mode
- `src/components/BottomNav.tsx` -- handle demo route paths
