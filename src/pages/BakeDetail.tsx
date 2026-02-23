import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBakes } from '@/hooks/useBakes';
import { ArrowLeft, Heart, Star, Camera, ImageIcon, Pencil, Plus, X } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useSettings, displayTemp } from '@/contexts/SettingsContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

const MAX_PHOTOS = 5;

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

export default function BakeDetail({ demo = false }: { demo?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isDemo = demo || location.pathname.startsWith('/demo');
  const { bakes, updateBake, deleteBake } = useBakes(isDemo);
  const { tempUnit } = useSettings();

  const bake = bakes.find(b => b.id === id);

  const [editingName, setEditingName] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const [localName, setLocalName] = useState('');
  const [localDate, setLocalDate] = useState('');

  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  const backPath = isDemo ? '/demo' : '/';

  const onApiChange = useCallback((emblaApi: CarouselApi) => {
    setCarouselApi(emblaApi);
    if (!emblaApi) return;
    emblaApi.on('select', () => setCurrentSlide(emblaApi.selectedScrollSnap()));
  }, []);

  if (!bake) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-muted-foreground">Bake not found.</p>
      </div>
    );
  }

  // Resolve photos: prefer photos array, fall back to legacy photo_base64
  const photos: string[] = (bake.photos && bake.photos.length > 0)
    ? bake.photos
    : [bake.photo_base64].filter(Boolean);

  const toggleFavourite = () => updateBake(bake.id, { is_favourite: !bake.is_favourite });

  const handleAddPhoto = async (file: File) => {
    try {
      const compressed = await compressImage(file);
      if (photos.length < MAX_PHOTOS) {
        const newPhotos = [...photos, compressed];
        updateBake(bake.id, { photos: newPhotos, photo_base64: newPhotos[0] ?? '' });
      }
    } catch (e) {
      console.error('Image compression failed', e);
    }
    setShowPhotoOptions(false);
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    updateBake(bake.id, { photos: newPhotos, photo_base64: newPhotos[0] ?? '' });
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
    navigate(backPath, { replace: true });
  };

  return (
    <div
      className="flex flex-col min-h-dvh bg-background"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {isDemo && <DemoBanner />}

      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b border-border bg-background sticky top-0 z-10"
        style={{ paddingTop: isDemo ? '12px' : 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <button onClick={() => { const idx = (window.history.state as any)?.idx; if (typeof idx === 'number' && idx > 0) { navigate(-1); } else { navigate(backPath, { replace: true }); } }} className="p-1" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div className="w-8" />
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Photos section */}
        <div className="px-4 pt-4">
          {photos.length === 0 && (
            <div
              className="h-48 bg-muted rounded-[6px] border border-border flex flex-col items-center justify-center gap-2 cursor-pointer"
              style={{ boxShadow: '4px 4px 0px hsl(var(--border))' }}
              onClick={() => setShowPhotoOptions(true)}
            >
              <Camera size={28} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="text-[14px] font-semibold text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Tap to add photo
              </span>
            </div>
          )}

          {photos.length === 1 && (
            <div className="relative">
              <img
                src={photos[0]}
                alt={bake.name}
                className="w-full rounded-[6px] border border-border object-cover"
                style={{ maxHeight: 320, boxShadow: '4px 4px 0px hsl(var(--border))' }}
              />
              {!isDemo && (
                <button
                  onClick={() => handleRemovePhoto(0)}
                  className="absolute top-2 right-2 bg-background border border-border rounded-full w-7 h-7 flex items-center justify-center"
                  style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}
                  aria-label="Remove photo"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}

          {photos.length >= 2 && (
            <div>
              <Carousel setApi={onApiChange} className="w-full">
                <CarouselContent>
                  {photos.map((photo, i) => (
                    <CarouselItem key={i}>
                      <div className="relative">
                        <img
                          src={photo}
                          alt={`${bake.name} photo ${i + 1}`}
                          className="w-full rounded-[6px] border border-border object-cover"
                          style={{ maxHeight: 320, boxShadow: '4px 4px 0px hsl(var(--border))' }}
                        />
                        {!isDemo && (
                          <button
                            onClick={() => handleRemovePhoto(i)}
                            className="absolute top-2 right-2 bg-background border border-border rounded-full w-7 h-7 flex items-center justify-center"
                            style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}
                            aria-label="Remove photo"
                          >
                            <X size={14} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              {/* Dot indicators */}
              <div className="flex justify-center gap-1.5 mt-3">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? 'bg-primary' : 'bg-border'}`}
                    onClick={() => carouselApi?.scrollTo(i)}
                    aria-label={`Go to photo ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add more photos */}
          {!isDemo && photos.length > 0 && photos.length < MAX_PHOTOS && (
            <button
              onClick={() => setShowPhotoOptions(true)}
              className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-primary"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <Plus size={16} strokeWidth={2.5} /> Add photo ({photos.length}/{MAX_PHOTOS})
            </button>
          )}
        </div>

        <div className="px-4 py-5 space-y-6">
          {/* Tappable name */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
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
                    {!isDemo && <Pencil size={15} strokeWidth={2} className="text-muted-foreground shrink-0" />}
                  </button>
                )}
              </div>
              <button onClick={toggleFavourite} className="p-1 shrink-0 ml-2" aria-label="Toggle favourite">
                <Heart
                  size={24}
                  fill={bake.is_favourite ? 'hsl(var(--primary))' : 'none'}
                  stroke={bake.is_favourite ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                  strokeWidth={1.8}
                />
              </button>
            </div>

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
                {!isDemo && <Pencil size={12} strokeWidth={2} className="text-muted-foreground" />}
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

          {/* Notes */}
          <div>
            <label className="crumb-label">Notes</label>
            {isDemo ? (
              <p className="text-[14px] text-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {bake.notes || '—'}
              </p>
            ) : (
              <textarea
                className="crumb-input resize-none"
                rows={4}
                placeholder="How did it go? Crust colour, oven spring, flavour..."
                defaultValue={bake.notes}
                onBlur={e => updateBake(bake.id, { notes: e.target.value })}
              />
            )}
          </div>

          {/* Flour blend */}
          <div className="crumb-card p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Flour Blend</h3>
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
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Baker's Percentages</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Hydration', value: `${bake.hydration_pct}%` },
                { label: 'Leaven', value: `${bake.leaven_pct}%` },
                { label: 'Salt', value: `${bake.starter_pct}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center border border-border rounded-[4px] p-2"
                  style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}>
                  <p className="text-[20px] font-bold text-primary tabular-nums" style={{ fontFamily: 'DM Sans, sans-serif' }}>{value}</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide" style={{ fontFamily: 'DM Sans, sans-serif' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bake stats */}
          {(bake.proofing_time_mins > 0 || bake.bake_temp_c > 0 || bake.bake_time_mins > 0) && (
            <div className="crumb-card p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>Process</h3>
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
                    <span className="font-semibold tabular-nums">{displayTemp(bake.bake_temp_c, tempUnit)}</span>
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

          {/* Delete */}
          {!isDemo && (
            <button
              onClick={() => setShowDelete(true)}
              className="w-full py-4 text-[15px] font-semibold rounded-[4px] border border-border text-destructive"
              style={{ fontFamily: 'DM Sans, sans-serif', boxShadow: '2px 2px 0px hsl(var(--border))' }}
            >
              Delete Entry
            </button>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={e => e.target.files?.[0] && handleAddPhoto(e.target.files[0])} />
      <input ref={libraryRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleAddPhoto(e.target.files[0])} />

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
