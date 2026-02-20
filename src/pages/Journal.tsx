import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { useBakes } from '@/hooks/useBakes';
import DotCalendar from '@/components/DotCalendar';
import BakeListView from '@/components/BakeListView';
import FAB from '@/components/FAB';

type ViewMode = 'grid' | 'list';

export default function Journal() {
  const { bakes } = useBakes();
  const [view, setView] = useState<ViewMode>('grid');
  const year = new Date().getFullYear();

  return (
    <div
      className="flex flex-col min-h-screen bg-background"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 64px)' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
        <div>
          <h1 className="wordmark">CRUMB</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {bakes.length} {bakes.length === 1 ? 'bake' : 'bakes'} this year
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center border border-border rounded-[6px] overflow-hidden"
          style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}>
          <button
            onClick={() => setView('grid')}
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
            onClick={() => setView('list')}
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
          <DotCalendar bakes={bakes} year={year} />
        ) : (
          <BakeListView bakes={bakes} />
        )}
      </main>

      {/* FAB */}
      <FAB />
    </div>
  );
}
