import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bake } from '@/types/bake';

interface DotCalendarProps {
  bakes: Bake[];
  year: number;
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

export default function DotCalendar({ bakes, year }: DotCalendarProps) {
  const navigate = useNavigate();

  const bakesByDate = useMemo(() => {
    const map: Record<string, Bake> = {};
    for (const b of bakes) {
      // keep highest-rated if multiple on same day
      if (!map[b.date] || b.rating > map[b.date].rating) {
        map[b.date] = b;
      }
    }
    return map;
  }, [bakes]);

  const days = useMemo(() => getYearDays(year), [year]);

  // Pad start so first day aligns to correct weekday (Mon=0)
  const firstDayOffset = getDayOfWeek(days[0]);

  // All cells: null for padding, Date for real days
  const cells: (Date | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...days,
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const today = toLocalDateString(new Date());

  const handleDayTap = (d: Date) => {
    const ds = toLocalDateString(d);
    const bake = bakesByDate[ds];
    if (bake) {
      navigate(`/bake/${bake.id}`);
    } else {
      navigate(`/bake/new/1?date=${ds}`);
    }
  };

  return (
    <div className="px-4 pb-4">
      <div
        className="grid gap-[5px]"
        style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
      >
        {cells.map((d, i) => {
          if (!d) {
            return (
              <div key={`pad-${i}`} className="aspect-square flex items-center justify-center">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }} />
              </div>
            );
          }

          const ds = toLocalDateString(d);
          const bake = bakesByDate[ds];
          const isToday = ds === today;
          const isPast = ds < today;

          return (
            <button
              key={ds}
              onClick={() => handleDayTap(d)}
              className="aspect-square relative flex items-center justify-center"
              aria-label={ds}
            >
              {bake?.photo_base64 ? (
                <img
                  src={bake.photo_base64}
                  alt={bake.name}
                  className="w-full h-full rounded-full object-cover"
                  style={{ border: '1.5px solid hsl(var(--border))' }}
                />
              ) : (
                <div
                  className="w-2 h-2 rounded-full"
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
