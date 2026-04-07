import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface Step3Props {
  onNext: (data: { bake_temp_c: number; preheat_time_mins: number; lid_on_mins: number; lid_off_mins: number }) => void;
  onSkip: () => void;
  onBack: () => void;
  initialData?: {
    bake_temp_c?: number;
    preheat_time_mins?: number;
    lid_on_mins?: number;
    lid_off_mins?: number;
  };
}

export default function Step3Baking({ onNext, onSkip, onBack, initialData }: Step3Props) {
  const { tempUnit } = useSettings();

  const cToF = (c: number) => Math.round(c * 9 / 5 + 32);
  const fToC = (f: number) => Math.round((f - 32) * 5 / 9);

  const [tempDisplay, setTempDisplay] = useState(() => {
    const c = initialData?.bake_temp_c ?? 250;
    return tempUnit === 'F' ? cToF(c) : c;
  });
  const [preheat, setPreheat] = useState(initialData?.preheat_time_mins ?? 60);
  const [lidOn, setLidOn] = useState(initialData?.lid_on_mins ?? 20);
  const [lidOff, setLidOff] = useState(initialData?.lid_off_mins ?? 25);

  const handleNext = () => {
    const tempC = tempUnit === 'F' ? fToC(tempDisplay) : tempDisplay;
    onNext({ bake_temp_c: tempC, preheat_time_mins: preheat, lid_on_mins: lidOn, lid_off_mins: lidOff });
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
            Step 2 of 3
          </p>
          <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Day 2 — Baking
          </h2>
        </div>
        <button onClick={onSkip} className="text-[14px] font-semibold text-primary" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Skip
        </button>
      </header>

      <div className="h-1 w-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: '66%' }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <div>
          <label className="crumb-label">Oven Temp ({tempUnit === 'F' ? '°F' : '°C'})</label>
          <input className="crumb-input tabular-nums" type="number" inputMode="numeric"
            value={tempDisplay} onChange={e => setTempDisplay(Number(e.target.value))} />
        </div>
        <div>
          <label className="crumb-label">Preheat Time (min)</label>
          <input className="crumb-input tabular-nums" type="number" inputMode="numeric"
            value={preheat} onChange={e => setPreheat(Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="crumb-label">Lid On (min)</label>
            <input className="crumb-input tabular-nums" type="number" inputMode="numeric"
              value={lidOn} onChange={e => setLidOn(Number(e.target.value))} />
          </div>
          <div>
            <label className="crumb-label">Lid Off (min)</label>
            <input className="crumb-input tabular-nums" type="number" inputMode="numeric"
              value={lidOff} onChange={e => setLidOff(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-border bg-background">
        <button onClick={handleNext} className="btn-primary w-full py-4 text-[16px]">
          Next — Review
        </button>
      </div>
    </div>
  );
}
