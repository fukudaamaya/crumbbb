import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBakes } from '@/hooks/useBakes';
import { ArrowLeft, Heart, Star, Camera, ImageIcon, Pencil } from 'lucide-react';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > height) {
        if (width > MAX) { height = (height * MAX) / width; width = MAX; }
      } else {
        if (height > MAX) { width = (width * MAX) / height; height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function BakeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bakes, updateBake, deleteBake } = useBakes();

  const bake = bakes.find(b => b.id === id);

  const [editingName, setEditingName] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [localName, setLocalName] = useState('');
  const [localDate, setLocalDate] = useState('');

  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  if (!bake) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-muted-foreground">Bake not found.</p>
      </div>
    );
  }

  const toggleFavourite = () => updateBake(bake.id, { is_favourite: !bake.is_favourite });

  const handlePhoto = async (file: File) => {
    try {
      const compressed = await compressImage(file);
      updateBake(bake.id, { photo_base64: compressed });
    } catch (e) {
      console.error('Image compression failed', e);
    }
    setShowPhotoOptions(false);
  };

  const saveName = () => {
    if (localName.trim()) updateBake(bake.id, { name: localName.trim() });
    setEditingName(false);
  };

  const saveDate = () => {
    if (localDate) updateBake(bake.id, { date: localDate });
    setEditingDate(false);
  };

  const confirmDelete = () => {
    deleteBake(bake.id);
    navigate('/', { replace: true });
  };

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
        {/* Tappable photo */}
        <div className="px-4 pt-4 relative" onClick={() => setShowPhotoOptions(true)}>
          {bake.photo_base64 ? (
            <>
              <img
                src={bake.photo_base64}
                alt={bake.name}
                className="w-full rounded-[6px] border border-border object-cover"
                style={{ maxHeight: 320, boxShadow: '4px 4px 0px hsl(var(--border))' }}
              />
              <div className="absolute top-6 right-6 bg-background/80 border border-border rounded-full p-1.5"
                style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}>
                <Camera size={16} strokeWidth={2} />
              </div>
            </>
          ) : (
            <div className="h-48 bg-muted rounded-[6px] border border-border flex flex-col items-center justify-center gap-2"
              style={{ boxShadow: '4px 4px 0px hsl(var(--border))' }}>
              <Camera size={28} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="text-[14px] font-semibold text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Tap to add photo
              </span>
            </div>
          )}
        </div>

        <div className="px-4 py-5 space-y-6">
          {/* Tappable name */}
          <div>
            {editingName ? (
              <input
                autoFocus
                className="crumb-input text-2xl font-bold w-full"
                style={{ fontFamily: 'Raleway, sans-serif' }}
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => e.key === 'Enter' && saveName()}
              />
            ) : (
              <button
                className="flex items-center gap-2 w-full text-left group"
                onClick={() => { setLocalName(bake.name); setEditingName(true); }}
              >
                <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  {bake.name}
                </h1>
                <Pencil size={15} strokeWidth={2} className="text-muted-foreground shrink-0" />
              </button>
            )}

            {/* Tappable date */}
            {editingDate ? (
              <input
                autoFocus
                type="date"
                className="crumb-input mt-1 text-[14px]"
                value={localDate}
                onChange={e => setLocalDate(e.target.value)}
                onBlur={saveDate}
              />
            ) : (
              <button
                className="flex items-center gap-1.5 mt-1"
                onClick={() => { setLocalDate(bake.date); setEditingDate(true); }}
              >
                <p className="text-muted-foreground text-[14px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {formatDate(bake.date)}
                </p>
                <Pencil size={12} strokeWidth={2} className="text-muted-foreground" />
              </button>
            )}

            {/* Tappable rating */}
            <div className="flex gap-1 mt-2">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onClick={() => updateBake(bake.id, { rating: bake.rating === s ? 0 : s })}
                  aria-label={`${s} star`}
                >
                  <Star
                    size={26}
                    fill={s <= bake.rating ? 'hsl(var(--primary))' : 'none'}
                    stroke={s <= bake.rating ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                    strokeWidth={1.5}
                  />
                </button>
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

          {/* Notes — always editable */}
          <div>
            <label className="crumb-label">Notes</label>
            <textarea
              className="crumb-input resize-none"
              rows={4}
              placeholder="How did it go? Crust colour, oven spring, flavour..."
              defaultValue={bake.notes}
              onBlur={e => updateBake(bake.id, { notes: e.target.value })}
            />
          </div>

          {/* Metadata */}
          <p className="text-[12px] text-muted-foreground text-center"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {bake.loaf_count} {bake.loaf_count === 1 ? 'loaf' : 'loaves'} · {bake.loaf_weight_g}g target
          </p>

          {/* Delete */}
          <button
            onClick={() => setShowDelete(true)}
            className="w-full py-4 text-[15px] font-semibold rounded-[4px] border border-border text-destructive"
            style={{ fontFamily: 'DM Sans, sans-serif', boxShadow: '2px 2px 0px hsl(var(--border))' }}
          >
            Delete Entry
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
      <input ref={libraryRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />

      {/* Photo source sheet */}
      {showPhotoOptions && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowPhotoOptions(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[16px] border-t border-border px-4 pt-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          >
            <p className="text-center text-[13px] text-muted-foreground font-semibold uppercase tracking-widest mb-4"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Add Photo</p>
            <button onClick={() => cameraRef.current?.click()}
              className="btn-secondary w-full py-4 text-[15px] flex items-center justify-center gap-2 mb-2">
              <Camera size={18} strokeWidth={2} /> Camera
            </button>
            <button onClick={() => libraryRef.current?.click()}
              className="btn-secondary w-full py-4 text-[15px] flex items-center justify-center gap-2 mb-3">
              <ImageIcon size={18} strokeWidth={2} /> Photo Library
            </button>
            <button onClick={() => setShowPhotoOptions(false)}
              className="w-full py-3 text-[15px] font-semibold text-muted-foreground"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Delete confirmation sheet */}
      {showDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowDelete(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[16px] border-t border-border px-4 pt-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          >
            <p className="text-center font-bold text-[17px] mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>Delete this bake?</p>
            <p className="text-center text-[14px] text-muted-foreground mb-5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              This can't be undone.
            </p>
            <button onClick={confirmDelete}
              className="w-full py-4 text-[15px] font-semibold rounded-[4px] border border-border text-destructive mb-2"
              style={{ fontFamily: 'DM Sans, sans-serif', boxShadow: '2px 2px 0px hsl(var(--border))' }}>
              Yes, Delete
            </button>
            <button onClick={() => setShowDelete(false)}
              className="w-full py-3 text-[15px] font-semibold text-muted-foreground"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
