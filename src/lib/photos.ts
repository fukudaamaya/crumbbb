import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'bake-photos';
const MAX_DIM = 1200;          // was 800 — Storage isn't row-size constrained
const JPEG_QUALITY = 0.82;     // was 0.7
const MAX_FILE_SIZE = 15 * 1024 * 1024;

/** Downscale + re-encode a File to a JPEG Blob. */
export async function compressToBlob(file: File): Promise<Blob> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image is too large. Please choose one under 15MB.');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let { width, height } = img;
      if (width > height) {
        if (width > MAX_DIM) { height = (height * MAX_DIM) / width; width = MAX_DIM; }
      } else {
        if (height > MAX_DIM) { width = (width * MAX_DIM) / height; height = MAX_DIM; }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas unavailable')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Could not process image')),
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

/** Compress and upload one photo. Returns its public URL. */
export async function uploadPhoto(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to add photos.');

  const blob = await compressToBlob(file);
  const path = `${user.id}/${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** True for Storage URLs; false for legacy base64 data URIs. */
export function isStorageUrl(src: string): boolean {
  return /^https?:\/\//.test(src);
}

/**
 * Get a Blob for a photo, whether it's a Storage URL or legacy base64.
 * Replaces the old base64ToBlob(), which threw on URLs.
 */
export async function photoToBlob(src: string): Promise<Blob> {
  if (isStorageUrl(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error('Could not download photo');
    return res.blob();
  }

  const [meta, data] = src.split(',');
  if (!data) throw new Error('Unrecognised image format');
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Best-effort removal of a photo's underlying Storage object. */
export async function deletePhoto(src: string): Promise<void> {
  if (!isStorageUrl(src)) return;
  const marker = `/object/public/${BUCKET}/`;
  const i = src.indexOf(marker);
  if (i === -1) return;
  const path = decodeURIComponent(src.slice(i + marker.length));
  await supabase.storage.from(BUCKET).remove([path]);
}