import { useCallback, useEffect, useRef, useState } from 'react';
import { Product } from '../types/product';
import { supabase } from '../utils/supabase';

interface UseOrganizationProductsOptions {
  orgId: string;
  pageSize?: number;
}

export function useOrganizationProducts({
  orgId,
  pageSize = 10,
}: UseOrganizationProductsOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchProductsByOrg = useCallback(
    async (targetPage: number, reset = false) => {
      if (isFetchingRef.current) return;

      if (!orgId) {
        setProducts([]);
        setLoading(false);
        setLoadingMore(false);
        setError(null);
        setPage(0);
        setHasMore(false);
        return;
      }

      isFetchingRef.current = true;

      if (reset) {
        setLoading(true);
        setPage(0);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const from = targetPage * pageSize;
      const to = from + pageSize - 1;

      setError(null);
      try {
        const { data, error: fetchError, count } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('orgId', orgId)
          .eq('is_active', true)
          .order('createdAt', { ascending: false })
          .range(from, to);

        if (fetchError) throw fetchError;
        const newProducts = (data || []) as Product[];
        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => {
            const byId = new Map(prev.map((item) => [item.productId, item]));
            newProducts.forEach((item) => byId.set(item.productId, item));
            return Array.from(byId.values());
          });
        }

        const totalFetched = targetPage * pageSize + newProducts.length;
        setHasMore(count != null ? totalFetched < count : newProducts.length === pageSize);
        setPage(targetPage + 1);
      } catch (err: any) {
        if (reset) setProducts([]);
        setError(err.message || 'Failed to load organization products');
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [orgId, pageSize]
  );

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchProductsByOrg(0, true);
  }, [fetchProductsByOrg]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchProductsByOrg(page, false);
  }, [fetchProductsByOrg, hasMore, loading, loadingMore, page]);

  const refresh = useCallback(() => {
    fetchProductsByOrg(0, true);
  }, [fetchProductsByOrg]);

  return { products, loading, loadingMore, error, hasMore, loadMore, refresh };
}
