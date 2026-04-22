import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBakes } from '@/hooks/useBakes';
import { Settings } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useRecipes } from '@/hooks/useRecipes';
import RecipeCard from '@/components/RecipeCard';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getFullYear(), week };
}

function calcStreak(bakes: { date: string }[]): number {
  if (bakes.length === 0) return 0;

  const weekSet = new Set<string>();
  bakes.forEach((b) => {
    const d = new Date(b.date + 'T00:00:00');
    const { year, week } = getISOWeek(d);
    weekSet.add(`${year}-W${week}`);
  });

  const now = new Date();
  let { year: y, week: w } = getISOWeek(now);

  // If no bake this week, allow starting from last week
  if (!weekSet.has(`${y}-W${w}`)) {
    w--;
    if (w < 1) { y--; w = 52; }
  }

  let streak = 0;
  while (weekSet.has(`${y}-W${w}`)) {
    streak++;
    w--;
    if (w < 1) { y--; w = 52; }
    if (streak > 52) break;
  }
  return streak;
}

export default function Dashboard({ demo = false }: { demo?: boolean }) {
  const { bakes } = useBakes(demo);
  const { recipes } = useRecipes();
  const navigate = useNavigate();
  const prefix = demo ? '/demo' : '';

  const [range, setRange] = useState<'month' | 'year'>('month');

  const filteredBakes = useMemo(() => {
    const now = new Date();
    return bakes.filter((b) => {
      const d = new Date(b.date + 'T00:00:00');
      if (range === 'year') return d.getFullYear() === now.getFullYear();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [bakes, range]);

  const totalLoaves = useMemo(() =>
    filteredBakes.reduce((s, b) => s + (b.loaf_count || 1), 0),
    [filteredBakes]
  );

  const avgRating = useMemo(() => {
    const rated = filteredBakes.filter((b) => b.rating > 0);
    if (!rated.length) return 0;
    return (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1);
  }, [filteredBakes]);


  const favourites = useMemo(() =>
    bakes.filter((b) => b.is_favourite),
    [bakes]
  );

  const streak = useMemo(() => calcStreak(bakes), [bakes]);

  return (
    <div
      className="flex flex-col min-h-dvh md:min-h-0 md:flex-1 md:max-w-[640px] md:mx-auto md:w-full bg-background"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)' }}>

      {demo && <DemoBanner />}

      <header
        className="px-4 md:px-0 py-4 border-b md:border-b-0 border-border bg-background flex items-start justify-between"
        style={{ paddingTop: demo ? '12px' : 'calc(env(safe-area-inset-top) + 40px)' }}>
        <div>
          <span className="wordmark">DASHBOARD</span>
          <p className="text-[12px] text-muted-foreground mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Your sourdough journal
          </p>
        </div>
        <button
          onClick={() => navigate(`${prefix}/settings`)}
          className="md:hidden p-2 mt-1"
          aria-label="Settings"
        >
          <Settings size={22} strokeWidth={2} className="text-foreground" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto md:overflow-visible px-4 md:px-0 py-5 space-y-6">
        {/* Streak */}
        <div className="crumb-card p-4 flex items-center gap-4">
          <span className="text-4xl">🔥</span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Baking Streak</p>
            <p className="text-3xl font-bold tabular-nums text-primary"
              style={{ fontFamily: 'Raleway, sans-serif' }}>
              {streak} {streak === 1 ? 'week' : 'weeks'}
            </p>
            <p className="text-[12px] text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {streak > 0 ? 'in a row' : 'No bakes this week yet'}
            </p>
          </div>
        </div>

        {/* This month */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setRange('month')}
              className={`text-[13px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${
                range === 'month'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              This Month
            </button>
            <button
              onClick={() => setRange('year')}
              className={`text-[13px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${
                range === 'year'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              This Year
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="crumb-card flex-1 p-4 text-center">
              <p className="text-3xl font-bold text-primary tabular-nums" style={{ fontFamily: 'Raleway, sans-serif' }}>
                {totalLoaves}
              </p>
              <p className="text-[12px] text-muted-foreground uppercase tracking-wide mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>Loaves</p>
            </div>
            <div className="crumb-card flex-1 p-4 text-center">
              <p className="text-3xl font-bold text-primary tabular-nums" style={{ fontFamily: 'Raleway, sans-serif' }}>
                {avgRating || '—'}
              </p>
              <p className="text-[12px] text-muted-foreground uppercase tracking-wide mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>Avg. Rating</p>
            </div>
          </div>
        </div>

        {/* Favourites */}
        {favourites.length > 0 && (
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Favourites ♥</h2>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              {favourites.map((bake) => (
                <button
                  key={bake.id}
                  onClick={() => navigate(`${prefix}/bake/${bake.id}`)}
                  className="flex-shrink-0 crumb-card p-2 w-28 text-left">
                  <div className="w-full aspect-square rounded-full overflow-hidden border border-border mb-2">
                    {bake.photo_base64 ?
                      <img src={bake.photo_base64} alt={bake.name} className="w-full h-full object-cover" /> :
                      <div className="w-full h-full bg-muted flex items-center justify-center"><span className="text-2xl">🍞</span></div>
                    }
                  </div>
                  <p className="text-[12px] font-bold truncate" style={{ fontFamily: 'Raleway, sans-serif' }}>{bake.name}</p>
                  <p className="text-[11px] text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>{formatDate(bake.date)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Recipes */}
        {!demo && recipes.length > 0 && (
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Saved Recipes</h2>
            <div className="space-y-3">
              {recipes.map((recipe) => {
                const matchingBakes = bakes
                  .filter(b => b.name === recipe.name)
                  .sort((a, b) => b.date.localeCompare(a.date));
                const lastBake = matchingBakes[0];
                return (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    lastBakePhoto={lastBake?.photo_base64}
                    lastBakeDate={lastBake?.date}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {bakes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-6xl mb-4">🍞</span>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Raleway, sans-serif' }}>Your journal is empty</h3>
            <p className="text-muted-foreground text-[14px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Head to Journal and tap + Bake to log your first loaf.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
