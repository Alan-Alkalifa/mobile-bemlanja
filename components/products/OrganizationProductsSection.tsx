import { useColorScheme } from 'nativewind';
import React, { ReactElement } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useOrganizationProducts } from '../../hooks/useOrganizationProducts';
import { Skeleton } from '../ui/Skeleton';
import { OrganizationProductFilters } from './OrganizationProductFilters';
import { ProductCard } from './ProductCard';

interface OrganizationProductsSectionProps {
  orgId: string;
  title?: string;
  pageSize?: number;
  listHeaderComponent?: ReactElement;
}

export function OrganizationProductsSection({
  orgId,
  title,
  pageSize = 8,
  listHeaderComponent,
}: OrganizationProductsSectionProps) {
  const {
    products,
    loading,
    loadingMore,
    error,
    loadMore,
    refresh,
    categories,
    filters,
    applyFilters,
    resetFilters,
  } = useOrganizationProducts({
    orgId,
    pageSize,
  });
  const { colorScheme } = useColorScheme();
  const indicatorColor = colorScheme === 'dark' ? '#a1a1aa' : '#71717a';

  const sectionHeader = (
    <View>
      {listHeaderComponent}
      <OrganizationProductFilters
        categories={categories}
        filters={filters}
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
      />
      {!!title && <Text className="text-foreground font-bold text-lg mt-6 mb-3 px-5">{title}</Text>}
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <View>
        {sectionHeader}
        <View className="flex-row flex-wrap justify-between px-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <View
              key={`org-product-skeleton-${index}`}
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
        <View className="py-2 items-center">
          <ActivityIndicator size="small" color={indicatorColor} />
        </View>
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View>
        {sectionHeader}
        <View className="mx-5 border border-border rounded-2xl bg-muted/30 p-4">
          <Text className="text-muted-foreground text-sm mb-3">{error}</Text>
          <TouchableOpacity
            onPress={refresh}
            className="self-start bg-primary px-4 py-2 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-primary-foreground text-sm font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.productId}
      renderItem={({ item }) => <ProductCard product={item} />}
      numColumns={2}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
      ListHeaderComponent={sectionHeader}
      ListEmptyComponent={
        <View className="mx-5 border border-border rounded-2xl bg-muted/30 p-4">
          <Text className="text-muted-foreground text-sm">No products available yet.</Text>
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color={indicatorColor} />
            <Text className="text-muted-foreground text-xs mt-2">Loading more...</Text>
          </View>
        ) : null
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
