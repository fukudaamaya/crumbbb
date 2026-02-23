import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

interface Step2Props {
  date: string;
  onNext: (proofingMins: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

const TOTAL_MINS = 180;
const INTERVALS = [30, 60, 90, 120, 150, 180];

function foldLabel(m: number): string {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function remainingLabel(m: number): string {
  const left = TOTAL_MINS - m;
  if (left <= 0) return '';
  return `${foldLabel(left)} remaining`;
}

export default function Step2Proofing({ date, onNext, onSkip, onBack }: Step2Props) {
  const today = new Date().toISOString().split('T')[0];
  const isPastDate = date < today;

  // Autolyse state
  const [autolyseActive, setAutolyseActive] = useState(false);
  const [autolyseSecsLeft, setAutolyseSecsLeft] = useState(30 * 60);
  const [autolyseDone, setAutolyseDone] = useState(false);
  const autolyseEndRef = useRef<number>(0);

  // Proofing state — fixed 3h
  const [proofingActive, setProofingActive] = useState(false);
  const [proofingSecsLeft, setProofingSecsLeft] = useState(TOTAL_MINS * 60);
  const [completedFolds, setCompletedFolds] = useState<number[]>([]);
  const proofingEndRef = useRef<number>(0);

  const [notifSupported, setNotifSupported] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const supported = 'Notification' in window;
    setNotifSupported(supported);
    if (supported) setNotifPermission(Notification.permission);
  }, []);

  const requestNotifPermission = async () => {
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    return result;
  };

  // Autolyse helpers
  const recalcAutolyse = useCallback(() => {
    if (!autolyseEndRef.current) return;
    const remaining = Math.max(0, Math.ceil((autolyseEndRef.current - Date.now()) / 1000));
    setAutolyseSecsLeft(remaining);
    if (remaining <= 0) {
      autolyseEndRef.current = 0;
      setAutolyseActive(false);
      setAutolyseDone(true);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Crumb — Autolyse complete! 🍞', { body: 'Time to add your starter.' });
      }
    }
  }, []);

  // Proofing recalc — also marks completed folds
  const recalcProofing = useCallback(() => {
    if (!proofingEndRef.current) return;
    const remaining = Math.max(0, Math.ceil((proofingEndRef.current - Date.now()) / 1000));
    setProofingSecsLeft(remaining);

    const elapsedMins = Math.floor((TOTAL_MINS * 60 - remaining) / 60);
    setCompletedFolds((prev) => {
      const next = INTERVALS.filter((m) => elapsedMins >= m && !prev.includes(m));
      return next.length ? [...prev, ...next] : prev;
    });

    if (remaining <= 0) {
      proofingEndRef.current = 0;
      setProofingActive(false);
    }
  }, []);

  useEffect(() => {
    if (!autolyseActive) return;
    const id = setInterval(recalcAutolyse, 250);
    return () => clearInterval(id);
  }, [autolyseActive, recalcAutolyse]);

  useEffect(() => {
    if (!proofingActive) return;
    const id = setInterval(recalcProofing, 250);
    return () => clearInterval(id);
  }, [proofingActive, recalcProofing]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        recalcAutolyse();
        recalcProofing();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [recalcAutolyse, recalcProofing]);

  const startAutolyse = () => {
    autolyseEndRef.current = Date.now() + 30 * 60 * 1000;
    setAutolyseSecsLeft(30 * 60);
    setAutolyseActive(true);
  };

  const pauseAutolyse = () => {
    const remaining = Math.max(0, autolyseEndRef.current - Date.now());
    autolyseEndRef.current = 0;
    setAutolyseActive(false);
    setAutolyseSecsLeft(Math.ceil(remaining / 1000));
  };

  const resumeAutolyse = () => {
    autolyseEndRef.current = Date.now() + autolyseSecsLeft * 1000;
    setAutolyseActive(true);
  };

