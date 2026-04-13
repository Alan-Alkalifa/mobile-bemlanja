import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CartIconButton } from '../../components/cart/CartIconButton';
import {
  OrganizationCouponsSection,
  OrganizationCouponsSectionSkeleton,
} from '../../components/products/OrganizationCouponsSection';
import { ProductOrgCard, ProductOrgCardSkeleton } from '../../components/products/ProductOrgCard';
import { ProductReviewCard, ProductReviewCardSkeleton } from '../../components/products/ProductReviewCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthProvider';
import { useCart } from '../../contexts/CartProvider';
import { useProductDetail } from '../../hooks/useProductDetail';
import { getProductImageUrl } from '../../utils/images';
import { supabase } from '../../utils/supabase';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 420;
const DESCRIPTION_WORD_LIMIT = 100;
const APP_BASE_URL = (process.env.EXPO_PUBLIC_APP_URL ?? 'https://bemlanja.com').replace(/\/+$/, '');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    product,
    loading,
    error,
    fetchProduct,
    selectedVariant,
    setSelectedVariant,
    organization,
    organizationStats,
    organizationCoupons,
  } = useProductDetail(id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [visibleReviewCount, setVisibleReviewCount] = useState(3);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isQuantityDrawerVisible, setIsQuantityDrawerVisible] = useState(false);
  const [quantityInput, setQuantityInput] = useState('1');
  const [draftVariantId, setDraftVariantId] = useState<string | null>(null);
  const [focusedVariantId, setFocusedVariantId] = useState<string | null>(null);
  const [variantCartQuantities, setVariantCartQuantities] = useState<Record<string, number>>({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { cartCount, addToCart, isAddingToCart } = useCart();
  const { user } = useAuth();
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
  const focusedVariant =
    product?.product_variants.find((variant) => variant.variantId === focusedVariantId) ||
    selectedVariant ||
    product?.product_variants[0] ||
    null;
  const hasVariants = (product?.product_variants?.length || 0) > 0;
  const noVariantStock =
    !hasVariants || !product?.product_variants.some((variant) => variant.stock > 0);
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

  useEffect(() => {
    setVisibleReviewCount(3);
    setIsDescriptionExpanded(false);
    setActiveImageIndex(0);
  }, [product?.productId]);

  useEffect(() => {
    setFocusedVariantId(selectedVariant?.variantId ?? product?.product_variants?.[0]?.variantId ?? null);
  }, [product?.productId, selectedVariant?.variantId]);

  useEffect(() => {
    const fetchVariantCartQuantities = async () => {
      if (!user?.id || !product?.productId) {
        setVariantCartQuantities({});
        return;
      }

      const { data } = await supabase
        .from('cart_items')
        .select('variantId, quantity')
        .eq('userId', user.id)
        .eq('productId', product.productId);

      const next: Record<string, number> = {};
      (data ?? []).forEach((row) => {
        if (row.variantId) {
          next[String(row.variantId)] = Number(row.quantity || 0);
        }
      });
      setVariantCartQuantities(next);
    };

    fetchVariantCartQuantities();
  }, [product?.productId, user?.id, cartCount]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleVisitOrg = () => {
    router.push(`/merchant/${encodeURIComponent(orgId)}` as never);
  };

  const handleChatOrg = () => {
    Alert.alert('Chat', `Chat with organization ${orgId} is coming soon.`);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const initialVariant =
      selectedVariant ||
      product.product_variants.find((variant) => variant.stock > 0) ||
      product.product_variants[0] ||
      null;
    setDraftVariantId(initialVariant?.variantId ?? null);
    setQuantityInput('1');
    setIsQuantityDrawerVisible(true);
  };

  const handleCloseQuantityDrawer = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
      return;
    }
    setIsQuantityDrawerVisible(false);
  };

  const handleConfirmAddToCart = async () => {
    if (!product) return;

    const drawerVariant =
      product.product_variants.find((variant) => variant.variantId === draftVariantId) || null;
    if (product.product_variants.length > 0 && !drawerVariant) {
      Alert.alert('Select variant', 'Please select a variant before adding this product.');
      return;
    }
    if (drawerVariant && drawerVariant.stock <= 0) {
      Alert.alert('Out of stock', 'This variant is currently out of stock.');
      return;
    }

    const requestedQuantity = Number.parseInt(quantityInput, 10);
    if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity.');
      return;
    }

    const result = await addToCart({
      productId: product.productId,
      variantId: drawerVariant?.variantId ?? null,
      quantity: requestedQuantity,
      maxStock: drawerVariant?.stock ?? null,
      productName: product.name,
    });

    if (!result.ok) {
      Alert.alert('Failed to add to cart', result.message);
      return;
    }

    setIsQuantityDrawerVisible(false);
    if (drawerVariant) {
      setSelectedVariant(drawerVariant);
    }
    Alert.alert('Added to cart', result.message);
  };

  const handleShareProduct = async () => {
    if (!product) return;

    try {
      const shareUrl = `${APP_BASE_URL}/products/${encodeURIComponent(String(product.productId))}`;
      await Share.share(
        {
          title: product.name,
          message: `${product.name}\n${shareUrl}`,
          url: shareUrl,
        },
        {
          dialogTitle: `Share ${product.name}`,
        }
      );
    } catch {
      Alert.alert('Unable to share', 'Please try again in a moment.');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <View className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-4">
          <View className="flex-row justify-between items-center">
            <Skeleton className="w-11 h-11 rounded-full" />
            <Skeleton className="w-11 h-11 rounded-full" />
          </View>
        </View>
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
          <OrganizationCouponsSectionSkeleton />
          <View className="gap-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </View>
          <ProductOrgCardSkeleton />
          <View className="gap-3">
            <Skeleton className="h-5 w-36" />
            <ProductReviewCardSkeleton />
          </View>
        </View>
        <View className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-8 border-t border-border bg-background">
          <View className="flex-row gap-4">
            <CartIconButton count={0} iconColor={palette.foreground} onPress={() => null} isLoading />
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
            <TouchableOpacity
              onPress={handleShareProduct}
              activeOpacity={0.9}
              className="bg-background/80 w-11 h-11 items-center justify-center rounded-full border border-border shadow-sm"
            >
              <Ionicons name="share-outline" size={20} color={palette.foreground} />
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
                <Text className="text-foreground font-bold text-lg">Variant</Text>
                {focusedVariant && (
                  <Text className="text-muted-foreground text-sm font-medium">
                    {focusedVariant.stock === 0 ? 'Out of stock' : `Stock: ${focusedVariant.stock}`}
                  </Text>
                )}
              </View>
              <View className="flex-row flex-wrap gap-2.5">
                {product.product_variants.map((variant) => {
                  const isSelected = focusedVariant?.variantId === variant.variantId;
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
                      onPress={() => setFocusedVariantId(variant.variantId)}
                      activeOpacity={0.85}
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
            totalProducts={organizationStats?.totalProducts}
            avgRating={organizationStats?.avgRating}
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
        className="absolute bottom-0 left-0 right-0 z-50 px-5 pt-4 pb-8 border-t shadow-2xl"
        style={{
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderTopColor: palette.border,
          backgroundColor: palette.background,
        }}
      >
        <View className="flex-row gap-4 items-center">
          <CartIconButton
            count={cartCount}
            iconColor={palette.foreground}
            onPress={() => router.push('/cart')}
          />

          <TouchableOpacity
            onPress={handleChatOrg}
            className="w-14 h-14 bg-muted items-center justify-center rounded-2xl border border-border"
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={palette.foreground} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={isQuantityDrawerVisible ? handleConfirmAddToCart : handleAddToCart}
            activeOpacity={0.9}
            className="flex-1 h-14 rounded-2xl items-center justify-center shadow-lg"
            style={{
              backgroundColor:
                noVariantStock
                  ? palette.muted
                  : palette.primary,
            }}
            disabled={
              noVariantStock || isAddingToCart
            }
          >
            <Text
              className="font-black text-base uppercase tracking-widest"
              style={{
                color:
                  noVariantStock
                    ? palette.mutedForeground
                    : palette.primaryForeground,
              }}
            >
              {noVariantStock
                ? 'Sold Out'
                : isAddingToCart
                ? 'Adding...'
                : isQuantityDrawerVisible
                ? 'Confirm'
                : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isQuantityDrawerVisible && (
        <View className="absolute inset-0 z-40">
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleCloseQuantityDrawer}
            className="absolute left-0 right-0 top-0 bg-black/40"
            style={{ bottom: 0 }}
          />
          <View
            className="absolute left-0 right-0 rounded-t-[36px] bg-background border border-border p-5 pb-8"
            style={{ bottom: 0, paddingBottom: 120 }}
          >
            <Text className="text-foreground text-sm font-semibold mb-2">Select Variant</Text>
            <ScrollView
              className={product.product_variants.length > 3 ? 'max-h-[220px]' : ''}
              showsVerticalScrollIndicator={product.product_variants.length > 3}
              nestedScrollEnabled
              contentContainerStyle={{ gap: 8 }}
            >
              {product.product_variants.map((variant) => {
                const selected = draftVariantId === variant.variantId;
                const outOfStock = variant.stock === 0;
                return (
                  <TouchableOpacity
                    key={variant.variantId}
                    onPress={() => !outOfStock && setDraftVariantId(variant.variantId)}
                    activeOpacity={outOfStock ? 1 : 0.85}
                    className={`rounded-xl border px-4 py-3 ${
                      selected ? 'border-primary bg-primary/10' : 'border-border bg-background'
                    } ${outOfStock ? 'opacity-60' : ''}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-foreground font-semibold">{variant.name}</Text>
                      <Text className="text-muted-foreground text-xs">
                        {outOfStock ? 'Out of stock' : `Stock: ${variant.stock}`}
                      </Text>
                    </View>
                    <Text className="text-primary text-sm font-bold mt-1">{formattedPrice(variant.price)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text className="text-muted-foreground text-sm mt-1 mb-4">
              {product.product_variants.find((variant) => variant.variantId === draftVariantId)
                ? `Available stock: ${
                    product.product_variants.find((variant) => variant.variantId === draftVariantId)?.stock
                  }`
                : 'Set quantity to add to cart.'}
            </Text>
            <TextInput
              value={quantityInput}
              onChangeText={(value) => setQuantityInput(value.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              className="h-12 rounded-xl border border-border bg-background px-3 text-foreground"
              placeholder="Quantity"
              placeholderTextColor={palette.mutedForeground}
            />
          </View>
        </View>
      )}
    </View>
  );
}
