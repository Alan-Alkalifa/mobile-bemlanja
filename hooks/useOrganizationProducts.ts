import { useCallback, useEffect, useRef, useState } from 'react';
import { Product } from '../types/product';
import { supabase } from '../utils/supabase';

export interface OrganizationCategoryOption {
  orgCategoryId: string;
  name: string;
  slug: string;
}

export interface OrganizationProductFilters {
  searchQuery: string;
  selectedCategoryId: string | null;
  minPrice: string;
  maxPrice: string;
}

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
  const [categories, setCategories] = useState<OrganizationCategoryOption[]>([]);
  const [filters, setFilters] = useState<OrganizationProductFilters>({
    searchQuery: '',
    selectedCategoryId: null,
    minPrice: '',
    maxPrice: '',
  });
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
      const minPriceValue =
        filters.minPrice.trim().length > 0 ? Number(filters.minPrice) : null;
      const maxPriceValue =
        filters.maxPrice.trim().length > 0 ? Number(filters.maxPrice) : null;

      setError(null);
      try {
        let categoryProductIds: string[] | null = null;
        if (filters.selectedCategoryId) {
          const { data: categoryRows, error: categoryError } = await supabase
            .from('product_org_categories')
            .select('productId')
            .eq('orgCategoryId', filters.selectedCategoryId);
          if (categoryError) throw categoryError;
          categoryProductIds = (categoryRows ?? []).map((row: any) => String(row.productId));

          if (categoryProductIds.length === 0) {
            setProducts([]);
            setHasMore(false);
            setPage(0);
            setLoading(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
            return;
          }
        }

        let query = supabase
          .from('products')
          .select(
            `
              *,
              product_reviews ( rating )
            `,
            { count: 'exact' }
          )
          .eq('orgId', orgId)
          .eq('is_active', true);

        if (filters.searchQuery.trim()) {
          const safeSearch = filters.searchQuery.trim().replace(/,/g, ' ');
          query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
        }
        if (minPriceValue !== null && Number.isFinite(minPriceValue)) {
          query = query.gte('price', minPriceValue);
        }
        if (maxPriceValue !== null && Number.isFinite(maxPriceValue)) {
          query = query.lte('price', maxPriceValue);
        }
        if (categoryProductIds) {
          query = query.in('productId', categoryProductIds);
        }

        const { data, error: fetchError, count } = await query
          .order('createdAt', { ascending: false })
          .range(from, to);

        if (fetchError) throw fetchError;
        const newProducts = (data || []).map((item: any) => {
          const ratings = (item.product_reviews || [])
            .map((review: { rating: number }) => Number(review.rating))
            .filter((rating: number) => Number.isFinite(rating));
          const reviewCount = ratings.length;
          const avgRating =
            reviewCount > 0
              ? Number(
                  (
                    ratings.reduce((sum: number, rating: number) => sum + rating, 0) / reviewCount
                  ).toFixed(1)
                )
              : null;

          return {
            ...item,
            reviewCount,
            avgRating,
          } as Product;
        });
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
    [filters.maxPrice, filters.minPrice, filters.searchQuery, filters.selectedCategoryId, orgId, pageSize]
  );

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchProductsByOrg(0, true);
  }, [fetchProductsByOrg]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!orgId) {
        setCategories([]);
        return;
      }

      const { data, error: categoryError } = await supabase
        .from('org_categories')
        .select('orgCategoryId, name, slug')
        .eq('orgId', orgId)
        .order('name', { ascending: true });

      if (categoryError) {
        setCategories([]);
        return;
      }

      setCategories((data ?? []) as OrganizationCategoryOption[]);
    };

    fetchCategories();
  }, [orgId]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchProductsByOrg(page, false);
  }, [fetchProductsByOrg, hasMore, loading, loadingMore, page]);

  const refresh = useCallback(() => {
    fetchProductsByOrg(0, true);
  }, [fetchProductsByOrg]);

  const applyFilters = useCallback(
    (next: Partial<OrganizationProductFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...next,
      }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      selectedCategoryId: null,
      minPrice: '',
      maxPrice: '',
    });
  }, []);

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    categories,
    filters,
    applyFilters,
    resetFilters,
  };
}
