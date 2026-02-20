import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Flour } from '@/types/bake';

interface Step1Data {
  name: string;
  date: string;
  loaf_count: number;
  loaf_weight_g: number;
  flours: Flour[];
  water_g: number;
  starter_g: number;
  leaven_g: number;
}

interface Step1Props {
  onNext: (data: Step1Data) => void;
  initialData?: Partial<Step1Data>;
}

function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calcPct(grams: number, totalFlour: number): number {
  if (!totalFlour) return 0;
  return Math.round(grams / totalFlour * 100);
}

export default function Step1Recipe({ onNext, initialData }: Step1Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState(initialData?.name ?? '');
  const [date, setDate] = useState(
    initialData?.date ?? searchParams.get('date') ?? toLocalDate(new Date())
  );
  const [loafCount, setLoafCount] = useState(initialData?.loaf_count ?? 1);
  const [loafWeight, setLoafWeight] = useState(initialData?.loaf_weight_g ?? 500);
  const [flours, setFlours] = useState<Flour[]>(
    initialData?.flours ?? [{ type: 'White bread flour', grams: 500 }]
  );
  const [water, setWater] = useState(initialData?.water_g ?? 375);
  const [starter, setStarter] = useState(initialData?.starter_g ?? 100);
  const [leaven, setLeaven] = useState(initialData?.leaven_g ?? 0);

  const totalFlour = flours.reduce((s, f) => s + (f.grams || 0), 0);
  const hydrationPct = calcPct(water, totalFlour);
  const starterPct = calcPct(starter, totalFlour);
  const leavenPct = calcPct(leaven, totalFlour);

  const addFlour = () => setFlours((f) => [...f, { type: '', grams: 0 }]);
  const removeFlour = (i: number) => setFlours((f) => f.filter((_, idx) => idx !== i));
  const updateFlour = (i: number, field: keyof Flour, value: string | number) =>
  setFlours((f) => f.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const canProceed = name.trim() && date && totalFlour > 0;

  const handleNext = () => {
    if (!canProceed) return;
    onNext({
      name: name.trim(),
      date,
      loaf_count: loafCount,
      loaf_weight_g: loafWeight,
      flours,
      water_g: water,
      starter_g: starter,
      leaven_g: leaven
    });
  };

  return (
    <div
      className="flex flex-col min-h-dvh bg-background"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-10"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>

        <button onClick={() => navigate(-1)} className="p-1" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold"
          style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Step 1 of 4
          </p>
          <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Recipe Setup
          </h2>
        </div>
      </header>

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
                onClick={() => setLoafCount(n)}
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
            <label className="crumb-label">Target Weight</label>
            <div className="flex gap-2">
              {[500, 1000].map((w) =>
              <button
                key={w}
                onClick={() => setLoafWeight(w)}
                className={`flex-1 py-2 rounded-[4px] border font-semibold text-[13px] ${
                loafWeight === w ?
                'bg-primary text-primary-foreground border-border' :
                'bg-background text-foreground border-border'}`
                }
                style={{
                  boxShadow: '2px 2px 0px hsl(var(--border))',
                  fontFamily: 'DM Sans, sans-serif'
                }}>

                  {w}g
                </button>
              )}
            </div>
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
                onChange={(e) => updateFlour(i, 'grams', Number(e.target.value))} />

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

        {/* Water, starter, leaven */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="crumb-label">Water (g)</label>
              <input
                className="crumb-input tabular-nums"
                type="number"
                inputMode="numeric"
                value={water || ''}
                onChange={(e) => setWater(Number(e.target.value))} />

            </div>
            <div className="flex items-end pb-2">
              <span className="text-primary font-bold tabular-nums text-[15px]"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {hydrationPct}%
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="crumb-label">Starter (g)</label>
              <input
                className="crumb-input tabular-nums"
                type="number"
                inputMode="numeric"
                value={starter || ''}
                onChange={(e) => setStarter(Number(e.target.value))} />

            </div>
            <div className="flex items-end pb-2">
              <span className="text-primary font-bold tabular-nums text-[15px]"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {starterPct}%
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="crumb-label">Salt (g)</label>
              <input
                className="crumb-input tabular-nums"
                type="number"
                inputMode="numeric"
                value={leaven || ''}
                onChange={(e) => setLeaven(Number(e.target.value))} />

            </div>
            <div className="flex items-end pb-2">
              <span className="text-primary font-bold tabular-nums text-[15px]"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {leavenPct}%
              </span>
            </div>
          </div>
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
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-[14px]">
                <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Hydration</span>
                <span className="font-bold text-primary tabular-nums">{hydrationPct}%</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Starter</span>
                <span className="font-bold text-primary tabular-nums">{starterPct}%</span>
              </div>
              {leaven > 0 &&
            <div className="flex justify-between text-[14px]">
                  <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Leaven</span>
                  <span className="font-bold text-primary tabular-nums">{leavenPct}%</span>
                </div>
            }
            </div>
          </div>
        }
      </div>

      {/* Next button */}
      <div className="px-4 py-4 border-t border-border bg-background">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="btn-primary w-full py-4 text-[16px] disabled:opacity-40">

          Next — Proofing Timer
        </button>
      </div>
    </div>);

}