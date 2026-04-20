import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Flour, AddIn } from '@/types/bake';
import { saveFlourTypes } from '@/hooks/useFlourTypes';

interface Step1Data {
  name: string;
  date: string;
  loaf_count: number;
  loaf_weight_g: number;
  flours: Flour[];
  add_ins: AddIn[];
  water_g: number;
  starter_g: number;
  leaven_g: number;
}

interface Step1Props {
  onNext: (data: Step1Data) => void;
  onContinue?: (data: Step1Data) => void;
  initialData?: Partial<Step1Data>;
}

function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calcPct(grams: number, totalFlour: number): number {
  if (!totalFlour) return 0;
  return Math.round(grams / totalFlour * 100);
}

export default function Step1Recipe({ onNext, onContinue, initialData }: Step1Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  

  const [name, setName] = useState(initialData?.name ?? '');
  const [date, setDate] = useState(
    initialData?.date ?? searchParams.get('date') ?? toLocalDate(new Date())
  );
  const [loafCount, setLoafCount] = useState(initialData?.loaf_count ?? 1);
  const [loafWeight, setLoafWeight] = useState(initialData?.loaf_weight_g ?? 500);

  const handleLoafCountChange = (n: number) => {
    setLoafCount(n);
    setLoafWeight(n === 1 ? 500 : 1000);
  };
  const [flours, setFlours] = useState<Flour[]>(
    initialData?.flours ?? [{ type: 'White bread flour', grams: 500 }]
  );
  const [addIns, setAddIns] = useState<AddIn[]>(initialData?.add_ins ?? []);
  const [water, setWater] = useState(initialData?.water_g ?? 375);
  const [starter, setStarter] = useState(initialData?.starter_g ?? 10);
  const [leaven, setLeaven] = useState(initialData?.leaven_g ?? 100);

  const totalFlour = flours.reduce((s, f) => s + (f.grams || 0), 0);

  // Sync flour blend total to target weight
  useEffect(() => {
    if (!loafWeight) return;
    setFlours(prev => {
      const currentTotal = prev.reduce((s, f) => s + (f.grams || 0), 0);
      if (currentTotal === 0 || prev.length === 1) {
        return prev.map((f, i) => i === 0 ? { ...f, grams: loafWeight } : f);
      }
      // Multiple flours — scale proportionally
      return prev.map(f => ({
        ...f,
        grams: Math.round((f.grams / currentTotal) * loafWeight),
      }));
    });
  }, [loafWeight]);
  const hydrationPct = calcPct(water, totalFlour);
  const starterPct = calcPct(starter, totalFlour);
  const leavenPct = calcPct(leaven, totalFlour);

  const addAddIn = () => setAddIns(a => [...a, { name: '', grams: 0 }]);
  const removeAddIn = (i: number) => setAddIns(a => a.filter((_, idx) => idx !== i));
  const updateAddIn = (i: number, field: keyof AddIn, value: string | number) =>
    setAddIns(a => a.map((item, idx) => idx !== i ? item : { ...item, [field]: field === 'grams' ? Number(value) : String(value) }));

  const addFlour = () => setFlours((f) => [...f, { type: '', grams: 0 }]);
  const removeFlour = (i: number) => setFlours((f) => f.filter((_, idx) => idx !== i));
  const updateFlour = (i: number, field: keyof Flour, value: string | number) =>
    setFlours((f) => f.map((item, idx) => {
      if (idx !== i) return item;
      if (field === 'grams') {
        const otherTotal = f.reduce((s, fl, fi) => fi !== i ? s + (fl.grams || 0) : s, 0);
        const clamped = Math.max(0, Math.min(Number(value), loafWeight - otherTotal));
        return { ...item, grams: clamped };
      }
      return { ...item, type: String(value) };
    }));

  const canProceed = name.trim() && date && totalFlour > 0;

  const gatherData = (): Step1Data => ({
    name: name.trim(),
    date,
    loaf_count: loafCount,
    loaf_weight_g: loafWeight,
    flours,
    add_ins: addIns.filter(a => a.name.trim()),
    water_g: water,
    starter_g: starter,
    leaven_g: leaven,
  });

  const handleNext = () => {
    if (!canProceed) return;
    saveFlourTypes(flours.map(f => f.type));
    onNext(gatherData());
  };

  const handleContinue = () => {
    if (!canProceed || !onContinue) return;
    saveFlourTypes(flours.map(f => f.type));
    onContinue(gatherData());
  };

  return (
    <div
      className="flex flex-col min-h-dvh bg-background"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-10"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>

        <button onClick={() => navigate('/')} className="p-1" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold"
          style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Step 1 of 3
          </p>
          <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Recipe Setup
          </h2>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: '33%' }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Loaf name */}
        <div>
          <label className="crumb-label">Loaf Name</label>
          <input
            className="crumb-input"
            type="text"
            placeholder="Country Sourdough #1"
            value={name}
            onChange={(e) => setName(e.target.value)} />

        </div>

        {/* Date */}
        <div>
          <label className="crumb-label">Date</label>
          <input
            className="crumb-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)} />

        </div>

        {/* Loaf count + weight */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="crumb-label">Loaves</label>
            <div className="flex gap-2">
              {[1, 2].map((n) =>
              <button
                key={n}
                onClick={() => handleLoafCountChange(n)}
                className={`flex-1 py-2 rounded-[4px] border font-semibold text-[15px] ${
                loafCount === n ?
                'bg-primary text-primary-foreground border-border' :
                'bg-background text-foreground border-border'}`
                }
                style={{
                  boxShadow: loafCount === n ? '2px 2px 0px hsl(var(--border))' : '2px 2px 0px hsl(var(--border))',
                  fontFamily: 'DM Sans, sans-serif'
                }}>

                  {n}
                </button>
              )}
            </div>
          </div>
          <div className="flex-1">
            <label className="crumb-label">Target Weight (g)</label>
            <input
              className="crumb-input tabular-nums"
              type="number"
              inputMode="numeric"
              value={loafWeight || ''}
              onChange={(e) => setLoafWeight(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              placeholder="500"
            />
          </div>
        </div>

        {/* Flour builder */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="crumb-label mb-0">Flour Blend</label>
            <span className="text-[12px] text-muted-foreground font-semibold"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Total: {totalFlour}g
            </span>
          </div>
          <div className="space-y-2">
            {flours.map((f, i) =>
            <div key={i} className="flex gap-2 items-center">
                <input
                className="crumb-input flex-1"
                type="text"
                placeholder="Flour type"
                value={f.type}
                onChange={(e) => updateFlour(i, 'type', e.target.value)} />

                <input
                className="crumb-input w-20 text-right"
                type="number"
                inputMode="numeric"
                placeholder="g"
                value={f.grams || ''}
                onChange={(e) => updateFlour(i, 'grams', Number(e.target.value))}
                onFocus={(e) => e.target.select()} />

                {flours.length > 1 &&
              <button
                onClick={() => removeFlour(i)}
                className="text-muted-foreground text-xl leading-none px-1"
                aria-label="Remove flour">

                    ×
                  </button>
              }
              </div>
            )}
          </div>
          <button
            onClick={addFlour}
            className="mt-2 text-[13px] font-semibold text-primary underline underline-offset-2"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>

            + Add flour
          </button>
        </div>

        {/* Add-ins */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="crumb-label mb-0">Add-ins <span className="font-normal text-muted-foreground">​</span></label>
          </div>
          <div className="space-y-2">
            {addIns.map((a, i) =>
              <div key={i} className="flex gap-2 items-center">
                <input
                  className="crumb-input flex-1"
                  type="text"
                  placeholder="e.g. Poppy seeds"
                  value={a.name}
                  onChange={(e) => updateAddIn(i, 'name', e.target.value)} />
                <input
                  className="crumb-input w-20 text-right"
                  type="number"
                  inputMode="numeric"
                  placeholder="g"
                  value={a.grams || ''}
                  onChange={(e) => updateAddIn(i, 'grams', Number(e.target.value))}
                  onFocus={(e) => e.target.select()} />
                <button
                  onClick={() => removeAddIn(i)}
                  className="text-muted-foreground text-xl leading-none px-1"
                  aria-label="Remove add-in">
                  ×
                </button>
              </div>
            )}
          </div>
          <button
            onClick={addAddIn}
            className="mt-2 text-[13px] font-semibold text-primary underline underline-offset-2"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            + Add ingredient
          </button>
        </div>

        {/* Water, leaven, salt */}
        <div className="flex gap-2">
          {[
            { label: 'WATER (G)', value: water, set: setWater, pct: hydrationPct },
            { label: 'Leaven (g)', value: leaven, set: setLeaven, pct: leavenPct },
            { label: 'Salt (g)', value: starter, set: setStarter, pct: starterPct },
          ].map(({ label, value, set, pct }) => (
            <div key={label} className="flex-1 flex flex-col gap-1">
              <label className="crumb-label">{label}</label>
              <input
                className="crumb-input tabular-nums"
                type="number"
                inputMode="numeric"
                value={value || ''}
                onChange={(e) => set(Number(e.target.value))}
                onFocus={(e) => e.target.select()} />
              <span className="text-primary font-bold tabular-nums text-[13px] text-right"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {pct}%
              </span>
            </div>
          ))}
        </div>

        {/* Recipe summary card */}
        {totalFlour > 0 &&
        <div className="crumb-card p-4">
            <h3 className="text-[13px] font-bold uppercase tracking-widest mb-3 text-muted-foreground"
          style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Recipe Summary
            </h3>
            <div className="space-y-1.5">
              {flours.map((f, i) => f.type &&
            <div key={i} className="flex justify-between text-[14px]">
                  <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{f.type}</span>
                  <span className="font-semibold tabular-nums">{f.grams}g</span>
                </div>
            )}
              {addIns.filter(a => a.name.trim()).length > 0 && (
                <>
                  <div className="h-px bg-border my-2" />
                  {addIns.filter(a => a.name.trim()).map((a, i) => (
                    <div key={`addin-${i}`} className="flex justify-between text-[14px]">
                      <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{a.name}</span>
                      <span className="font-semibold tabular-nums">{a.grams}g</span>
                    </div>
                  ))}
                </>
              )}
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-[14px]">
                <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Hydration</span>
                <span className="font-bold text-primary tabular-nums">{hydrationPct}%</span>
              </div>
              {leaven > 0 &&
            <div className="flex justify-between text-[14px]">
                  <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Leaven</span>
                  <span className="font-bold text-primary tabular-nums">{leavenPct}%</span>
                </div>
            }
              {starter > 0 &&
            <div className="flex justify-between text-[14px]">
                  <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Salt</span>
                  <span className="font-bold text-primary tabular-nums">{starterPct}%</span>
                </div>
            }
            </div>
          </div>
        }
      </div>

      {/* Action buttons */}
      <div className="px-4 py-4 border-t border-border bg-background space-y-2">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="btn-primary w-full py-4 text-[16px] disabled:opacity-40">
          Save
        </button>
        {onContinue && (
          <button
            onClick={handleContinue}
            disabled={!canProceed}
            className="w-full py-3 text-[14px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
            Continue to Baking →
          </button>
        )}
      </div>
    </div>);

}