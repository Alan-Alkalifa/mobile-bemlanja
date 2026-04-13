import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CartCheckoutBarProps {
  selectedCount: number;
  selectedSubtotal: number;
  onClearSelection: () => void;
  onCheckout: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

export function CartCheckoutBar({
  selectedCount,
  selectedSubtotal,
  onClearSelection,
  onCheckout,
}: CartCheckoutBarProps) {
  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-5 pt-4 pb-8"
      style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-muted-foreground text-sm">Selected Items</Text>
        <TouchableOpacity onPress={onClearSelection} activeOpacity={0.85}>
          <Text className="text-muted-foreground text-xs font-semibold">Clear Selection</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-muted-foreground text-sm">{selectedCount} item(s) selected</Text>
        <Text className="text-foreground text-xl font-black">{formatCurrency(selectedSubtotal)}</Text>
      </View>
      <TouchableOpacity
        onPress={onCheckout}
        activeOpacity={0.9}
        className="h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: selectedCount > 0 ? '#18181b' : '#a1a1aa' }}
        disabled={selectedCount === 0}
      >
        <Text className="text-primary-foreground font-bold tracking-wide">Proceed to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}
