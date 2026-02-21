import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface Step3Props {
  date: string;
  onNext: (data: { bake_temp_c: number; bake_time_mins: number }) => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function Step3Baking({ date, onNext, onSkip, onBack }: Step3Props) {
  const { tempUnit } = useSettings();
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();
  const isPastDate = date < today;

  const [temp, setTemp] = useState(250);
  const [bakeMins, setBakeMins] = useState(35);

  const [timerActive, setTimerActive] = useState(false);
  const [secsLeft, setSecsLeft] = useState(0);
  const endTimeRef = useRef<number>(0);

  const recalc = useCallback(() => {
    if (!endTimeRef.current) return;
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    setSecsLeft(remaining);
    if (remaining <= 0) {
      endTimeRef.current = 0;
      setTimerActive(false);
    }
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(recalc, 250);
    return () => clearInterval(id);
  }, [timerActive, recalc]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') recalc();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [recalc]);

  const startTimer = () => {
    endTimeRef.current = Date.now() + bakeMins * 60 * 1000;
    setSecsLeft(bakeMins * 60);
    setTimerActive(true);
  };

  const stopTimer = () => {
    endTimeRef.current = 0;
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
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="crumb-label">Oven Temp ({tempUnit === 'F' ? '°F' : '°C'})</label>
            <input
              className="crumb-input tabular-nums"
              type="number"
              inputMode="numeric"
              value={temp}
              onChange={e => setTemp(Number(e.target.value))}
            />
          </div>
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

        <div className="crumb-card p-6 flex flex-col items-center gap-5">
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-1"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Bake Timer</p>
            <div className="text-6xl font-bold tabular-nums"
              style={{ fontFamily: 'DM Sans, sans-serif', color: timerActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}>
              {timerActive ? fmtTime(secsLeft) : fmtTime(bakeMins * 60)}
            </div>
          </div>
          {timerActive ? (
            <button onClick={stopTimer} className="btn-secondary w-full py-3 text-[15px]">Stop</button>
          ) : (
            <button onClick={startTimer} className="btn-primary w-full py-3 text-[15px]">Start Timer</button>
          )}
        </div>
      </div>

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
