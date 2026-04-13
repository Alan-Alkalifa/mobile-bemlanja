import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  OrganizationCategoryOption,
  OrganizationProductFilters as OrganizationProductFiltersState,
} from '../../hooks/useOrganizationProducts';
import { Skeleton } from '../ui/Skeleton';

interface OrganizationProductFiltersProps {
  categories: OrganizationCategoryOption[];
  filters: OrganizationProductFiltersState;
  onApplyFilters: (next: Partial<OrganizationProductFiltersState>) => void;
  onResetFilters: () => void;
}

export function OrganizationProductFilters({
  categories,
  filters,
  onApplyFilters,
  onResetFilters,
}: OrganizationProductFiltersProps) {
  const { colorScheme } = useColorScheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchDraft, setSearchDraft] = useState(filters.searchQuery);
  const [categoryDraft, setCategoryDraft] = useState<string | null>(filters.selectedCategoryId);
  const [minPriceDraft, setMinPriceDraft] = useState(filters.minPrice);
  const [maxPriceDraft, setMaxPriceDraft] = useState(filters.maxPrice);

  const palette =
    colorScheme === 'dark'
      ? {
          icon: '#a1a1aa',
          overlay: 'rgba(0,0,0,0.6)',
        }
      : {
          icon: '#71717a',
          overlay: 'rgba(0,0,0,0.35)',
        };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onApplyFilters({ searchQuery: searchDraft });
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [onApplyFilters, searchDraft]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.selectedCategoryId) count += 1;
    if (filters.minPrice.trim()) count += 1;
    if (filters.maxPrice.trim()) count += 1;
    return count;
  }, [filters.maxPrice, filters.minPrice, filters.selectedCategoryId]);

  const handleOpenDrawer = () => {
    setCategoryDraft(filters.selectedCategoryId);
    setMinPriceDraft(filters.minPrice);
    setMaxPriceDraft(filters.maxPrice);
    setDrawerVisible(true);
  };

  const handleApplyDrawerFilters = () => {
    onApplyFilters({
      selectedCategoryId: categoryDraft,
      minPrice: minPriceDraft,
      maxPrice: maxPriceDraft,
    });
    setDrawerVisible(false);
  };

  const handleResetDrawerFilters = () => {
    setCategoryDraft(null);
    setMinPriceDraft('');
    setMaxPriceDraft('');
    onResetFilters();
    setSearchDraft('');
  };

  return (
    <View className="px-5 mb-6">
      <View className="flex-row items-center gap-2">
        <View className="flex-1 h-11 rounded-xl border border-border bg-background px-3 flex-row items-center gap-2">
          <Ionicons name="search-outline" size={18} color={palette.icon} />
          <TextInput
            value={searchDraft}
            onChangeText={setSearchDraft}
            placeholder="Search products..."
            placeholderTextColor={palette.icon}
            className="flex-1 text-foreground"
          />
        </View>

        <TouchableOpacity
          onPress={handleOpenDrawer}
          activeOpacity={0.85}
          className="h-11 px-4 rounded-xl border border-border bg-background flex-row items-center gap-1.5"
        >
          <Ionicons name="options-outline" size={16} color={palette.icon} />
          <Text className="text-foreground text-sm font-semibold">Filters</Text>
          {activeFilterCount > 0 && (
            <View className="min-w-5 h-5 px-1 rounded-full bg-primary items-center justify-center">
              <Text className="text-primary-foreground text-[10px] font-bold">{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={drawerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-background rounded-t-[36px] p-5 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground text-lg font-bold">Filter Products</Text>
              <TouchableOpacity onPress={() => setDrawerVisible(false)} className="w-9 h-9 items-center justify-center">
                <Ionicons name="close" size={20} color={palette.icon} />
              </TouchableOpacity>
            </View>

            <Text className="text-foreground text-sm font-semibold mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
              <View className="flex-row gap-2 mb-4">
                <TouchableOpacity
                  onPress={() => setCategoryDraft(null)}
                  className={`px-3 py-2 rounded-full border ${
                    categoryDraft === null ? 'bg-primary border-primary' : 'bg-background border-border'
                  }`}
                >
                  <Text className={`${categoryDraft === null ? 'text-primary-foreground' : 'text-foreground'} text-xs font-semibold`}>
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => {
                  const selected = categoryDraft === category.orgCategoryId;
                  return (
                    <TouchableOpacity
                      key={category.orgCategoryId}
                      onPress={() => setCategoryDraft(category.orgCategoryId)}
                      className={`px-3 py-2 rounded-full border ${
                        selected ? 'bg-primary border-primary' : 'bg-background border-border'
                      }`}
                    >
                      <Text className={`${selected ? 'text-primary-foreground' : 'text-foreground'} text-xs font-semibold`}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text className="text-foreground text-sm font-semibold mb-2">Price Range</Text>
            <View className="flex-row items-center gap-2 mb-6">
              <View className="flex-1 h-11 rounded-xl border border-border bg-background px-3 justify-center">
                <TextInput
                  keyboardType="numeric"
                  value={minPriceDraft}
                  onChangeText={setMinPriceDraft}
                  placeholder="Min"
                  placeholderTextColor={palette.icon}
                  className="text-foreground"
                />
              </View>
              <Text className="text-muted-foreground">-</Text>
              <View className="flex-1 h-11 rounded-xl border border-border bg-background px-3 justify-center">
                <TextInput
                  keyboardType="numeric"
                  value={maxPriceDraft}
                  onChangeText={setMaxPriceDraft}
                  placeholder="Max"
                  placeholderTextColor={palette.icon}
                  className="text-foreground"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleResetDrawerFilters}
                className="flex-1 h-11 rounded-xl border border-border items-center justify-center"
              >
                <Text className="text-foreground font-semibold text-sm">Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyDrawerFilters}
                className="flex-1 h-11 rounded-xl bg-primary items-center justify-center"
              >
                <Text className="text-primary-foreground font-semibold text-sm">Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function OrganizationProductFiltersSkeleton() {
  return (
    <View className="px-5 mb-6">
      <View className="flex-row items-center gap-2">
        <Skeleton className="flex-1 h-11 rounded-xl" />
        <Skeleton className="h-11 w-24 rounded-xl" />
      </View>
    </View>
  );
}
