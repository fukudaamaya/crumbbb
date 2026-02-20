import { useParams, useNavigate } from 'react-router-dom';
import { useBakes } from '@/hooks/useBakes';
import { ArrowLeft, Heart, Star } from 'lucide-react';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BakeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bakes, updateBake } = useBakes();

  const bake = bakes.find(b => b.id === id);

  if (!bake) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-muted-foreground">Bake not found.</p>
      </div>
    );
  }

  const toggleFavourite = () => updateBake(bake.id, { is_favourite: !bake.is_favourite });

  return (
    <div
      className="flex flex-col min-h-dvh bg-background"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b border-border bg-background sticky top-0 z-10"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <button onClick={() => navigate(-1)} className="p-1" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <button onClick={toggleFavourite} className="p-1" aria-label="Toggle favourite">
          <Heart
            size={24}
            fill={bake.is_favourite ? 'hsl(var(--primary))' : 'none'}
            stroke={bake.is_favourite ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
            strokeWidth={1.8}
          />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Loaf photo */}
        {bake.photo_base64 ? (
          <div className="px-4 pt-4">
            <img
              src={bake.photo_base64}
              alt={bake.name}
              className="w-full rounded-[6px] border border-border object-cover"
              style={{ maxHeight: 320, boxShadow: '4px 4px 0px hsl(var(--border))' }}
            />
          </div>
        ) : (
          <div className="mx-4 mt-4 h-48 bg-muted rounded-[6px] border border-border flex items-center justify-center"
            style={{ boxShadow: '4px 4px 0px hsl(var(--border))' }}>
            <span className="text-5xl">🍞</span>
          </div>
        )}

        <div className="px-4 py-5 space-y-6">
          {/* Name + date + stars */}
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Raleway, sans-serif' }}>
              {bake.name}
            </h1>
            <p className="text-muted-foreground text-[14px] mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {formatDate(bake.date)}
            </p>
            <div className="flex gap-1 mt-2">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  size={18}
                  fill={s <= bake.rating ? 'hsl(var(--primary))' : 'none'}
                  stroke={s <= bake.rating ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                />
              ))}
            </div>
          </div>

          {/* Flour blend */}
          <div className="crumb-card p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Flour Blend
            </h3>
            {bake.flours.map((f, i) => (
              <div key={i} className="flex justify-between text-[14px] py-1">
                <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{f.type}</span>
                <span className="font-semibold tabular-nums">{f.grams}g</span>
              </div>
            ))}
          </div>

          {/* Baker's percentages */}
          <div className="crumb-card p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Baker's Percentages
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Hydration', value: `${bake.hydration_pct}%` },
                { label: 'Starter', value: `${bake.starter_pct}%` },
                { label: 'Leaven', value: `${bake.leaven_pct}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center border border-border rounded-[4px] p-2"
                  style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}>
                  <p className="text-[20px] font-bold text-primary tabular-nums"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {value}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bake stats */}
          {(bake.proofing_time_mins > 0 || bake.bake_temp_c > 0 || bake.bake_time_mins > 0) && (
            <div className="crumb-card p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Process
              </h3>
              <div className="space-y-2">
                {bake.proofing_time_mins > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Proofing time</span>
                    <span className="font-semibold tabular-nums">{bake.proofing_time_mins} min</span>
                  </div>
                )}
                {bake.bake_temp_c > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Oven temp</span>
                    <span className="font-semibold tabular-nums">{bake.bake_temp_c}°C</span>
                  </div>
                )}
                {bake.bake_time_mins > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Bake time</span>
                    <span className="font-semibold tabular-nums">{bake.bake_time_mins} min</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Crumb photo */}
          {bake.crumb_photo_base64 && (
            <div>
              <label className="crumb-label">Crumb Cross-Section</label>
              <img
                src={bake.crumb_photo_base64}
                alt="Crumb"
                className="w-full rounded-[6px] border border-border object-cover mt-2"
                style={{ maxHeight: 260, boxShadow: '4px 4px 0px hsl(var(--border))' }}
              />
            </div>
          )}

          {/* Notes */}
          {bake.notes && (
            <div className="crumb-card p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Notes
              </h3>
              <p className="text-[15px] leading-relaxed text-foreground"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {bake.notes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <p className="text-[12px] text-muted-foreground text-center"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {bake.loaf_count} {bake.loaf_count === 1 ? 'loaf' : 'loaves'} · {bake.loaf_weight_g}g target
          </p>
        </div>
      </div>
    </div>
  );
}
