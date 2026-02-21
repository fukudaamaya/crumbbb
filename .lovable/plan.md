

# Settings Page

## Overview
Add a Settings section accessible from the Dashboard via a gear icon in the header. Settings will be stored locally (localStorage) and exposed through a React context so all components can react to user preferences.

## Settings

### 1. Start of the Week
- Toggle between **Sunday** and **Monday**
- Affects the DotCalendar and streak calculation

### 2. Temperature Unit
- Toggle between **Celsius** and **Fahrenheit**
- Affects display in BakeDetail (oven temp) and the bake wizard

### 3. Accent Colour
- 8 colour circles in a 4x2 grid
- Selected colour updates the CSS `--primary` variable globally
- Colours will be warm/earthy tones that fit the brutalist aesthetic (e.g., maroon, terracotta, forest green, navy, charcoal, teal, plum, burnt orange)

## User Flow
- Dashboard header gets a gear/settings icon button (top-right)
- Tapping it navigates to `/settings` (or `/demo/settings` in demo mode)
- Settings page has the three sections stacked vertically in crumb-cards
- Changes apply immediately and persist via localStorage

## Technical Details

### New files
- **`src/contexts/SettingsContext.tsx`** -- React context + provider with localStorage persistence. Exposes `weekStart`, `tempUnit`, `accentColor`, and setters. On mount, reads from localStorage. On change, writes to localStorage and updates CSS custom properties on `:root`.
- **`src/pages/Settings.tsx`** -- Settings page with three cards: week start toggle, temp unit toggle, and accent colour grid.

### Modified files
- **`src/App.tsx`** -- Wrap app in `SettingsProvider`, add `/settings` and `/demo/settings` routes
- **`src/pages/Dashboard.tsx`** -- Add a gear icon button in the header linking to settings
- **`src/components/BottomNav.tsx`** -- Optionally add a third "Settings" tab (or keep it as a header icon only)
- **`src/pages/BakeDetail.tsx`** -- Use `tempUnit` from settings context to display temperature as C or F
- **`src/pages/wizard/Step3Baking.tsx`** -- Use `tempUnit` for the bake temp input label
- **`src/index.css`** -- Add the 8 accent colour palettes as data attributes or keep dynamic via JS

### Accent colour implementation
The `SettingsProvider` will set `--primary` and `--accent` CSS variables on `document.documentElement.style` whenever the accent colour changes. This means all existing `text-primary`, `bg-primary`, etc. classes will automatically pick up the new colour with zero changes to existing components.

### Temperature conversion
A utility function `displayTemp(celsius: number, unit: 'C' | 'F')` will convert and format. The stored value in the database stays in Celsius -- only the display changes.

### Toggle UI
Each toggle will use a simple two-option segmented control built with the existing brutalist button styles (two side-by-side buttons, active one uses `btn-primary`, inactive uses `btn-secondary`).

