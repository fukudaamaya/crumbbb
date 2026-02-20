import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBakes } from '@/hooks/useBakes';
import { ArrowLeft, Heart, Star, MoreVertical, Camera, ImageIcon } from 'lucide-react';

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

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Edit state
  const [editNotes, setEditNotes] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editPhoto, setEditPhoto] = useState('');

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

  const openEdit = () => {
    setEditNotes(bake.notes);
    setEditRating(bake.rating);
    setEditPhoto(bake.photo_base64);
    setMenuOpen(false);
    setShowEdit(true);
  };

  const saveEdit = () => {
    updateBake(bake.id, { notes: editNotes, rating: editRating, photo_base64: editPhoto });
    setShowEdit(false);
  };

  const confirmDelete = () => {
    deleteBake(bake.id);
    navigate('/', { replace: true });
  };

  const handlePhoto = async (file: File) => {
    try {
      const compressed = await compressImage(file);
      setEditPhoto(compressed);
    } catch (e) {
      console.error('Image compression failed', e);
    }
    setShowPhotoOptions(false);
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
        <div className="flex items-center gap-1">
          <button onClick={toggleFavourite} className="p-1" aria-label="Toggle favourite">
            <Heart
              size={24}
              fill={bake.is_favourite ? 'hsl(var(--primary))' : 'none'}
              stroke={bake.is_favourite ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
              strokeWidth={1.8}
            />
          </button>
          <button onClick={() => setMenuOpen(true)} className="p-1" aria-label="More options">
            <MoreVertical size={22} strokeWidth={2} />
          </button>
        </div>
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

      {/* ⋯ Menu sheet */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[16px] border-t border-border px-4 pt-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          >
            <p className="text-center text-[13px] text-muted-foreground font-semibold uppercase tracking-widest mb-4"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Options</p>
            <button
              onClick={openEdit}
              className="btn-secondary w-full py-4 text-[15px] mb-2"
            >
              Edit Entry
            </button>
            <button
              onClick={() => { setMenuOpen(false); setShowDelete(true); }}
              className="w-full py-4 text-[15px] font-semibold rounded-[4px] border border-border text-destructive mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif', boxShadow: '2px 2px 0px hsl(var(--border))' }}
            >
              Delete Entry
            </button>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full py-3 text-[15px] font-semibold text-muted-foreground"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
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
            <button
              onClick={confirmDelete}
              className="w-full py-4 text-[15px] font-semibold rounded-[4px] border border-border text-destructive mb-2"
              style={{ fontFamily: 'DM Sans, sans-serif', boxShadow: '2px 2px 0px hsl(var(--border))' }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="w-full py-3 text-[15px] font-semibold text-muted-foreground"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* Edit sheet */}
      {showEdit && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowEdit(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[16px] border-t border-border"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)', maxHeight: '85dvh', overflowY: 'auto' }}
          >
            <div className="px-4 pt-4 space-y-5">
              <p className="text-center text-[13px] text-muted-foreground font-semibold uppercase tracking-widest"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>Edit Entry</p>

              {/* Photo */}
              <div>
                <label className="crumb-label">Photo</label>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
                <input ref={libraryRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
                {editPhoto ? (
                  <div className="relative">
                    <img src={editPhoto} alt="Loaf" className="w-full rounded-[6px] border border-border object-cover"
                      style={{ maxHeight: 200, boxShadow: '4px 4px 0px hsl(var(--border))' }} />
                    <button
                      onClick={() => setShowPhotoOptions(true)}
                      className="absolute top-2 right-2 bg-background border border-border rounded-[4px] px-2 py-1 text-[12px] font-semibold"
                      style={{ boxShadow: '2px 2px 0px hsl(var(--border))', fontFamily: 'DM Sans, sans-serif' }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPhotoOptions(true)}
                    className="w-full rounded-[6px] border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-2 py-8"
                  >
                    <Camera size={28} strokeWidth={1.5} className="text-muted-foreground" />
                    <span className="text-[14px] font-semibold text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      Tap to add photo
                    </span>
                  </button>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="crumb-label">Rating</label>
                <div className="flex justify-between mt-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} className="flex-1 flex justify-center py-1"
                      onClick={() => setEditRating(r => r === s ? 0 : s)}>
                      <Star size={40}
                        fill={s <= editRating ? 'hsl(var(--primary))' : 'none'}
                        stroke={s <= editRating ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                        strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="crumb-label">Notes</label>
                <textarea
                  className="crumb-input resize-none"
                  rows={4}
                  placeholder="How did it go? Crust colour, oven spring, flavour..."
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <button onClick={saveEdit} className="btn-primary w-full py-4 text-[16px]">
                Save Changes
              </button>
              <button
                onClick={() => setShowEdit(false)}
                className="w-full py-3 text-[15px] font-semibold text-muted-foreground"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Photo source sheet (within edit) */}
      {showPhotoOptions && (
        <>
          <div className="fixed inset-0 z-60 bg-black/40" onClick={() => setShowPhotoOptions(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-[70] bg-background rounded-t-[16px] border-t border-border px-4 pt-4"
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
    </div>
  );
}
