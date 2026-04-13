import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { ProductVariant } from '../../types/product';

interface ProductVariantSelectorDrawerProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(price));

export function ProductVariantSelectorDrawer({
  variants,
  selectedVariant,
  onSelectVariant,
}: ProductVariantSelectorDrawerProps) {
  const [visible, setVisible] = useState(false);
  const { colorScheme } = useColorScheme();
  const mutedForeground = colorScheme === 'dark' ? '#a1a1aa' : '#71717a';

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="h-11 rounded-xl border border-border bg-background items-center justify-center"
        activeOpacity={0.85}
      >
        <Text className="text-foreground font-semibold text-sm">
          {selectedVariant ? 'Change Variant' : 'Choose Variant'}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-background border-t border-border p-5 pb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground font-bold text-lg">Select Variant</Text>
              <TouchableOpacity onPress={() => setVisible(false)} className="w-9 h-9 items-center justify-center">
                <Ionicons name="close" size={20} color={mutedForeground} />
              </TouchableOpacity>
            </View>

            <View className="gap-2">
              {variants.map((variant) => {
                const selected = selectedVariant?.variantId === variant.variantId;
                const outOfStock = variant.stock === 0;

                return (
                  <TouchableOpacity
                    key={variant.variantId}
                    onPress={() => {
                      if (outOfStock) return;
                      onSelectVariant(variant);
                      setVisible(false);
                    }}
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
                    <Text className="text-primary text-sm font-bold mt-1">{formatPrice(variant.price)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
