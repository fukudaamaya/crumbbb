import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minimize2, Maximize2 } from 'lucide-react';
import { Bake } from '@/types/bake';
import { useSettings } from '@/contexts/SettingsContext';

interface DotCalendarProps {
  bakes: Bake[];
  year: number;
  demo?: boolean;
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

function getYearDays(year: number): Date[] {
  const days: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// day-of-week offset respecting weekStart. Returns 0..6 with column 0 = weekStart day.
function getDayOfWeek(d: Date, weekStart: 'sunday' | 'monday'): number {
  const day = d.getDay(); // 0=Sun..6=Sat
  if (weekStart === 'sunday') return day;
  return (day + 6) % 7; // Mon=0..Sun=6
}

export default function DotCalendar({ bakes, year, demo = false }: DotCalendarProps) {
  const navigate = useNavigate();
  const { weekStart, showMonthLabels } = useSettings();
  const [compact, setCompact] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayCellRef = useRef<HTMLButtonElement>(null);

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

  const compactCols = 15;

  // Compact mode: sequential, no weekday alignment
  const compactCells: (Date | null)[] = [...days];
  while (compactCells.length % compactCols !== 0) compactCells.push(null);

  const today = toLocalDateString(new Date());

  // Auto-scroll today's cell into view on mount and when toggling compact / year / labels
  useEffect(() => {
    if (!todayCellRef.current || !scrollRef.current) return;
    const container = scrollRef.current;
    const cell = todayCellRef.current;
    const offset = cell.offsetTop - container.clientHeight / 2 + cell.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, offset), behavior: 'auto' });
  }, [compact, year, showMonthLabels, weekStart]);

  const isDraft = (bake: Bake) => (!bake.photos || bake.photos.length === 0) && bake.bake_temp_c === 0;

  const handleDayTap = (d: Date) => {
    const ds = toLocalDateString(d);
    const bake = bakesByDate[ds];
    if (bake) {
      if (isDraft(bake)) {
        navigate(demo ? `/demo/bake/${bake.id}` : `/bake/new/1?continue=${bake.id}`);
      } else {
        navigate(demo ? `/demo/bake/${bake.id}` : `/bake/${bake.id}`);
      }
    } else if (!demo) {
      navigate(`/bake/new/1?date=${ds}`);
    }
  };

  const dotSize = 'w-2 h-2';

  const renderCell = (d: Date | null, keyPrefix: string, i: number) => {
    if (!d) {
      return (
        <div
          key={`${keyPrefix}-pad-${i}`}
          className="flex items-center justify-center aspect-square"
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
        ref={isToday ? todayCellRef : undefined}
        onClick={() => !isFuture && handleDayTap(d)}
        disabled={isFuture}
        className="relative flex items-center justify-center disabled:cursor-default aspect-square"
        aria-label={ds}
      >
        {bake?.photo_base64 ? (
          <img
            src={bake.photo_base64}
            alt={bake.name}
            className="rounded-full object-cover w-full h-full"
          />
        ) : bake && isDraft(bake) ? (
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundColor: 'hsl(var(--primary) / 0.15)',
              border: '2px dashed hsl(var(--primary))',
            }}
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
  };

  // Build flat normal cells (used when showMonthLabels is false in zoomed-in mode)
  const flatNormalCells: (Date | null)[] = (() => {
    const firstOffset = getDayOfWeek(days[0], weekStart);
    const cells: (Date | null)[] = [...Array(firstOffset).fill(null), ...days];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  })();

  return (
    <div className="relative px-4 pb-4 pt-2 flex-1 min-h-0 flex flex-col">
      {/* Floating toggle button */}
      <button
        onClick={() => setCompact((c) => !c)}
        className="absolute top-2 right-4 z-10 p-1.5 rounded-[6px] border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
        style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}
        aria-label={compact ? 'Zoom in' : 'Zoom out'}
      >
        {compact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
      </button>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 overscroll-contain scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {compact ? (
          <div
            className="grid transition-all duration-300"
            style={{
              gridTemplateColumns: `repeat(${compactCols}, 1fr)`,
              gap: '3px',
            }}
          >
            {compactCells.map((d, i) => renderCell(d, 'compact', i))}
          </div>
        ) : showMonthLabels ? (
          <div className="flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-8 md:gap-y-6">
            {Array.from({ length: 12 }, (_, m) => {
              const monthDays = getMonthDays(year, m);
              const firstOffset = getDayOfWeek(monthDays[0], weekStart);
              const monthCells: (Date | null)[] = [
                ...Array(firstOffset).fill(null),
                ...monthDays,
              ];
              while (monthCells.length % 7 !== 0) monthCells.push(null);
              return (
                <div key={`month-${m}`}>
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {MONTH_NAMES[m]}
                  </div>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '5px',
                    }}
                  >
                    {monthCells.map((d, i) => renderCell(d, `m${m}`, i))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="grid transition-all duration-300"
            style={{
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '5px',
            }}
          >
            {flatNormalCells.map((d, i) => renderCell(d, 'flat', i))}
          </div>
        )}
      </div>
    </div>
  );
}
