import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProductReviewCard } from '../../components/products/ProductReviewCard';
import { ProductOrgCard } from '../../components/products/ProductOrgCard';
import { OrganizationCouponsSection } from '../../components/products/OrganizationCouponsSection';
import { Skeleton } from '../../components/ui/Skeleton';
import { OrganizationCoupon, ProductDetail, ProductReview, ProductVariant } from '../../types/product';
import { getProductImageUrl } from '../../utils/images';
import { supabase } from '../../utils/supabase';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 420;
const DESCRIPTION_WORD_LIMIT = 100;

interface OrganizationInfo {
  orgId: string;
  slug: string;
  name: string;
  subtitle: string;
  location: string;
  isOfficial: boolean;
  logoUrl: string;
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [visibleReviewCount, setVisibleReviewCount] = useState(3);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [organizationCoupons, setOrganizationCoupons] = useState<OrganizationCoupon[]>([]);
  const { colorScheme } = useColorScheme();
  const palette =
    colorScheme === 'dark'
      ? {
          background: '#09090b',
          muted: '#27272a',
          border: '#27272a',
          primary: '#fafafa',
          primaryForeground: '#18181b',
          mutedForeground: '#a1a1aa',
          foreground: '#fafafa',
          error: '#f87171',
          warning: '#f59e0b',
        }
      : {
          background: '#ffffff',
          muted: '#f4f4f5',
          border: '#e4e4e7',
          primary: '#18181b',
          primaryForeground: '#fafafa',
          mutedForeground: '#71717a',
          foreground: '#09090b',
          error: '#ef4444',
          warning: '#f59e0b',
        };

