import { useCallback, useEffect, useState } from 'react';
import { OrganizationCoupon, ProductDetail, ProductReview, ProductVariant } from '../types/product';
import { supabase } from '../utils/supabase';

export interface ProductOrganizationInfo {
  orgId: string;
  slug: string;
  name: string;
  subtitle: string;
  location: string;
  isOfficial: boolean;
  logoUrl: string;
}

export interface ProductOrganizationStats {
  totalProducts: number;
  avgRating: number | null;
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function useProductDetail(id?: string) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [organization, setOrganization] = useState<ProductOrganizationInfo | null>(null);
  const [organizationStats, setOrganizationStats] = useState<ProductOrganizationStats | null>(null);
  const [organizationCoupons, setOrganizationCoupons] = useState<OrganizationCoupon[]>([]);

  const fetchProduct = useCallback(async () => {
    if (!id) {
      setError('Product id is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          product_images ( imageId, url, sort_order ),
          product_variants ( variantId, name, price, stock, weight_grams ),
          product_reviews (
            reviewId,
            userId,
            rating,
            body,
            createdAt,
            product_review_images ( imageId, reviewId, url, createdAt )
          )
        `)
        .eq('productId', id)
        .single();

      if (fetchError) throw fetchError;

      const rawReviews = (data?.product_reviews ?? []) as ProductReview[];
      const reviewerIds = [...new Set(rawReviews.map((review) => review.userId).filter(Boolean))];
      let reviewerMap = new Map<string, { name: string; avatarUrl: string | null }>();

      if (reviewerIds.length > 0) {
        const { data: reviewerProfiles } = await supabase
          .from('profiles')
          .select('userId, full_name, avatar_url')
          .in('userId', reviewerIds);

        reviewerMap = new Map(
          (reviewerProfiles ?? []).map((profile: any) => [
            profile.userId,
            {
              name: profile.full_name || 'Satisfied Customer',
              avatarUrl: profile.avatar_url || null,
            },
          ])
        );
      }

      const enrichedReviews = rawReviews.map((review) => {
        const reviewer = reviewerMap.get(review.userId);
        return {
          ...review,
          reviewer_name: reviewer?.name || 'Satisfied Customer',
          reviewer_avatar_url: reviewer?.avatarUrl || null,
        };
      });

      setProduct({
        ...(data as ProductDetail),
        product_reviews: enrichedReviews,
      });

      const orgIdFromProduct = data?.orgId;
      if (orgIdFromProduct) {
        const [{ count: totalProducts }, { data: orgProductsWithReviews }] = await Promise.all([
          supabase
            .from('products')
            .select('productId', { count: 'exact', head: true })
            .eq('orgId', orgIdFromProduct)
            .eq('is_active', true),
          supabase
            .from('products')
            .select('product_reviews ( rating )')
            .eq('orgId', orgIdFromProduct)
            .eq('is_active', true),
        ]);

        const orgRatings = (orgProductsWithReviews ?? []).flatMap((orgProduct: any) =>
          (orgProduct.product_reviews ?? [])
            .map((review: { rating: number }) => Number(review.rating))
            .filter((rating: number) => Number.isFinite(rating))
        );
        const orgAvgRating =
          orgRatings.length > 0
            ? Number(
                (
                  orgRatings.reduce((sum: number, rating: number) => sum + rating, 0) / orgRatings.length
                ).toFixed(1)
              )
            : null;
        setOrganizationStats({
          totalProducts: totalProducts ?? 0,
          avgRating: orgAvgRating,
        });

        const nowIso = new Date().toISOString();
        const { data: couponData } = await supabase
          .from('coupons')
          .select(
            'couponId, orgId, code, discount_type, discount_value, min_purchase, max_uses, used_count, expires_at, is_active'
          )
          .eq('orgId', orgIdFromProduct)
          .eq('is_active', true)
          .order('createdAt', { ascending: false });

        const validCoupons = (couponData ?? []).filter((coupon: OrganizationCoupon) => {
          const notExpired = !coupon.expires_at || coupon.expires_at >= nowIso;
          const hasRemainingQuota = coupon.max_uses === null || coupon.used_count < Number(coupon.max_uses);
          return notExpired && hasRemainingQuota;
        });
        setOrganizationCoupons(validCoupons);

        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('orgId', orgIdFromProduct)
          .maybeSingle();

        if (orgData) {
          const orgName =
            orgData.orgName || orgData.org_name || orgData.organization_name || orgData.name || `Org ${orgIdFromProduct}`;
          const orgSubtitle =
            orgData.label ||
            orgData.description ||
            orgData.tagline ||
            orgData.short_description ||
            'Trusted partner store';
          const orgLocation =
            [orgData.city_name, orgData.province_name].filter(Boolean).join(', ') ||
            orgData.city ||
            orgData.regency ||
            orgData.location ||
            orgData.address_city ||
            orgData.address ||
            '';
          const orgIsOfficial = Boolean(
            orgData.orgEmailVerified ??
              orgData.org_email_verified ??
              orgData.is_official_store ??
              orgData.isOfficialStore ??
              orgData.is_official ??
              false
          );
          const logoUrl = orgData.logoUrl || orgData.logo_url || '';
          const orgSlug =
            orgData.slug || orgData.orgSlug || orgData.org_slug || toSlug(orgName) || String(orgIdFromProduct);

          setOrganization({
            orgId: String(orgIdFromProduct),
            slug: String(orgSlug),
            name: orgName,
            subtitle: orgSubtitle,
            location: orgLocation,
            isOfficial: orgIsOfficial,
            logoUrl,
          });
        } else {
          setOrganization(null);
        }
      } else {
        setOrganization(null);
        setOrganizationStats(null);
        setOrganizationCoupons([]);
      }

      if (data?.product_variants?.length > 0) {
        const firstInStock = data.product_variants.find((variant: ProductVariant) => variant.stock > 0);
        setSelectedVariant(firstInStock || data.product_variants[0]);
      } else {
        setSelectedVariant(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    fetchProduct,
    selectedVariant,
    setSelectedVariant,
    organization,
    organizationStats,
    organizationCoupons,
  };
}
