import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Step3Props {
  date: string;
  onNext: (data: { bake_temp_c: number; bake_time_mins: number }) => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function Step3Baking({ date, onNext, onSkip, onBack }: Step3Props) {

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  const isPastDate = date < today;

  const [temp, setTemp] = useState(250);
  const [bakeMins, setBakeMins] = useState(35);

  const [timerActive, setTimerActive] = useState(false);
  const [secsLeft, setSecsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => {
      setSecsLeft(s => {
        if (s <= 1) { clearInterval(id); setTimerActive(false); return 0; }
        return s - 1;
      });
    }, 1000);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, [timerActive]);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecsLeft(bakeMins * 60);
    setTimerActive(true);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerActive(false);
  };

  const fmtTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (isPastDate) return null;

  return (
    <div
      className="flex flex-col min-h-dvh bg-background"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-10"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <button onClick={onBack} className="p-1" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Step 3 of 4
          </p>
          <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Baking
          </h2>
        </div>
        <button
          onClick={onSkip}
          className="text-[14px] font-semibold text-primary"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Skip
        </button>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: '75%' }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Oven temp */}
        <div>
          <label className="crumb-label">Oven Temperature (°C)</label>
          <div className="flex items-center gap-3">
            <input
              className="crumb-input tabular-nums"
              type="number"
              inputMode="numeric"
              value={temp}
              onChange={e => setTemp(Number(e.target.value))}
            />
            <span className="text-[15px] font-bold text-primary" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {temp}°C
            </span>
          </div>
        </div>

        {/* Bake */}
        <div className="crumb-card p-4">
          <h3 className="text-[15px] font-bold mb-3" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Bake Timer
          </h3>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="crumb-label">Duration (min)</label>
              <input
                className="crumb-input tabular-nums"
                type="number"
                inputMode="numeric"
                value={bakeMins}
                onChange={e => setBakeMins(Number(e.target.value))}
              />
            </div>
          </div>
          {timerActive ? (
            <>
              <div className="text-5xl font-bold tabular-nums text-center my-3"
                style={{ fontFamily: 'DM Sans, sans-serif', color: 'hsl(var(--primary))' }}>
                {fmtTime(secsLeft)}
              </div>
              <button onClick={stopTimer} className="btn-secondary w-full py-3 text-[15px]">Stop</button>
            </>
          ) : (
            <button onClick={startTimer} className="btn-primary w-full py-3 text-[15px]">
              Start Bake Timer
            </button>
          )}
        </div>
      </div>

      {/* Next */}
      <div className="px-4 py-4 border-t border-border bg-background">
        <button
          onClick={() => { stopTimer(); onNext({ bake_temp_c: temp, bake_time_mins: bakeMins }); }}
          className="btn-primary w-full py-4 text-[16px]"
        >
          Next — Capture & Review
        </button>
      </div>
    </div>
  );
}
