import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type WeekStart = 'sunday' | 'monday';
export type TempUnit = 'C' | 'F';

export interface AccentColor {
  name: string;
  primary: string;       // HSL values for --primary
  accent: string;        // HSL values for --accent
  muted: string;         // HSL values for --muted-foreground
}

export const ACCENT_COLORS: AccentColor[] = [
  { name: 'Maroon',       primary: '0 46% 33%',    accent: '0 46% 33%',   muted: '28 40% 35%' },
  { name: 'Terracotta',   primary: '16 60% 40%',   accent: '16 60% 40%',  muted: '16 30% 38%' },
  { name: 'Forest',       primary: '152 40% 28%',  accent: '152 40% 28%', muted: '152 25% 32%' },
  { name: 'Navy',         primary: '220 50% 30%',  accent: '220 50% 30%', muted: '220 30% 35%' },
  { name: 'Charcoal',     primary: '0 0% 25%',     accent: '0 0% 25%',    muted: '0 0% 35%' },
  { name: 'Teal',         primary: '180 45% 30%',  accent: '180 45% 30%', muted: '180 25% 35%' },
  { name: 'Plum',         primary: '290 35% 35%',  accent: '290 35% 35%', muted: '290 20% 38%' },
  { name: 'Burnt Orange', primary: '25 80% 42%',   accent: '25 80% 42%',  muted: '25 35% 38%' },
];

interface SettingsState {
  weekStart: WeekStart;
  tempUnit: TempUnit;
  accentColor: string; // name
  setWeekStart: (v: WeekStart) => void;
  setTempUnit: (v: TempUnit) => void;
  setAccentColor: (name: string) => void;
}

const SettingsContext = createContext<SettingsState | null>(null);

const LS_KEY = 'crumb-settings';

function readLS(): { weekStart: WeekStart; tempUnit: TempUnit; accentColor: string } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { weekStart: 'sunday', tempUnit: 'C', accentColor: 'Maroon' };
}

function writeLS(data: { weekStart: WeekStart; tempUnit: TempUnit; accentColor: string }) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function applyAccent(name: string) {
  const color = ACCENT_COLORS.find(c => c.name === name) ?? ACCENT_COLORS[0];
  document.documentElement.style.setProperty('--primary', color.primary);
  document.documentElement.style.setProperty('--accent', color.accent);
  document.documentElement.style.setProperty('--ring', color.primary);
  document.documentElement.style.setProperty('--secondary-foreground', color.primary);
  document.documentElement.style.setProperty('--muted-foreground', color.muted);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [weekStart, setWeekStartState] = useState<WeekStart>('sunday');
  const [tempUnit, setTempUnitState] = useState<TempUnit>('C');
  const [accentColor, setAccentColorState] = useState('Maroon');

  useEffect(() => {
    const saved = readLS();
    setWeekStartState(saved.weekStart);
    setTempUnitState(saved.tempUnit);
    setAccentColorState(saved.accentColor);
    applyAccent(saved.accentColor);
  }, []);

  const setWeekStart = (v: WeekStart) => {
    setWeekStartState(v);
    writeLS({ weekStart: v, tempUnit, accentColor });
  };
  const setTempUnit = (v: TempUnit) => {
    setTempUnitState(v);
    writeLS({ weekStart, tempUnit: v, accentColor });
  };
  const setAccentColor = (name: string) => {
    setAccentColorState(name);
    applyAccent(name);
    writeLS({ weekStart, tempUnit, accentColor: name });
  };

  return (
    <SettingsContext.Provider value={{ weekStart, tempUnit, accentColor, setWeekStart, setTempUnit, setAccentColor }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function displayTemp(celsius: number, unit: TempUnit): string {
  if (unit === 'F') return `${Math.round(celsius * 9 / 5 + 32)}°F`;
  return `${celsius}°C`;
}
