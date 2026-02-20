import { useNavigate } from 'react-router-dom';
import { Bake } from '@/types/bake';
import { Star } from 'lucide-react';

interface BakeListViewProps {
  bakes: Bake[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BakeListView({ bakes }: BakeListViewProps) {
  const navigate = useNavigate();

  const sorted = [...bakes].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <p className="text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          No bakes yet. Tap + Bake to start your journal.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 flex flex-col gap-3">
      {sorted.map(bake => (
        <button
          key={bake.id}
          onClick={() => navigate(`/bake/${bake.id}`)}
          className="crumb-card flex items-center gap-3 p-3 w-full text-left"
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border border-border"
            style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}>
            {bake.photo_base64 ? (
              <img src={bake.photo_base64} alt={bake.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-2xl">🍞</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate text-[15px]"
              style={{ fontFamily: 'Raleway, sans-serif' }}>
              {bake.name}
            </p>
            <p className="text-muted-foreground text-[13px] mt-0.5"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {formatDate(bake.date)} · {bake.hydration_pct}% hydration
            </p>
            {/* Stars */}
            <div className="flex gap-0.5 mt-1">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  size={12}
                  fill={s <= bake.rating ? 'hsl(var(--primary))' : 'none'}
                  stroke={s <= bake.rating ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                />
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
