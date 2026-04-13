import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { CartDisplayItem } from '../../hooks/useCartItems';
import { getProductImageUrl } from '../../utils/images';
import { CartItemCard } from './CartItemCard';

interface CartMerchantSectionProps {
  orgId: string;
  orgName: string;
  logoUrl: string | null;
  items: CartDisplayItem[];
  foreground: string;
  mutedForeground: string;
  processingItemId: string | null;
  isSelected: (itemId: string) => boolean;
  onToggleItem: (itemId: string, orgId: string) => void;
  onDecreaseItem: (item: CartDisplayItem) => Promise<boolean>;
  onIncreaseItem: (item: CartDisplayItem) => Promise<boolean>;
  onRemoveItem: (itemId: string) => Promise<boolean>;
}

export function CartMerchantSection({
  orgId,
  orgName,
  logoUrl,
  items,
  foreground,
  mutedForeground,
  processingItemId,
  isSelected,
  onToggleItem,
  onDecreaseItem,
  onIncreaseItem,
  onRemoveItem,
}: CartMerchantSectionProps) {
  return (
    <View className="rounded-2xl border border-border bg-muted/15 p-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-full border border-border bg-background overflow-hidden items-center justify-center">
            {logoUrl ? (
              <Image source={{ uri: getProductImageUrl(logoUrl) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Ionicons name="storefront-outline" size={14} color={mutedForeground} />
            )}
          </View>
          <Text className="text-foreground font-bold text-sm">{orgName}</Text>
        </View>
        <Text className="text-muted-foreground text-xs">{items.length} item(s)</Text>
      </View>

      <View className="gap-2">
        {items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            selected={isSelected(item.id)}
            processing={processingItemId === item.id}
            foreground={foreground}
            mutedForeground={mutedForeground}
            onToggleSelect={() => onToggleItem(item.id, orgId)}
            onDecrease={() => onDecreaseItem(item)}
            onIncrease={() => onIncreaseItem(item)}
            onRemove={() => onRemoveItem(item.id)}
          />
        ))}
      </View>
    </View>
  );
}
