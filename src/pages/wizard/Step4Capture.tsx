import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Heart } from 'lucide-react';
import { Bake } from '@/types/bake';

interface Step4Props {
  onSave: (data: {
    photo_base64: string;
    crumb_photo_base64: string;
    notes: string;
    rating: number;
  }) => void;
  onBack: () => void;
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
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Step4Capture({ onSave, onBack }: Step4Props) {
  const navigate = useNavigate();

  const [loafPhoto, setLoafPhoto] = useState('');
  const [crumbPhoto, setCrumbPhoto] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);

  const loafInputRef = useRef<HTMLInputElement>(null);
  const crumbInputRef = useRef<HTMLInputElement>(null);

  const handlePhoto = async (file: File, setter: (s: string) => void) => {
    try {
      const compressed = await compressImage(file);
      setter(compressed);
    } catch (e) {
      console.error('Image compression failed', e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    onSave({ photo_base64: loafPhoto, crumb_photo_base64: crumbPhoto, notes, rating });
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
            Capture & Review
          </h2>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: '100%' }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Loaf photo */}
        <div>
          <label className="crumb-label">Loaf Photo</label>
          <input
            ref={loafInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0], setLoafPhoto)}
          />
          {loafPhoto ? (
            <div className="relative">
              <img
                src={loafPhoto}
                alt="Loaf"
                className="w-full rounded-[6px] border border-border object-cover"
                style={{ maxHeight: 280, boxShadow: '4px 4px 0px hsl(var(--border))' }}
              />
              <button
                onClick={() => setLoafPhoto('')}
                className="absolute top-2 right-2 bg-background border border-border rounded-[4px] px-2 py-1 text-[12px] font-semibold"
                style={{ boxShadow: '2px 2px 0px hsl(var(--border))', fontFamily: 'DM Sans, sans-serif' }}
              >
                Retake
              </button>
            </div>
          ) : (
            <button
              onClick={() => loafInputRef.current?.click()}
              className="btn-secondary w-full py-4 text-[15px]"
            >
              📷 Take Loaf Photo
            </button>
          )}
        </div>

        {/* Crumb photo */}
        <div>
          <label className="crumb-label">Crumb Cross-Section (optional)</label>
          <input
            ref={crumbInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0], setCrumbPhoto)}
          />
          {crumbPhoto ? (
            <div className="relative">
              <img
                src={crumbPhoto}
                alt="Crumb"
                className="w-full rounded-[6px] border border-border object-cover"
                style={{ maxHeight: 240, boxShadow: '4px 4px 0px hsl(var(--border))' }}
              />
              <button
                onClick={() => setCrumbPhoto('')}
                className="absolute top-2 right-2 bg-background border border-border rounded-[4px] px-2 py-1 text-[12px] font-semibold"
                style={{ boxShadow: '2px 2px 0px hsl(var(--border))', fontFamily: 'DM Sans, sans-serif' }}
              >
                Retake
              </button>
            </div>
          ) : (
            <button
              onClick={() => crumbInputRef.current?.click()}
              className="btn-secondary w-full py-3 text-[14px]"
            >
              📷 Crumb Photo
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
          <div className="flex gap-3 mt-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onClick={() => setRating(r => r === s ? 0 : s)}
                aria-label={`${s} star${s > 1 ? 's' : ''}`}
              >
                <Star
                  size={32}
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
    </div>
  );
}
