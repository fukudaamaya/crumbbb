import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minimize2, Maximize2 } from 'lucide-react';
import { Bake } from '@/types/bake';

interface DotCalendarProps {
  bakes: Bake[];
  year: number;
  demo?: boolean;
}

function getYearDays(year: number): Date[] {
  const days: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// day of week Mon=0 ... Sun=6
function getDayOfWeek(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export default function DotCalendar({ bakes, year, demo = false }: DotCalendarProps) {
  const navigate = useNavigate();
  const [compact, setCompact] = useState(false);

  const bakesByDate = useMemo(() => {
    const map: Record<string, Bake> = {};
    for (const b of bakes) {
      if (!map[b.date] || b.rating > map[b.date].rating) {
        map[b.date] = b;
      }
    }
    return map;
  }, [bakes]);

  const days = useMemo(() => getYearDays(year), [year]);

  const firstDayOffset = getDayOfWeek(days[0]);

  const cells: (Date | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...days,
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const today = toLocalDateString(new Date());

  const handleDayTap = (d: Date) => {
    const ds = toLocalDateString(d);
    const bake = bakesByDate[ds];
    if (bake) {
      navigate(demo ? `/demo/bake/${bake.id}` : `/bake/${bake.id}`);
    } else if (!demo) {
      navigate(`/bake/new/1?date=${ds}`);
    }
  };

  const dotSize = compact ? 'w-1 h-1' : 'w-2 h-2';

  return (
    <div className="px-4 pb-4">
      {/* Toggle button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setCompact((c) => !c)}
          className="p-1.5 rounded-[6px] border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
          style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}
          aria-label={compact ? 'Zoom in' : 'Zoom out'}
        >
          {compact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
        </button>
      </div>

      <div
        className="grid transition-all duration-300"
        style={{
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: compact ? '2px' : '5px',
        }}
      >
        {cells.map((d, i) => {
          if (!d) {
            return (
              <div
                key={`pad-${i}`}
                className={`flex items-center justify-center ${compact ? '' : 'aspect-square'}`}
                style={compact ? { height: '6px' } : undefined}
              >
                <div className={`${dotSize} rounded-full`} style={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }} />
              </div>
            );
          }

          const ds = toLocalDateString(d);
          const bake = bakesByDate[ds];
          const isToday = ds === today;
          const isPast = ds < today;
          const isFuture = ds > today;

          return (
            <button
              key={ds}
              onClick={() => !isFuture && handleDayTap(d)}
              disabled={isFuture}
              className={`relative flex items-center justify-center disabled:cursor-default ${compact ? '' : 'aspect-square'}`}
              style={compact ? { height: '6px' } : undefined}
              aria-label={ds}
            >
              {bake?.photo_base64 ? (
                <img
                  src={bake.photo_base64}
                  alt={bake.name}
                  className={`rounded-full object-cover ${compact ? 'w-[5px] h-[5px]' : 'w-full h-full'}`}
                />
              ) : (
                <div
                  className={`${dotSize} rounded-full`}
                  style={{
                    backgroundColor: isToday
                      ? 'hsl(var(--primary))'
                      : isPast
                      ? 'hsl(var(--primary) / 0.25)'
                      : 'hsl(var(--primary) / 0.12)',
                    outline: isToday ? '2px solid hsl(var(--primary))' : undefined,
                    outlineOffset: isToday ? '2px' : undefined,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
