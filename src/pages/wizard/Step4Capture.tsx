import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Star, Camera, ImageIcon, Plus, X } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

interface Step4Props {
  onSave: (data: {
    photos: string[];
    notes: string;
    rating: number;
  }) => void;
  onBack: () => void;
}

const MAX_PHOTOS = 5;

async function compressImage(file: File): Promise<string> {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image file too large. Please select a smaller image (max 10MB).');
  }

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
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      const MAX_BASE64_SIZE = 500 * 1024;
      if (base64.length > MAX_BASE64_SIZE) {
        reject(new Error('Compressed image still too large. Try a simpler image.'));
      } else {
        resolve(base64);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Step4Capture({ onSave, onBack }: Step4Props) {
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  const onApiChange = useCallback((emblaApi: CarouselApi) => {
    setApi(emblaApi);
    if (!emblaApi) return;
    emblaApi.on('select', () => setCurrentSlide(emblaApi.selectedScrollSnap()));
  }, []);

  const handleAddPhoto = async (file: File) => {
    try {
      const compressed = await compressImage(file);
      if (photos.length < MAX_PHOTOS) {
        setPhotos(prev => [...prev, compressed]);
      }
    } catch (e) {
      console.error('Image compression failed', e);
    }
    setShowPhotoOptions(false);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    if (currentSlide >= photos.length - 1 && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    onSave({ photos, notes, rating });
  };

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
        <button onClick={onBack} className="p-1" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Step 4 of 4
          </p>
          <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Capture
          </h2>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: '100%' }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Photos */}
        <div>
          <label className="crumb-label">Photos <span className="text-muted-foreground font-normal">({photos.length}/{MAX_PHOTOS})</span></label>

          {/* Hidden file inputs */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => { e.target.files?.[0] && handleAddPhoto(e.target.files[0]); }}
          />
          <input
            ref={libraryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { e.target.files?.[0] && handleAddPhoto(e.target.files[0]); }}
          />

          {photos.length === 0 && (
            <button
              onClick={() => setShowPhotoOptions(true)}
              className="w-full rounded-[6px] border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-2 py-10"
            >
              <Camera size={32} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="text-[14px] font-semibold text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Tap to add photo
              </span>
            </button>
          )}

          {photos.length === 1 && (
            <div className="relative">
              <img
                src={photos[0]}
                alt="Bake photo"
                className="w-full rounded-[6px] border border-border object-cover"
                style={{ maxHeight: 280, boxShadow: '4px 4px 0px hsl(var(--border))' }}
              />
              <button
                onClick={() => handleRemovePhoto(0)}
                className="absolute top-2 right-2 bg-background border border-border rounded-full w-7 h-7 flex items-center justify-center"
                style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}
                aria-label="Remove photo"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
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
                          alt={`Bake photo ${i + 1}`}
                          className="w-full rounded-[6px] border border-border object-cover"
                          style={{ maxHeight: 280, boxShadow: '4px 4px 0px hsl(var(--border))' }}
                        />
                        <button
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-2 right-2 bg-background border border-border rounded-full w-7 h-7 flex items-center justify-center"
                          style={{ boxShadow: '2px 2px 0px hsl(var(--border))' }}
                          aria-label="Remove photo"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
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
                    onClick={() => api?.scrollTo(i)}
                    aria-label={`Go to photo ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add more button */}
          {photos.length > 0 && photos.length < MAX_PHOTOS && (
            <button
              onClick={() => setShowPhotoOptions(true)}
              className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-primary"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <Plus size={16} strokeWidth={2.5} /> Add photo
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="crumb-label">Notes</label>
          <textarea
            className="crumb-input resize-none"
            rows={4}
            placeholder="How did it go? Crust colour, oven spring, flavour..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Star rating */}
        <div>
          <label className="crumb-label">Rating</label>
          <div className="flex justify-between mt-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                className="flex-1 flex justify-center py-1"
                onClick={() => setRating(r => r === s ? 0 : s)}
                aria-label={`${s} star${s > 1 ? 's' : ''}`}
              >
                <Star
                  size={52}
                  fill={s <= rating ? 'hsl(var(--primary))' : 'none'}
                  stroke={s <= rating ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="px-4 py-4 border-t border-border bg-background">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full py-4 text-[16px] disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Bake 🍞'}
        </button>
      </div>

      {/* Photo source action sheet */}
      {showPhotoOptions && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setShowPhotoOptions(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[16px] border-t border-border px-4 pt-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
          >
            <p className="text-center text-[13px] text-muted-foreground font-semibold uppercase tracking-widest mb-4"
              style={{ fontFamily: 'DM Sans, sans-serif' }}>Add Photo</p>
            <button
              onClick={() => cameraRef.current?.click()}
              className="btn-secondary w-full py-4 text-[15px] flex items-center justify-center gap-2 mb-2"
            >
              <Camera size={18} strokeWidth={2} /> Camera
            </button>
            <button
              onClick={() => libraryRef.current?.click()}
              className="btn-secondary w-full py-4 text-[15px] flex items-center justify-center gap-2 mb-3"
            >
              <ImageIcon size={18} strokeWidth={2} /> Photo Library
            </button>
            <button
              onClick={() => setShowPhotoOptions(false)}
              className="w-full py-3 text-[15px] font-semibold text-muted-foreground"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
