import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBakes } from '@/hooks/useBakes';
import { Bake } from '@/types/bake';
import { Star, Flame, Heart } from 'lucide-react';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function calcStreak(bakes: Bake[]): number {
  if (bakes.length === 0) return 0;
  // Group bakes by ISO week
  const weekSet = new Set<string>();
  bakes.forEach(b => {
    const d = new Date(b.date + 'T00:00:00');
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    weekSet.add(`${d.getFullYear()}-W${week}`);
  });
  const now = new Date();
  const jan1Now = new Date(now.getFullYear(), 0, 1);
  const currentWeek = Math.ceil(((now.getTime() - jan1Now.getTime()) / 86400000 + jan1Now.getDay() + 1) / 7);
  let streak = 0;
  let w = currentWeek;
  let y = now.getFullYear();
  while (weekSet.has(`${y}-W${w}`)) {
    streak++;
    w--;
    if (w < 1) { y--; w = 52; }
    if (streak > 52) break;
  }
  return streak;
}

export default function Dashboard() {
  const { bakes } = useBakes();
  const navigate = useNavigate();

  const thisMonth = useMemo(() => {
    const now = new Date();
    return bakes.filter(b => {
      const d = new Date(b.date + 'T00:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [bakes]);

  const avgRating = useMemo(() => {
    const rated = thisMonth.filter(b => b.rating > 0);
    if (!rated.length) return 0;
    return (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1);
  }, [thisMonth]);

  const topBakes = useMemo(() =>
    [...bakes].sort((a, b) => b.rating - a.rating).slice(0, 3),
    [bakes]
  );

  const favourites = useMemo(() =>
    bakes.filter(b => b.is_favourite),
    [bakes]
  );

  const streak = useMemo(() => calcStreak(bakes), [bakes]);

  return (
    <div
      className="flex flex-col min-h-dvh bg-background"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)' }}
    >
      {/* Header with wordmark */}
      <header
        className="px-4 py-4 border-b border-border bg-background"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <span className="wordmark">Crumb</span>
        <p className="text-[12px] text-muted-foreground mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Your sourdough journal
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Streak */}
        <div className="crumb-card p-4 flex items-center gap-4">
          <span className="text-4xl">🔥</span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Baking Streak
            </p>
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
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            This Month
          </h2>
          <div className="flex gap-3">
            <div className="crumb-card flex-1 p-4 text-center">
              <p className="text-3xl font-bold text-primary tabular-nums"
                style={{ fontFamily: 'Raleway, sans-serif' }}>
                {thisMonth.length}
              </p>
              <p className="text-[12px] text-muted-foreground uppercase tracking-wide mt-1"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Loaves
              </p>
            </div>
            <div className="crumb-card flex-1 p-4 text-center">
              <p className="text-3xl font-bold text-primary tabular-nums"
                style={{ fontFamily: 'Raleway, sans-serif' }}>
                {avgRating || '—'}
              </p>
              <p className="text-[12px] text-muted-foreground uppercase tracking-wide mt-1"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Avg. Rating
              </p>
            </div>
          </div>
        </div>

        {/* Top bakes */}
        {topBakes.length > 0 && (
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Top Bakes
            </h2>
            <div className="space-y-2">
              {topBakes.map((bake, idx) => (
                <button
                  key={bake.id}
                  onClick={() => navigate(`/bake/${bake.id}`)}
                  className="crumb-card flex items-center gap-3 p-3 w-full text-left"
                >
                  <span className="text-[18px] font-bold text-muted-foreground w-6 text-center tabular-nums"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {idx + 1}
                  </span>
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border flex-shrink-0">
                    {bake.photo_base64 ? (
                      <img src={bake.photo_base64} alt={bake.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-xl">🍞</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] truncate" style={{ fontFamily: 'Raleway, sans-serif' }}>
                      {bake.name}
                    </p>
                    <p className="text-[12px] text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {formatDate(bake.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star size={14} fill="hsl(var(--primary))" stroke="hsl(var(--primary))" />
                    <span className="text-[14px] font-bold tabular-nums text-primary"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {bake.rating}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Favourites horizontal scroll */}
        {favourites.length > 0 && (
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Favourites ♥
            </h2>
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
            >
              {favourites.map(bake => (
                <button
                  key={bake.id}
                  onClick={() => navigate(`/bake/${bake.id}`)}
                  className="flex-shrink-0 crumb-card p-2 w-28 text-left"
                >
                  <div className="w-full aspect-square rounded-full overflow-hidden border border-border mb-2">
                    {bake.photo_base64 ? (
                      <img src={bake.photo_base64} alt={bake.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-2xl">🍞</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] font-bold truncate" style={{ fontFamily: 'Raleway, sans-serif' }}>
                    {bake.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {formatDate(bake.date)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {bakes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-6xl mb-4">🍞</span>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Your journal is empty
            </h3>
            <p className="text-muted-foreground text-[14px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Head to Journal and tap + Bake to log your first loaf.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