  const scheduleNotifications = (permission: NotificationPermission) => {
    if (!notifSupported || permission !== 'granted') return;
    INTERVALS.forEach((m, i) => {
      const id = setTimeout(() => {
        if (m < TOTAL_MINS) {
          new Notification(`Crumb — Stretch & fold #${i + 1} (${foldLabel(m)})`, {
            body: remainingLabel(m),
          });
        } else {
          new Notification('Crumb — Bulk ferment complete! 🎉', {
            body: 'Your dough is ready to shape.',
          });
        }
      }, m * 60 * 1000);
      timeoutIds.current.push(id);
    });
  };

  const startProofing = async () => {
    proofingEndRef.current = Date.now() + TOTAL_MINS * 60 * 1000;
    setProofingSecsLeft(TOTAL_MINS * 60);
    setCompletedFolds([]);
    let permission = notifPermission;
    if (notifSupported && permission === 'default') {
      permission = await requestNotifPermission();
    }
    scheduleNotifications(permission);
    setProofingActive(true);
  };

  const stopAll = () => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
    autolyseEndRef.current = 0;
    proofingEndRef.current = 0;
    setProofingActive(false);
    setAutolyseActive(false);
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
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-10"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
        <button onClick={onBack} className="p-1" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Step 2 of 4
          </p>
          <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Proofing Timer
          </h2>
        </div>
        <button
          onClick={onSkip}
          className="text-[14px] font-semibold text-primary underline-offset-2"
          style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Skip
        </button>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: '50%' }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {!notifSupported && (
          <div className="crumb-card p-3 text-[13px] text-muted-foreground"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            For timer notifications, open Crumb in Safari.
          </div>
        )}

        {/* Autolyse */}
        <div className="crumb-card p-4">
          <h3 className="text-[15px] font-bold mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Autolyse
          </h3>
          <p className="text-[13px] text-muted-foreground mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Mix leaven and water, add flour and rest 30 minutes before adding salt.
          </p>
          <div className="text-5xl font-bold tabular-nums text-center my-4"
            style={{ fontFamily: 'DM Sans, sans-serif', color: 'hsl(var(--primary))' }}>
            {autolyseDone ? 'Done ✓' : fmtTime(autolyseSecsLeft)}
          </div>
          {!autolyseDone && (
            <button
              onClick={() => {
                if (autolyseActive) pauseAutolyse();
                else if (autolyseSecsLeft < 30 * 60) resumeAutolyse();
                else startAutolyse();
              }}
              className={autolyseActive ? 'btn-secondary w-full py-3 text-[15px]' : 'btn-primary w-full py-3 text-[15px]'}>
              {autolyseActive ? 'Pause' : 'Start Autolyse'}
            </button>
          )}
        </div>

        {/* Bulk Ferment — Stretch & Fold */}
        <div className="crumb-card p-4">
          <h3 className="text-[15px] font-bold mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Bulk Ferment
          </h3>
          <p className="text-[13px] text-muted-foreground mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            3-hour timer with stretch & fold reminders every 30 minutes.
          </p>

          {/* Stretch & fold checklist */}
          <div className="space-y-2 mb-4">
            {INTERVALS.map((m, i) => {
              const done = completedFolds.includes(m);
              return (
                <div key={m} className="flex items-center gap-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                      done
                        ? 'bg-primary text-primary-foreground'
                        : 'border-2 border-border text-muted-foreground'
                    }`}>
                    {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[13px] ${done ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                    {m < TOTAL_MINS
                      ? `Stretch & fold at ${foldLabel(m)}`
                      : 'Bulk ferment complete'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-5xl font-bold tabular-nums text-center my-4"
            style={{ fontFamily: 'DM Sans, sans-serif', color: 'hsl(var(--primary))' }}>
            {fmtTime(proofingSecsLeft)}
          </div>

          {proofingActive ? (
            <button onClick={stopAll} className="btn-secondary w-full py-3 text-[15px]">
              Stop
            </button>
          ) : (
            <button onClick={startProofing} className="btn-primary w-full py-3 text-[15px]">
              Start Proofing
            </button>
          )}
        </div>
      </div>

      {/* Next */}
      <div className="px-4 py-4 border-t border-border bg-background">
        <button
          onClick={() => {
            stopAll();
            onNext(TOTAL_MINS);
          }}
          className="btn-primary w-full py-4 text-[16px]">
          Next — Baking
        </button>
      </div>
    </div>
  );
}
