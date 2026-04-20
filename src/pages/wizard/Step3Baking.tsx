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

const DEFAULTS = {
  bake_temp_c: 230,
  preheat_time_mins: 60,
  lid_on_mins: 25,
  lid_off_mins: 25,
};

export default function Step3Baking({ onNext, onSkip, onBack, initialData }: Step3Props) {
  const { tempUnit } = useSettings();

  const cToF = (c: number) => Math.round(c * 9 / 5 + 32);
  const fToC = (f: number) => Math.round((f - 32) * 5 / 9);

  // Treat 0 / missing as "unset" → use defaults
  const initTempC = initialData?.bake_temp_c && initialData.bake_temp_c > 0
    ? initialData.bake_temp_c
    : DEFAULTS.bake_temp_c;
  const initPreheat = initialData?.preheat_time_mins && initialData.preheat_time_mins > 0
    ? initialData.preheat_time_mins
    : DEFAULTS.preheat_time_mins;
  const initLidOn = initialData?.lid_on_mins && initialData.lid_on_mins > 0
    ? initialData.lid_on_mins
    : DEFAULTS.lid_on_mins;
  const initLidOff = initialData?.lid_off_mins && initialData.lid_off_mins > 0
    ? initialData.lid_off_mins
    : DEFAULTS.lid_off_mins;

  const initTempDisplay = tempUnit === 'F' ? cToF(initTempC) : initTempC;
  const defaultTempDisplay = tempUnit === 'F' ? cToF(DEFAULTS.bake_temp_c) : DEFAULTS.bake_temp_c;

  const [tempStr, setTempStr] = useState(String(initTempDisplay));
  const [preheatStr, setPreheatStr] = useState(String(initPreheat));
  const [lidOnStr, setLidOnStr] = useState(String(initLidOn));
  const [lidOffStr, setLidOffStr] = useState(String(initLidOff));

  const parseOrDefault = (s: string, fallback: number) => {
    const n = parseInt(s, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const handleNext = () => {
    const tempDisplay = parseOrDefault(tempStr, defaultTempDisplay);
    const tempC = tempUnit === 'F' ? fToC(tempDisplay) : tempDisplay;
    onNext({
      bake_temp_c: tempC,
      preheat_time_mins: parseOrDefault(preheatStr, DEFAULTS.preheat_time_mins),
      lid_on_mins: parseOrDefault(lidOnStr, DEFAULTS.lid_on_mins),
      lid_off_mins: parseOrDefault(lidOffStr, DEFAULTS.lid_off_mins),
    });
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
          <input
            className="crumb-input tabular-nums"
            type="number"
            inputMode="numeric"
            value={tempStr}
            onChange={e => setTempStr(e.target.value)}
            onBlur={() => { if (!tempStr.trim()) setTempStr(String(defaultTempDisplay)); }}
          />
        </div>
        <div>
          <label className="crumb-label">Preheat Time (min)</label>
          <input
            className="crumb-input tabular-nums"
            type="number"
            inputMode="numeric"
            value={preheatStr}
            onChange={e => setPreheatStr(e.target.value)}
            onBlur={() => { if (!preheatStr.trim()) setPreheatStr(String(DEFAULTS.preheat_time_mins)); }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="crumb-label">Lid On (min)</label>
            <input
              className="crumb-input tabular-nums"
              type="number"
              inputMode="numeric"
              value={lidOnStr}
              onChange={e => setLidOnStr(e.target.value)}
              onBlur={() => { if (!lidOnStr.trim()) setLidOnStr(String(DEFAULTS.lid_on_mins)); }}
            />
          </div>
          <div>
            <label className="crumb-label">Lid Off (min)</label>
            <input
              className="crumb-input tabular-nums"
              type="number"
              inputMode="numeric"
              value={lidOffStr}
              onChange={e => setLidOffStr(e.target.value)}
              onBlur={() => { if (!lidOffStr.trim()) setLidOffStr(String(DEFAULTS.lid_off_mins)); }}
            />
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
