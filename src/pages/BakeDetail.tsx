import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBakes } from '@/hooks/useBakes';
import { ArrowLeft, Heart, Star, Camera, ImageIcon, Pencil, Plus, X, Check, Download, Share2, GripVertical, Trash2 } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';

import { useSettings, displayTemp } from '@/contexts/SettingsContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

const MAX_PHOTOS = 5;

function calcPct(grams: number, totalFlour: number): number {
  if (!totalFlour) return 0;
  return Math.round((grams / totalFlour) * 100);
}

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

function base64ToBlob(base64: string): Blob {
  const [meta, data] = base64.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const byteString = atob(data);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mime });
}

function ProcessCard({ bake, editing, tempUnit, draft, setDraft }: {
  bake: { bake_temp_c: number; preheat_time_mins: number; lid_on_mins: number; lid_off_mins: number };
  editing: boolean;
  tempUnit: 'C' | 'F';
  draft: { temp: number; preheat: number; lidOn: number; lidOff: number };
  setDraft: {
    setTemp: (v: number) => void;
    setPreheat: (v: number) => void;
    setLidOn: (v: number) => void;
    setLidOff: (v: number) => void;
  };
}) {
  const hasData = bake.bake_temp_c > 0 || bake.preheat_time_mins > 0 || bake.lid_on_mins > 0 || bake.lid_off_mins > 0;
  if (!hasData && !editing) return null;

  const cToF = (c: number) => Math.round(c * 9 / 5 + 32);
  const fToC = (f: number) => Math.round((f - 32) * 5 / 9);
  const displayTempVal = tempUnit === 'F' ? cToF(draft.temp) : draft.temp;

  const rows: { label: string; value: number; setValue: (v: number) => void; unit: string; display: string }[] = [
    { label: 'Oven temp', value: displayTempVal, setValue: (v) => setDraft.setTemp(tempUnit === 'F' ? fToC(v) : v), unit: `°${tempUnit}`, display: displayTemp(bake.bake_temp_c, tempUnit) },
    { label: 'Preheat', value: draft.preheat, setValue: setDraft.setPreheat, unit: 'min', display: `${bake.preheat_time_mins} min` },
    { label: 'Lid on', value: draft.lidOn, setValue: setDraft.setLidOn, unit: 'min', display: `${bake.lid_on_mins} min` },
    { label: 'Lid off', value: draft.lidOff, setValue: setDraft.setLidOff, unit: 'min', display: `${bake.lid_off_mins} min` },
  ];

  return (
    <div className="crumb-card p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
        style={{ fontFamily: 'DM Sans, sans-serif' }}>Process</h3>
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.label} className="flex justify-between items-center text-[14px]">
            <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{r.label}</span>
            {editing ? (
              <div className="flex items-center gap-1">
                <input type="number" value={r.value || ''} onChange={e => r.setValue(Number(e.target.value) || 0)}
                  className="crumb-input w-16 text-right py-1 px-2 text-[14px]" />
                <span className="text-muted-foreground text-[13px]">{r.unit}</span>
              </div>
            ) : (
              <span className="font-semibold tabular-nums">{r.display}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Drag-reorder thumbnail strip ─── */
function ReorderStrip({
  photos,
  currentSlide,
  onReorder,
  onSelect,
  onAdd,
  canAdd,
}: {
  photos: string[];
  currentSlide: number;
  onReorder: (newPhotos: string[]) => void;
  onSelect: (index: number) => void;
  onAdd?: () => void;
  canAdd?: boolean;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartIdx = useRef<number | null>(null);

  const getDropIndex = (clientX: number): number | null => {
    if (!containerRef.current) return null;
    const children = Array.from(containerRef.current.children) as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) return i;
    }
    return null;
  };

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartIdx.current = index;
    setDragIdx(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragIdx === null) return;
    const idx = getDropIndex(e.touches[0].clientX);
    setOverIdx(idx);
  };

  const handleTouchEnd = () => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const newPhotos = [...photos];
      const [moved] = newPhotos.splice(dragIdx, 1);
      newPhotos.splice(overIdx, 0, moved);
      onReorder(newPhotos);
      onSelect(overIdx);
    }
    setDragIdx(null);
    setOverIdx(null);
    touchStartIdx.current = null;
  };

  // Also support mouse drag for desktop
  const handleMouseDown = (index: number) => {
    setDragIdx(index);
  };

  const handleMouseEnter = (index: number) => {
    if (dragIdx !== null) setOverIdx(index);
  };

  const handleMouseUp = () => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const newPhotos = [...photos];
      const [moved] = newPhotos.splice(dragIdx, 1);
      newPhotos.splice(overIdx, 0, moved);
      onReorder(newPhotos);
      onSelect(overIdx);
    }
    setDragIdx(null);
    setOverIdx(null);
  };

  if (photos.length < 1) return null;
  const reorderable = photos.length > 1;

  return (
    <div
      ref={containerRef}
      className="flex gap-2 mt-3 justify-center"
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      {photos.map((photo, i) => (
        <div
          key={i}
          className={`relative w-14 h-14 rounded-[4px] overflow-hidden border-2 transition-all shrink-0 ${reorderable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${
            i === currentSlide ? 'border-primary' : 'border-border'
          } ${dragIdx === i ? 'opacity-50 scale-95' : ''} ${overIdx === i && dragIdx !== null && dragIdx !== i ? 'ring-2 ring-primary' : ''}`}
          style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}
          onTouchStart={reorderable ? (e) => handleTouchStart(i, e) : undefined}
          onTouchMove={reorderable ? handleTouchMove : undefined}
          onTouchEnd={reorderable ? handleTouchEnd : undefined}
          onMouseDown={reorderable ? () => handleMouseDown(i) : undefined}
          onMouseEnter={reorderable ? () => handleMouseEnter(i) : undefined}
          onClick={() => { if (dragIdx === null) onSelect(i); }}
        >
          <img src={photo} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
          {reorderable && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/30 flex justify-center py-0.5">
              <GripVertical size={10} className="text-white" />
            </div>
          )}
        </div>
      ))}
      {canAdd && onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="w-14 h-14 rounded-[4px] border-2 border-dashed border-border flex items-center justify-center shrink-0 bg-muted/40 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}
          aria-label="Add photo"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

/* ─── Fullscreen photo lightbox ─── */
function PhotoLightbox({ photo, onClose, bakeName }: { photo: string; onClose: () => void; bakeName: string }) {
  const handleShare = async () => {
    const blob = base64ToBlob(photo);
    const file = new File([blob], `${bakeName}.jpg`, { type: 'image/jpeg' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: bakeName });
      } catch { /* user cancelled */ }
    } else {
      // fallback: download
      handleDownload();
    }
  };

  const handleDownload = () => {
    const blob = base64ToBlob(photo);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bakeName}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={onClose}>
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="p-2 text-white" aria-label="Close">
          <X size={24} strokeWidth={2} />
        </button>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="p-2 text-white" aria-label="Save photo">
            <Download size={22} strokeWidth={2} />
          </button>
          <button onClick={handleShare} className="p-2 text-white" aria-label="Share photo">
            <Share2 size={22} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <img
          src={photo}
          alt={bakeName}
          className="max-w-full max-h-full object-contain"
          onClick={e => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

export default function BakeDetail({ demo = false, asModal = false }: { demo?: boolean; asModal?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isDemo = demo || location.pathname.startsWith('/demo');
  const { bakes, updateBake, deleteBake } = useBakes(isDemo);
  const { tempUnit } = useSettings();

  const bake = bakes.find(b => b.id === id);


  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // ─── On-page edit mode ───
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftFlours, setDraftFlours] = useState<{ type: string; grams: number }[]>([]);
  const [draftAddIns, setDraftAddIns] = useState<{ name: string; grams: number }[]>([]);
  const [draftWater, setDraftWater] = useState(0);
  const [draftStarter, setDraftStarter] = useState(0);
  const [draftLeaven, setDraftLeaven] = useState(0);
  const [draftTemp, setDraftTemp] = useState(0);
  const [draftPreheat, setDraftPreheat] = useState(0);
  const [draftLidOn, setDraftLidOn] = useState(0);
  const [draftLidOff, setDraftLidOff] = useState(0);

  const enterEdit = () => {
    if (!bake) return;
    setDraftName(bake.name);
    setDraftDate(bake.date);
    setDraftNotes(bake.notes ?? '');
    setDraftFlours(bake.flours.map(f => ({ ...f })));
    setDraftAddIns((bake.add_ins ?? []).map(a => ({ ...a })));
    setDraftWater(bake.water_g);
    setDraftStarter(bake.starter_g);
    setDraftLeaven(bake.leaven_g);
    setDraftTemp(bake.bake_temp_c);
    setDraftPreheat(bake.preheat_time_mins);
    setDraftLidOn(bake.lid_on_mins);
    setDraftLidOff(bake.lid_off_mins);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    if (!bake) return;
    const cleanFlours = draftFlours.filter(f => f.type.trim() && f.grams > 0);
    const cleanAddIns = draftAddIns.filter(a => a.name.trim() && a.grams > 0);
    const totalFlour = cleanFlours.reduce((s, f) => s + f.grams, 0);
    updateBake(bake.id, {
      name: draftName.trim() || bake.name,
      date: draftDate || bake.date,
      notes: draftNotes,
      flours: cleanFlours,
      add_ins: cleanAddIns,
      water_g: draftWater,
      starter_g: draftStarter,
      leaven_g: draftLeaven,
      hydration_pct: calcPct(draftWater, totalFlour),
      starter_pct: calcPct(draftStarter, totalFlour),
      leaven_pct: calcPct(draftLeaven, totalFlour),
      bake_temp_c: draftTemp,
      preheat_time_mins: draftPreheat,
      lid_on_mins: draftLidOn,
      lid_off_mins: draftLidOff,
    });
    setEditing(false);
  };

  const canSave = editing && draftName.trim().length > 0 && draftFlours.some(f => f.type.trim() && f.grams > 0);

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

  const handleAddMultiplePhotos = async (files: FileList) => {
    const remaining = MAX_PHOTOS - photos.length;
    const filesToAdd = Array.from(files).slice(0, remaining);
    const newPhotos = [...photos];
    for (const file of filesToAdd) {
      try {
        const compressed = await compressImage(file);
        newPhotos.push(compressed);
      } catch (e) {
        console.error('Image compression failed', e);
      }
    }
    updateBake(bake.id, { photos: newPhotos, photo_base64: newPhotos[0] ?? '' });
    setShowPhotoOptions(false);
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    updateBake(bake.id, { photos: newPhotos, photo_base64: newPhotos[0] ?? '' });
    const newSlide = Math.min(currentSlide, Math.max(0, newPhotos.length - 1));
    setCurrentSlide(newSlide);
    setTimeout(() => carouselApi?.scrollTo(newSlide), 50);
  };

  const handleReorderPhotos = (newPhotos: string[]) => {
    updateBake(bake.id, { photos: newPhotos, photo_base64: newPhotos[0] ?? '' });
  };

  const confirmDelete = () => {
    deleteBake(bake.id);
    navigate(backPath, { replace: true });
  };

  return (
    <div
      className={asModal ? "flex flex-col max-h-[85vh] bg-background w-full" : "flex flex-col min-h-dvh md:min-h-0 md:flex-1 bg-background w-full"}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {isDemo && <DemoBanner />}

      {/* Header */}
      <header
        className={`flex items-center justify-between px-4 py-3 border-b border-border bg-background z-10 ${asModal ? '' : 'sticky top-0'}`}
        style={{ paddingTop: isDemo ? '12px' : 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <button onClick={() => { const idx = (window.history.state as any)?.idx; if (typeof idx === 'number' && idx > 0) { navigate(-1); } else { navigate(backPath, { replace: true }); } }} className="p-1" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        {!isDemo && (
          editing ? (
            <div className="flex items-center gap-3">
              <button
                onClick={cancelEdit}
                className="text-[14px] font-semibold text-muted-foreground"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={!canSave}
                className="p-1 disabled:opacity-40"
                aria-label="Save edits"
              >
                <Check size={22} strokeWidth={2.5} className="text-primary" />
              </button>
            </div>
          ) : (
            <button onClick={enterEdit} className="p-1" aria-label="Edit bake">
              <Pencil size={22} strokeWidth={2} />
            </button>
          )
        )}
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
                className="w-full rounded-[6px] border border-border object-cover cursor-pointer"
                style={{ maxHeight: 320, boxShadow: '4px 4px 0px hsl(var(--border))' }}
                onClick={() => setLightboxPhoto(photos[0])}
              />
              {!isDemo && editing && (
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
                          className="w-full rounded-[6px] border border-border object-cover cursor-pointer"
                          style={{ maxHeight: 320, boxShadow: '4px 4px 0px hsl(var(--border))' }}
                          onClick={() => setLightboxPhoto(photo)}
                        />
                        {!isDemo && editing && (
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
            </div>
          )}

          {/* Edit mode: thumbnail strip for reorder/add/remove */}
          {editing && photos.length >= 1 && (
            <ReorderStrip
              photos={photos}
              currentSlide={currentSlide}
              onReorder={handleReorderPhotos}
              onSelect={(idx) => {
                setCurrentSlide(idx);
                setTimeout(() => carouselApi?.scrollTo(idx), 50);
              }}
              onAdd={() => setShowPhotoOptions(true)}
              canAdd={!isDemo && photos.length < MAX_PHOTOS}
            />
          )}

          {/* Default view: dot indicators when multiple photos */}
          {!editing && photos.length >= 2 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentSlide(i);
                    setTimeout(() => carouselApi?.scrollTo(i), 50);
                  }}
                  aria-label={`Go to photo ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentSlide ? 'w-4 bg-primary' : 'w-1.5 bg-border'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-5 space-y-6">
          {/* Tappable name */}
          <div>
            {editing ? (
              <>
                <input
                  className={`crumb-input text-2xl font-bold ${!draftName.trim() ? 'border-destructive' : ''}`}
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  placeholder="Bake name"
                />
                <input
                  type="date"
                  className="crumb-input mt-2 text-[14px]"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                  value={draftDate}
                  onChange={e => setDraftDate(e.target.value)}
                />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  {bake.name}
                </h1>
                <p className="text-muted-foreground text-[14px] mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {formatDate(bake.date)}
                </p>
              </>
            )}

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
            ) : editing ? (
              <textarea
                className="crumb-input resize-none"
                rows={4}
                placeholder="How did it go? Crust colour, oven spring, flavour..."
                value={draftNotes}
                onChange={e => setDraftNotes(e.target.value)}
              />
            ) : (
              <textarea
                className="crumb-input resize-none"
                rows={4}
                placeholder="How did it go? Crust colour, oven spring, flavour..."
                defaultValue={bake.notes}
                onBlur={e => updateBake(bake.id, { notes: e.target.value })}
                key={bake.notes /* reset uncontrolled value when bake.notes changes */}
              />
            )}
          </div>


          {/* Favourite toggle (moved from header) */}
          {!isDemo && (
            <button
              onClick={toggleFavourite}
              className="crumb-card w-full p-3 flex items-center justify-center gap-2 text-[14px] font-semibold transition-colors"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <Heart
                size={18}
                strokeWidth={2}
                fill={bake.is_favourite ? 'hsl(var(--primary))' : 'none'}
                stroke={bake.is_favourite ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
              />
              <span className={bake.is_favourite ? 'text-primary' : ''}>
                {bake.is_favourite ? 'Favourited' : 'Add to Favourites'}
              </span>
            </button>
          )}

          {/* Flour blend */}
          <div className="crumb-card p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Flour Blend</h3>
            {editing ? (
              <div className="space-y-2">
                {draftFlours.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="crumb-input flex-1 py-1 px-2 text-[14px]"
                      placeholder="Flour type"
                      value={f.type}
                      onChange={e => setDraftFlours(prev => prev.map((x, j) => j === i ? { ...x, type: e.target.value } : x))}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      className="crumb-input w-20 text-right py-1 px-2 text-[14px] tabular-nums"
                      value={f.grams || ''}
                      onChange={e => setDraftFlours(prev => prev.map((x, j) => j === i ? { ...x, grams: Number(e.target.value) || 0 } : x))}
                    />
                    <span className="text-muted-foreground text-[13px]">g</span>
                    <button
                      onClick={() => setDraftFlours(prev => prev.filter((_, j) => j !== i))}
                      className="p-1 text-muted-foreground"
                      aria-label="Remove flour"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setDraftFlours(prev => [...prev, { type: '', grams: 0 }])}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-primary mt-1"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  <Plus size={14} strokeWidth={2.5} /> Add flour
                </button>
              </div>
            ) : (
              bake.flours.map((f, i) => (
                <div key={i} className="flex justify-between text-[14px] py-1">
                  <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{f.type}</span>
                  <span className="font-semibold tabular-nums">{f.grams}g</span>
                </div>
              ))
            )}
          </div>

          {/* Add-ins */}
          {(editing || (bake.add_ins && bake.add_ins.length > 0)) && (
            <div className="crumb-card p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
                style={{ fontFamily: 'DM Sans, sans-serif' }}>Add-ins</h3>
              {editing ? (
                <div className="space-y-2">
                  {draftAddIns.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className="crumb-input flex-1 py-1 px-2 text-[14px]"
                        placeholder="Add-in name"
                        value={a.name}
                        onChange={e => setDraftAddIns(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        className="crumb-input w-20 text-right py-1 px-2 text-[14px] tabular-nums"
                        value={a.grams || ''}
                        onChange={e => setDraftAddIns(prev => prev.map((x, j) => j === i ? { ...x, grams: Number(e.target.value) || 0 } : x))}
                      />
                      <span className="text-muted-foreground text-[13px]">g</span>
                      <button
                        onClick={() => setDraftAddIns(prev => prev.filter((_, j) => j !== i))}
                        className="p-1 text-muted-foreground"
                        aria-label="Remove add-in"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setDraftAddIns(prev => [...prev, { name: '', grams: 0 }])}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-primary mt-1"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    <Plus size={14} strokeWidth={2.5} /> Add add-in
                  </button>
                </div>
              ) : (
                bake.add_ins!.map((a, i) => (
                  <div key={i} className="flex justify-between text-[14px] py-1">
                    <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{a.name}</span>
                    <span className="font-semibold tabular-nums">{a.grams}g</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Baker's percentages */}
          <div className="crumb-card p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Baker's Percentages</h3>
            {editing ? (
              <div className="space-y-2">
                {[
                  { label: 'Water (g)', value: draftWater, setter: setDraftWater },
                  { label: 'Starter (g)', value: draftStarter, setter: setDraftStarter },
                  { label: 'Salt (g)', value: draftLeaven, setter: setDraftLeaven },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center text-[14px]">
                    <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{row.label}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      className="crumb-input w-24 text-right py-1 px-2 text-[14px] tabular-nums"
                      value={row.value || ''}
                      onChange={e => row.setter(Number(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>
            ) : (
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
            )}
          </div>

          {/* Bake stats - inline editable */}
          <ProcessCard
            bake={bake}
            editing={editing}
            tempUnit={tempUnit}
            draft={{ temp: draftTemp, preheat: draftPreheat, lidOn: draftLidOn, lidOff: draftLidOff }}
            setDraft={{ setTemp: setDraftTemp, setPreheat: setDraftPreheat, setLidOn: setDraftLidOn, setLidOff: setDraftLidOff }}
          />

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
      <input ref={libraryRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => e.target.files && e.target.files.length > 0 && handleAddMultiplePhotos(e.target.files)} />

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

      {/* Fullscreen lightbox */}
      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
          bakeName={bake.name}
        />
      )}
    </div>
  );
}
