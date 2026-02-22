const FLOUR_TYPES_KEY = 'crumb_flour_types';
const DEFAULTS = ['White bread flour', 'Whole wheat', 'Spelt', 'Rye', 'Buckwheat', 'Tipo 00'];

function load(): string[] {
  try {
    const raw = localStorage.getItem(FLOUR_TYPES_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as string[];
    // ensure defaults are always present
    const merged = Array.from(new Set([...DEFAULTS, ...parsed]));
    return merged;
  } catch {
    return DEFAULTS;
  }
}

export function getFlourTypes(): string[] {
  return load();
}

export function saveFlourType(type: string) {
  const trimmed = type.trim();
  if (!trimmed) return;
  const current = load();
  if (current.includes(trimmed)) return;
  const updated = [...current, trimmed];
  localStorage.setItem(FLOUR_TYPES_KEY, JSON.stringify(updated));
}

export function saveFlourTypes(types: string[]) {
  types.forEach(saveFlourType);
}
