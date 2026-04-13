import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { Product } from '../../types/product';
import { getProductImageUrl } from '../../utils/images';
import { Skeleton } from '../ui/Skeleton';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [imageFailed, setImageFailed] = useState(false);
  const imageUri = useMemo(() => getProductImageUrl(product.image_url), [product.image_url]);
  const cardBackground = colorScheme === 'dark' ? '#09090b' : '#ffffff';
  const iconColor = colorScheme === 'dark' ? '#a1a1aa' : '#71717a';

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(product.price));

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/products/${product.productId}`)}
      className="bg-background w-[48%] mb-4 rounded-2xl overflow-hidden border border-border shadow-sm"
      style={{ backgroundColor: cardBackground }}
    >
      {imageFailed ? (
        <View className="w-full h-40 bg-muted items-center justify-center">
          <Ionicons name="image-outline" size={26} color={iconColor} />
          <Text className="text-muted-foreground text-xs mt-1 font-medium">No image</Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: 160 }}
          contentFit="cover"
          transition={200}
          onError={() => setImageFailed(true)}
        />
      )}
      <View className="p-3 gap-1">
        <Text
          className="text-foreground font-bold text-sm leading-5"
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <Text
          className="text-muted-foreground text-[10px] font-medium leading-4 uppercase tracking-tight"
          numberOfLines={1}
        >
          {product.description || 'Premium Selection'}
        </Text>
        <Text className="text-primary font-black text-sm mt-1">
          {formattedPrice}
        </Text>
        {typeof product.avgRating === 'number' && (product.reviewCount || 0) > 0 && (
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text className="text-foreground text-xs font-semibold">
              {product.avgRating.toFixed(1)}
            </Text>
            <Text className="text-muted-foreground text-[10px]">
              ({product.reviewCount})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function ProductCardSkeleton() {
  return (
    <View className="bg-background w-[48%] mb-4 rounded-2xl overflow-hidden border border-border">
      <Skeleton className="w-full h-40 rounded-none" />
      <View className="p-3 gap-2">
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-4 w-2/5 mt-1" />
        <View className="flex-row items-center gap-1 mt-1">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-10" />
        </View>
      </View>
    </View>
  );
}
