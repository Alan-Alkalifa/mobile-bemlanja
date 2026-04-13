import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Product } from '../types/product';

const PAGE_SIZE = 10;

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(0);
      setHasMore(true);
    } else {
      if (!hasMore || loadingMore) return;
      setLoadingMore(true);
    }

    const currentPage = reset ? 0 : page;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data, error: fetchError, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('createdAt', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;

      const newProducts = data || [];

      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }

      const totalFetched = (reset ? 0 : page * PAGE_SIZE) + newProducts.length;
      setHasMore(count != null ? totalFetched < count : newProducts.length === PAGE_SIZE);
      setPage(currentPage + 1);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  const refresh = useCallback(() => fetchProducts(true), []);
  const loadMore = useCallback(() => fetchProducts(false), [fetchProducts]);

  return { products, loading, loadingMore, error, hasMore, refresh, loadMore };
}
