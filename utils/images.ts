import { supabase } from './supabase';

/**
 * Resolves a product image URL.
 * If the path starts with 'http', it returns it as is.
 * Otherwise, it assumes it's a path in the 'product-images' bucket.
 */
export function getProductImageUrl(path: string | null | undefined): string {
  if (!path) return 'https://placehold.co/600x600/eeeeee/a1a1aa?text=No+Image';
  
  if (path.startsWith('http')) {
    return path;
  }

  // Normalize leading slash and any accidental "product-images/" prefix.
  const normalizedPath = path
    .replace(/^\/+/, '')
    .replace(/^product-images\/+/, '');

  // Handle Supabase Storage paths in the "product-images" bucket.
  const { data } = supabase.storage.from('product-images').getPublicUrl(normalizedPath);
  return data.publicUrl;
}