  const fetchProduct = useCallback(async () => {
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
          const hasRemainingQuota =
            coupon.max_uses === null || coupon.used_count < Number(coupon.max_uses);
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
            orgData.orgName ||
            orgData.org_name ||
            orgData.organization_name ||
            orgData.name ||
            `Org ${orgIdFromProduct}`;
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
            orgData.slug ||
            orgData.orgSlug ||
            orgData.org_slug ||
            toSlug(orgName) ||
            String(orgIdFromProduct);

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
        setOrganizationCoupons([]);
      }
      setVisibleReviewCount(3);
      setIsDescriptionExpanded(false);
      if (data?.product_variants?.length > 0) {
        const firstInStock = data.product_variants.find(
          (variant: ProductVariant) => variant.stock > 0
        );
        setSelectedVariant(firstInStock || data.product_variants[0]);
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

  const formattedPrice = (price: string | number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(price));

  const displayPrice = selectedVariant ? selectedVariant.price : product?.price ?? '0';

  const avgRating =
    product?.product_reviews && product.product_reviews.length > 0
      ? product.product_reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.product_reviews.length
      : null;

  const allImages =
    product?.product_images && product.product_images.length > 0
      ? [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)
      : product?.image_url
      ? [{ imageId: 'main', url: product.image_url, sort_order: 0 }]
      : [];
  const productDescription =
    product?.description?.trim() ||
    'Experience the perfect blend of style and durability with our signature product. Crafted from premium materials for long-lasting comfort.';
  const descriptionWords = productDescription.split(/\s+/).filter(Boolean);
  const isLongDescription = descriptionWords.length > DESCRIPTION_WORD_LIMIT;
  const collapsedDescription = isLongDescription
    ? `${descriptionWords.slice(0, DESCRIPTION_WORD_LIMIT).join(' ')}...`
    : productDescription;
  const displayDescription =
    isDescriptionExpanded || !isLongDescription ? productDescription : collapsedDescription;
  const orgId = String(product?.orgId ?? 'Unknown');
  const orgName = organization?.name || `Organization ${orgId}`;
  const orgSubtitle = organization?.subtitle || 'Trusted partner store';
  const orgLocation = organization?.location || '';
  const orgIsOfficial = organization?.isOfficial ?? false;
  const orgLogoUrl = organization?.logoUrl || '';
  const orgInitials = orgName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('') || 'OR';

  const handleVisitOrg = () => {
    router.push(`/organizations/${encodeURIComponent(orgId)}` as never);
  };

  const handleChatOrg = () => {
    Alert.alert('Chat', `Chat with organization ${orgId} is coming soon.`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <Skeleton className="w-full rounded-none" style={{ height: IMAGE_HEIGHT }} />
        <View className="px-5 pt-6 gap-5">
          <View className="gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-7 w-2/5" />
          </View>
          <View className="gap-3">
            <Skeleton className="h-5 w-32" />
            <View className="flex-row gap-2">
              <Skeleton className="h-12 w-24 rounded-2xl" />
              <Skeleton className="h-12 w-24 rounded-2xl" />
              <Skeleton className="h-12 w-24 rounded-2xl" />
            </View>
          </View>
          <View className="gap-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </View>
        </View>
        <View className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-8 border-t border-border bg-background">
          <View className="flex-row gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <Skeleton className="flex-1 h-14 rounded-2xl" />
          </View>
        </View>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-10">
        <View className="bg-muted p-6 rounded-3xl items-center w-full">
          <Ionicons name="alert-circle" size={48} color={palette.error} />
          <Text className="text-foreground font-bold text-xl mt-4 text-center">
            Something went wrong
          </Text>
          <Text className="text-muted-foreground text-sm text-center mt-2 mb-6 leading-5">
            {error || "We couldn't find the product you're looking for."}
          </Text>
          <TouchableOpacity
            onPress={fetchProduct}
            className="bg-primary w-full py-4 rounded-2xl items-center shadow-sm"
          >
            <Text className="text-primary-foreground font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-muted-foreground font-medium underline">Back to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header Overlay */}
      <View 
        className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-4"
        style={Platform.OS === 'ios' ? { paddingTop: 60 } : {}}
      >
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.9}
            className="bg-background/80 w-11 h-11 items-center justify-center rounded-full border border-border shadow-sm"
          >
            <Ionicons name="chevron-back" size={24} color={palette.foreground} />
          </TouchableOpacity>
          
          <View className="flex-row gap-3">
            <TouchableOpacity className="bg-background/80 w-11 h-11 items-center justify-center rounded-full border border-border shadow-sm">
              <Ionicons name="share-outline" size={20} color={palette.foreground} />
            </TouchableOpacity>
            <TouchableOpacity className="bg-background/80 w-11 h-11 items-center justify-center rounded-full border border-border shadow-sm">
              <Ionicons name="heart-outline" size={20} color={palette.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Image Display */}
        <View className="relative bg-muted">
          <FlatList
            data={allImages}
            keyExtractor={(img) => img.imageId}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / width
              );
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: getProductImageUrl(item.url) }}
                style={{ width, height: IMAGE_HEIGHT }}
                contentFit="cover"
                transition={400}
              />
            )}
          />
          
          {/* Subtle Indicator */}
          {allImages.length > 1 && (
            <View className="absolute bottom-6 w-full flex-row justify-center gap-1.5">
              {allImages.map((_, i) => (
                <View
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeImageIndex ? 'bg-primary w-6' : 'bg-background/50 w-1.5'
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content Section */}
        <View className="px-5 pt-6 gap-6">
          <View>
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-foreground text-3xl font-extrabold tracking-tight flex-1 pr-3">
                {product.name}
              </Text>
              {avgRating !== null && (
                <View className="flex-row items-center gap-1 pt-1">
                  <Ionicons name="star" size={14} color={palette.warning} />
                  <Text className="text-foreground text-sm font-bold">{avgRating.toFixed(1)}</Text>
                  <Text className="text-muted-foreground text-xs">({product.product_reviews.length})</Text>
                </View>
              )}
            </View>
            
            <Text className="text-primary font-black text-2xl tracking-tight">
              {formattedPrice(displayPrice)}
            </Text>
          </View>

          {/* Variants Section */}
          {product.product_variants && product.product_variants.length > 0 && (
            <View className="gap-3">
              <View className="flex-row justify-between items-end">
                <Text className="text-foreground font-bold text-lg">Select Variant</Text>
                {selectedVariant && (
                  <Text className="text-muted-foreground text-sm font-medium">
                    Stock: {selectedVariant.stock}
                  </Text>
                )}
              </View>
              <View className="flex-row flex-wrap gap-2.5">
                {product.product_variants.map((variant) => {
                  const isSelected = selectedVariant?.variantId === variant.variantId;
                  const outOfStock = variant.stock === 0;
                  const variantStyle = isSelected
                    ? {
                        backgroundColor: palette.primary,
                        borderColor: palette.primary,
                        opacity: 1,
                      }
                    : outOfStock
                    ? {
                        backgroundColor: 'rgba(239, 68, 68, 0.14)',
                        borderColor: palette.error,
                        opacity: 1,
                      }
                    : {
                        backgroundColor: palette.background,
                        borderColor: palette.border,
                        opacity: 1,
                      };
                  return (
                    <TouchableOpacity
                      key={variant.variantId}
                      onPress={() => !outOfStock && setSelectedVariant(variant)}
                      activeOpacity={outOfStock ? 1 : 0.7}
                      className="relative px-5 py-3 rounded-2xl border-2 overflow-hidden"
                      style={variantStyle}
                    >
                      <Text
                        className="text-sm font-bold"
                        style={{
                          color: isSelected
                            ? palette.primaryForeground
                            : outOfStock
                            ? palette.error
                            : palette.foreground,
                        }}
                      >
                        {variant.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <OrganizationCouponsSection coupons={organizationCoupons} />

          {/* Description Section */}
          <View className="gap-2.5">
            <Text className="text-foreground font-bold text-lg">Product Description</Text>
            <Text className="text-muted-foreground text-base leading-7">
              {displayDescription}
            </Text>
            {isLongDescription && (
              <TouchableOpacity onPress={() => setIsDescriptionExpanded((prev) => !prev)}>
                <Text className="text-primary font-bold text-sm">
                  {isDescriptionExpanded ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ProductOrgCard
            orgName={orgName}
            orgSubtitle={orgSubtitle}
            orgLocation={orgLocation}
            isOfficial={orgIsOfficial}
            initials={orgInitials}
            logoUrl={orgLogoUrl}
            iconColor={palette.mutedForeground}
            onVisitOrg={handleVisitOrg}
          />

          {/* Divider */}
          <View className="h-[1px] bg-border my-2" />

          {/* Reviews Section */}
          <View className="gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-foreground font-bold text-lg">Customer Reviews</Text>
            </View>
            {product.product_reviews.length > 0 ? (
              <>
                {product.product_reviews.slice(0, visibleReviewCount).map((review) => (
                  <ProductReviewCard
                    key={review.reviewId}
                    review={review}
                    warningColor={palette.warning}
                  />
                ))}
                {visibleReviewCount < product.product_reviews.length && (
                  <TouchableOpacity
                    onPress={() => setVisibleReviewCount((prev) => prev + 3)}
                    className="mt-1 py-3 items-center rounded-xl border border-border bg-background"
                  >
                    <Text className="text-primary font-bold text-sm">Load more</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View className="border border-border rounded-2xl px-4 py-5 bg-muted/30">
                <Text className="text-muted-foreground text-sm">No reviews yet.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View 
        className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-8 border-t shadow-2xl"
        style={{
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderTopColor: palette.border,
          backgroundColor: palette.background,
        }}
      >
        <View className="flex-row gap-4 items-center">
          <TouchableOpacity className="w-14 h-14 bg-muted items-center justify-center rounded-2xl border border-border">
            <Ionicons name="cart-outline" size={24} color={palette.foreground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleChatOrg}
            className="w-14 h-14 bg-muted items-center justify-center rounded-2xl border border-border"
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={palette.foreground} />
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.9}
            className="flex-1 h-14 rounded-2xl items-center justify-center shadow-lg"
            style={{
              backgroundColor: selectedVariant?.stock === 0 ? palette.muted : palette.primary,
            }}
            disabled={selectedVariant?.stock === 0}
          >
            <Text
              className="font-black text-base uppercase tracking-widest"
              style={{
                color:
                  selectedVariant?.stock === 0
                    ? palette.mutedForeground
                    : palette.primaryForeground,
              }}
            >
              {selectedVariant?.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
