import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBakes } from '@/hooks/useBakes';
import DotCalendar from '@/components/DotCalendar';
import BakeListView from '@/components/BakeListView';
import FAB from '@/components/FAB';
import DemoBanner from '@/components/DemoBanner';

type ViewMode = 'grid' | 'list';

export default function Journal({ demo = false }: { demo?: boolean }) {
  const { bakes, updateBake } = useBakes(demo);
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'grid'
  );

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const minYear = 2025;

  const yearBakes = useMemo(
    () => bakes.filter(b => b.date.startsWith(String(year))),
    [bakes, year]
  );

  const handleSetView = (v: ViewMode) => {
    setView(v);
    setSearchParams({ view: v }, { replace: true });
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-background"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)' }}
    >
      {demo && <DemoBanner />}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between"
        style={{ paddingTop: demo ? '12px' : 'calc(env(safe-area-inset-top) + 40px)' }}>
        <div>
          <h1 className="wordmark">CRUMB</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={() => setYear(y => y - 1)}
              disabled={year <= minYear}
              className="p-0.5 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[13px] font-bold tabular-nums" style={{ fontFamily: 'DM Sans, sans-serif' }}>{year}</span>
            <button
              onClick={() => setYear(y => y + 1)}
              disabled={year >= currentYear}
              className="p-0.5 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {yearBakes.length} {yearBakes.length === 1 ? 'bake' : 'bakes'}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center border border-border rounded-[6px] overflow-hidden"
          style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}>
          <button
            onClick={() => handleSetView('grid')}
            className={`px-3 py-2 transition-colors ${
              view === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <div className="w-px h-6 bg-border" />
          <button
            onClick={() => handleSetView('list')}
            className={`px-3 py-2 transition-colors ${
              view === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground'
            }`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pt-4">
        {view === 'grid' ? (
          <DotCalendar bakes={yearBakes} year={year} demo={demo} />
        ) : (
          <BakeListView bakes={yearBakes} demo={demo} onToggleFavourite={(id, current) => updateBake(id, { is_favourite: !current })} />
        )}
      </main>

      {/* FAB — hidden in demo */}
      {!demo && <FAB />}
    </div>
  );
}
