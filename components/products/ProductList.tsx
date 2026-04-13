import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { Product } from '../../types/product';
import { useColorScheme } from 'nativewind';
import { Skeleton } from '../ui/Skeleton';

export function ProductList() {
  const { products, loading, loadingMore, error, hasMore, refresh, loadMore } =
    useProducts();
  const { colorScheme } = useColorScheme();
  const palette = colorScheme === 'dark'
    ? { primary: '#fafafa', mutedForeground: '#a1a1aa' }
    : { primary: '#18181b', mutedForeground: '#71717a' };

  useEffect(() => {
    refresh();
  }, []);

  if (loading && products.length === 0) {
    return (
      <View className="px-4 pt-4">
        <View className="flex-row flex-wrap justify-between">
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={`product-skeleton-${index}`}
              className="w-[48%] mb-4 rounded-2xl overflow-hidden border border-border bg-background"
            >
              <Skeleton className="w-full h-40 rounded-none" />
              <View className="p-3 gap-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-2/5 mt-1" />
              </View>
            </View>
          ))}
        </View>
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color={palette.primary} />
          <Text className="text-muted-foreground text-xs mt-2">Loading products...</Text>
        </View>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-error text-base font-semibold mb-2 text-center">
          Failed to load products
        </Text>
        <Text className="text-muted-foreground text-sm text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={refresh}
          className="bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-primary-foreground font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="px-4 pt-2">
        <View className="flex-row flex-wrap justify-between">
          {Array.from({ length: 2 }).map((_, index) => (
            <View
              key={`product-loadmore-skeleton-${index}`}
              className="w-[48%] mb-4 rounded-2xl overflow-hidden border border-border bg-background"
            >
              <Skeleton className="w-full h-40 rounded-none" />
              <View className="p-3 gap-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-2/5 mt-1" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-muted-foreground text-base">No products found</Text>
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(item: Product, index) => `${item.productId}-${index}`}
      renderItem={({ item }) => <ProductCard product={item} />}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
      contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      onEndReached={() => hasMore && loadMore()}
      onEndReachedThreshold={0.4}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={loading && products.length > 0}
          onRefresh={refresh}
          tintColor={palette.mutedForeground}
        />
      }
    />
  );
}
