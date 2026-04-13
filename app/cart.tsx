import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { CartCheckoutBar } from '../components/cart/CartCheckoutBar';
import { CartMerchantSection } from '../components/cart/CartMerchantSection';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthProvider';
import { useCartSelection } from '../contexts/CartSelectionProvider';
import { CartDisplayItem, useCartItems } from '../hooks/useCartItems';

export default function CartScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();
  const { items, loading, processingItemId, fetchItems, updateQuantity, removeItem } = useCartItems();
  const { selectedItemIds, isSelected, toggleItemSelection, clearSelection, reconcileSelection } = useCartSelection();

  const palette =
    colorScheme === 'dark'
      ? { foreground: '#fafafa', mutedForeground: '#a1a1aa' }
      : { foreground: '#09090b', mutedForeground: '#71717a' };
  const horizontalPadding = Math.min(20, Math.max(12, Math.round(width * 0.045)));

  useEffect(() => {
    const selectable = items
      .filter((item) => item.organization?.orgId)
      .map((item) => ({ id: item.id, orgId: item.organization?.orgId as string }));
    reconcileSelection(selectable);
  }, [items, reconcileSelection]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, { orgId: string; orgName: string; logoUrl: string | null; items: typeof items }>();
    items.forEach((item) => {
      const orgId = item.organization?.orgId || 'unknown-org';
      const orgName = item.organization?.orgName || 'Unknown Merchant';
      const logoUrl = item.organization?.logoUrl || null;
      const current = map.get(orgId);
      if (current) {
        current.items.push(item);
      } else {
        map.set(orgId, { orgId, orgName, logoUrl, items: [item] });
      }
    });
    return Array.from(map.values());
  }, [items]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemIds.includes(item.id)),
    [items, selectedItemIds]
  );
  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [selectedItems]
  );

  const handleToggleSelection = (itemId: string, orgId: string) => {
    const result = toggleItemSelection(itemId, orgId);
    if (!result.ok && result.message) {
      Alert.alert('Selection limit', result.message);
    }
  };

  const handleDecreaseItem = async (item: CartDisplayItem) => {
    if (item.quantity - 1 <= 0) {
      return removeItem(item.id);
    }
    return updateQuantity(item, item.quantity - 1);
  };

  const handleIncreaseItem = async (item: CartDisplayItem) => updateQuantity(item, item.quantity + 1);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Select items', 'Please select at least one item to checkout.');
      return;
    }
    const merchantName = selectedItems[0]?.organization?.orgName || 'merchant';
    Alert.alert(
      'Checkout',
      `${selectedItems.length} item(s) from ${merchantName} selected. Checkout flow is coming soon.`
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-5 pt-14 pb-4 border-b border-border flex-row items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </View>
        <View className="px-5 pt-5 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={`cart-skeleton-${index}`} className="rounded-2xl border border-border bg-muted/30 p-3">
              <View className="flex-row gap-3">
                <Skeleton className="w-20 h-20 rounded-xl" />
                <View className="flex-1 gap-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <View className="flex-row gap-2 mt-1">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-12 h-8 rounded-lg" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-14 pb-4 border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.85}
            className="w-10 h-10 rounded-full border border-border bg-background items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color={palette.foreground} />
          </TouchableOpacity>
          <Text className="text-foreground text-2xl font-extrabold">My Cart</Text>
        </View>
        <TouchableOpacity
          onPress={fetchItems}
          className="w-10 h-10 rounded-full border border-border bg-background items-center justify-center"
          activeOpacity={0.85}
        >
          <Ionicons name="refresh-outline" size={18} color={palette.mutedForeground} />
        </TouchableOpacity>
      </View>

      {!user?.id ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-full rounded-2xl border border-border bg-muted/30 p-5">
            <Text className="text-foreground text-lg font-bold">Login required</Text>
            <Text className="text-muted-foreground mt-2">Please login to manage your cart and continue checkout.</Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              className="mt-5 h-11 rounded-xl bg-primary items-center justify-center"
              activeOpacity={0.85}
            >
              <Text className="text-primary-foreground font-semibold">Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-full rounded-2xl border border-border bg-muted/30 p-6 items-center">
            <Ionicons name="cart-outline" size={40} color={palette.mutedForeground} />
            <Text className="text-foreground text-lg font-bold mt-3">Your cart is empty</Text>
            <Text className="text-muted-foreground text-center mt-1">Add products first to continue checkout.</Text>
            <TouchableOpacity
              onPress={() => router.push('/')}
              className="mt-5 h-11 px-5 rounded-xl bg-primary items-center justify-center"
              activeOpacity={0.85}
            >
              <Text className="text-primary-foreground font-semibold">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingTop: 16, paddingBottom: 150 }}
          >
            <View className="gap-3">
              {groupedItems.map((group) => (
                <CartMerchantSection
                  key={group.orgId}
                  orgId={group.orgId}
                  orgName={group.orgName}
                  logoUrl={group.logoUrl}
                  items={group.items}
                  foreground={palette.foreground}
                  mutedForeground={palette.mutedForeground}
                  processingItemId={processingItemId}
                  isSelected={isSelected}
                  onToggleItem={handleToggleSelection}
                  onDecreaseItem={handleDecreaseItem}
                  onIncreaseItem={handleIncreaseItem}
                  onRemoveItem={removeItem}
                />
              ))}
            </View>
          </ScrollView>

          <CartCheckoutBar
            selectedCount={selectedItems.length}
            selectedSubtotal={selectedSubtotal}
            onClearSelection={clearSelection}
            onCheckout={handleCheckout}
          />
        </>
      )}
    </View>
  );
}
