import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CartIconButtonProps {
  count: number;
  iconColor: string;
  onPress: () => void;
}

export function CartIconButton({ count, iconColor, onPress }: CartIconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-14 h-14 bg-muted items-center justify-center rounded-2xl border border-border"
      activeOpacity={0.85}
    >
      <Ionicons name="cart-outline" size={24} color={iconColor} />
      {count > 0 && (
        <View className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary items-center justify-center">
          <Text className="text-primary-foreground text-[10px] font-bold">
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
