import { randomUUID } from 'expo-crypto';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { isSupabaseConfigured, supabase, supabaseConfig } from './supabase';

export interface UploadedPhoto {
  url: string;
  thumbUrl: string;
  storagePath: string;
  width: number;
  height: number;
}

export const canStorePhotos = isSupabaseConfigured;

async function resize(
  uri: string,
  maxSize: number,
  compress: number
): Promise<{ uri: string; width: number; height: number }> {
  const context = ImageManipulator.manipulate(uri, {
    maxWidth: maxSize,
    maxHeight: maxSize,
  });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress, format: SaveFormat.JPEG });
  return { uri: saved.uri, width: saved.width, height: saved.height };
}

async function uploadObject(path: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const body = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(supabaseConfig.bucket)
    .upload(path, body, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase-Upload fehlgeschlagen: ${error.message}`);
  }

  const { data } = supabase.storage.from(supabaseConfig.bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Compresses the picked image, creates a thumbnail, and uploads both to
 * Supabase Storage. Only the public URLs and the storage path of the full
 * image are persisted in Postgres.
 */
export async function uploadItemPhoto(
  localUri: string,
  itemId: string
): Promise<UploadedPhoto> {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Bilder-Upload braucht Supabase. Bitte EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY setzen.'
    );
  }

  const full = await resize(localUri, 1600, 0.82);
  const thumb = await resize(full.uri, 480, 0.7);

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) {
    throw new Error('Bitte melde dich an, um Bilder hochzuladen.');
  }

  // Storage policies only allow writing below the user's own id.
  const key = `${userId}/${itemId}/${randomUUID()}`;
  const url = await uploadObject(`${key}.jpg`, full.uri);
  const thumbUrl = await uploadObject(`${key}-thumb.jpg`, thumb.uri);

  return {
    url,
    thumbUrl,
    storagePath: `${key}.jpg`,
    width: full.width,
    height: full.height,
  };
}

export async function deleteStoragePhoto(storagePath: string): Promise<void> {
  if (!storagePath || !isSupabaseConfigured) {
    return;
  }

  const paths = [storagePath];
  const thumbPath = storagePath.replace(/\.jpg$/, '-thumb.jpg');
  if (thumbPath !== storagePath) {
    paths.push(thumbPath);
  }

  try {
    await supabase.storage.from(supabaseConfig.bucket).remove(paths);
  } catch {
    // Best effort: an orphaned object in storage is not worth blocking the UI.
  }
}
