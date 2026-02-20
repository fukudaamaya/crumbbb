import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Step2Props {
  date: string;
  onNext: (proofingMins: number) => void;
  onSkip: () => void;
}

const INTERVALS = [30, 60, 90, 120, 150, 180]; // minutes

export default function Step2Proofing({ date, onNext, onSkip }: Step2Props) {
  const navigate = useNavigate();

  // Check if the bake is for a past date
  const today = new Date().toISOString().split('T')[0];
  const isPastDate = date < today;

  const [autolyseActive, setAutolyseActive] = useState(false);
  const [autolyseSecsLeft, setAutolyseSecsLeft] = useState(30 * 60);
  const [autolyseDone, setAutolyseDone] = useState(false);

  const [proofingMins, setProofingMins] = useState(90);
  const [proofingActive, setProofingActive] = useState(false);
  const [proofingSecsLeft, setProofingSecsLeft] = useState(90 * 60);

  const [notifSupported, setNotifSupported] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Autolyse timer
  useEffect(() => {
    if (!autolyseActive) return;
    const id = setInterval(() => {
      setAutolyseSecsLeft(s => {
        if (s <= 1) {
          clearInterval(id);
          setAutolyseActive(false);
          setAutolyseDone(true);
          if (notifSupported && notifPermission === 'granted') {
            new Notification('Crumb — Autolyse complete! 🍞', {
              body: 'Time to add your starter.',
            });
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [autolyseActive, notifSupported, notifPermission]);

  // Proofing timer
  useEffect(() => {
    if (!proofingActive) return;
    const id = setInterval(() => {
      setProofingSecsLeft(s => {
        if (s <= 1) {
          clearInterval(id);
          setProofingActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, [proofingActive]);

  const scheduleNotifications = (mins: number, permission: NotificationPermission) => {
    if (!notifSupported || permission !== 'granted') return;
    const intervals = INTERVALS.filter(m => m <= mins);
    intervals.forEach(m => {
      const id = setTimeout(() => {
        if (m < mins) {
          new Notification(`Crumb — Proofing check: ${m} min`, {
            body: `${mins - m} minutes remaining.`,
          });
        } else {
          new Notification('Crumb — Proofing complete! 🎉', {
            body: 'Your dough is ready to shape.',
          });
        }
      }, m * 60 * 1000);
      timeoutIds.current.push(id);
    });
  };

  const startProofing = async () => {
    setProofingSecsLeft(proofingMins * 60);
    let permission = notifPermission;
    if (notifSupported && permission === 'default') {
      permission = await requestNotifPermission();
    }
    scheduleNotifications(proofingMins, permission);
    setProofingActive(true);
  };

  const stopAll = () => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProofingActive(false);
    setAutolyseActive(false);
  };

  const fmtTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (isPastDate) {
    // Auto-skip for past dates
    return null;
  }

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
        <button onClick={() => navigate(-1)} className="p-1" aria-label="Back">
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
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Skip
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Notification info */}
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
            Mix flour and water, rest 30 minutes before adding starter.
          </p>
          <div className="text-5xl font-bold tabular-nums text-center my-4"
            style={{ fontFamily: 'DM Sans, sans-serif', color: 'hsl(var(--primary))' }}>
            {autolyseDone ? 'Done ✓' : fmtTime(autolyseSecsLeft)}
          </div>
          {!autolyseDone && (
            <button
              onClick={() => setAutolyseActive(a => !a)}
              className={autolyseActive ? 'btn-secondary w-full py-3 text-[15px]' : 'btn-primary w-full py-3 text-[15px]'}
            >
              {autolyseActive ? 'Pause' : 'Start Autolyse'}
            </button>
          )}
        </div>

        {/* Proofing */}
        <div className="crumb-card p-4">
          <h3 className="text-[15px] font-bold mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Bulk Ferment
          </h3>
          <p className="text-[13px] text-muted-foreground mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Set total proofing time.
          </p>

          {/* Duration selector */}
          {!proofingActive && (
            <div className="flex flex-wrap gap-2 mb-4">
              {INTERVALS.map(m => (
                <button
                  key={m}
                  onClick={() => {
                    setProofingMins(m);
                    setProofingSecsLeft(m * 60);
                  }}
                  className={`px-3 py-1.5 rounded-[4px] border text-[13px] font-semibold ${
                    proofingMins === m
                      ? 'bg-primary text-primary-foreground border-border'
                      : 'bg-background text-foreground border-border'
                  }`}
                  style={{
                    boxShadow: '2px 2px 0px hsl(var(--border))',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  {m < 60 ? `${m}m` : `${m / 60}h`}
                </button>
              ))}
            </div>
          )}

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
            onNext(proofingMins);
          }}
          className="btn-primary w-full py-4 text-[16px]"
        >
          Next — Baking
        </button>
      </div>
    </div>
  );
}
