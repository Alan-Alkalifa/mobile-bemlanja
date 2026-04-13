import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Alert, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { CartDisplayItem } from '../../hooks/useCartItems';
import { getProductImageUrl } from '../../utils/images';

interface CartItemCardProps {
  item: CartDisplayItem;
  selected: boolean;
  processing: boolean;
  foreground: string;
  mutedForeground: string;
  onToggleSelect: () => void;
  onDecrease: () => Promise<boolean>;
  onIncrease: () => Promise<boolean>;
  onRemove: () => Promise<boolean>;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

export function CartItemCard({
  item,
  selected,
  processing,
  foreground,
  mutedForeground,
  onToggleSelect,
  onDecrease,
  onIncrease,
  onRemove,
}: CartItemCardProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const imageSize = isCompact ? 76 : 92;
  const maxStock = item.variant?.stock;
  const disableIncrease = typeof maxStock === 'number' ? item.quantity >= maxStock : false;
  const outOfStock = typeof maxStock === 'number' && maxStock <= 0;
  const productName = item.product?.name || 'Unknown Product';
  const confirmRemoveItem = () => {
    Alert.alert('Remove item', `Remove ${productName} from your cart?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const ok = await onRemove();
          if (!ok) Alert.alert('Remove failed', 'Unable to remove item.');
        },
      },
    ]);
  };

  return (
    <View
      className="bg-transparent px-1 py-3 border-b border-border"
    >
      <View className="flex-row gap-3">
        <TouchableOpacity onPress={onToggleSelect} className="pt-1" activeOpacity={0.85}>
          <Ionicons
            name={selected ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={selected ? foreground : mutedForeground}
          />
        </TouchableOpacity>

        <Image
          source={{ uri: getProductImageUrl(item.product?.image_url || '') }}
          style={{ width: imageSize, height: imageSize, borderRadius: 16 }}
          contentFit="cover"
          transition={200}
        />
        <View className="flex-1 min-w-0">
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className={`text-foreground font-bold ${isCompact ? 'text-[15px] leading-5' : 'text-[17px] leading-6'} flex-1`}
              numberOfLines={1}
            >
              {productName}
            </Text>
            <TouchableOpacity
              onPress={confirmRemoveItem}
              activeOpacity={0.85}
              className="w-8 h-8 rounded-full bg-muted/50 items-center justify-center"
            >
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
            <View className="px-2.5 py-1 rounded-full border border-border bg-background">
              <Text className="text-muted-foreground text-xs font-medium">
                {item.variant?.name || 'Default'}
              </Text>
            </View>
            {outOfStock ? (
              <View className="px-2.5 py-1 rounded-full border border-red-300 bg-red-50/40">
                <Text className="text-red-500 text-xs font-medium">Out of stock</Text>
              </View>
            ) : typeof maxStock === 'number' ? (
              <View className="px-2.5 py-1 rounded-full border border-border bg-background">
                <Text className="text-muted-foreground text-xs font-medium">Stock {maxStock}</Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row items-center justify-between mt-3 gap-2 flex-wrap">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={async () => {
                  const ok = await onDecrease();
                  if (!ok) Alert.alert('Update failed', 'Unable to update quantity.');
                }}
                className="w-8 h-8 rounded-full border border-border items-center justify-center bg-background"
                activeOpacity={0.85}
                disabled={processing}
              >
                <Ionicons name="remove" size={14} color={foreground} />
              </TouchableOpacity>
              <View className="min-w-8 h-8 items-center justify-center px-1">
                <Text className="text-foreground font-bold text-base">{item.quantity}</Text>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  const ok = await onIncrease();
                  if (!ok) {
                    Alert.alert(
                      'Stock limit',
                      `Only ${item.variant?.stock ?? 'available'} item(s) can be added for this variant.`
                    );
                  }
                }}
                className="w-8 h-8 rounded-full items-center justify-center bg-muted/40"
                activeOpacity={0.85}
                disabled={disableIncrease || processing}
              >
                <Ionicons
                  name="add"
                  size={14}
                  color={disableIncrease ? mutedForeground : foreground}
                />
              </TouchableOpacity>
            </View>
            <Text className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'} ${isCompact ? 'w-full' : ''}`}>
              Total <Text className="text-foreground font-bold">{formatCurrency(item.lineTotal)}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
