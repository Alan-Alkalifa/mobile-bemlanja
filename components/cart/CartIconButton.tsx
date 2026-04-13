import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Skeleton } from '../ui/Skeleton';

interface CartIconButtonProps {
  count: number;
  iconColor: string;
  onPress: () => void;
  isLoading?: boolean;
}

export function CartIconButton({ count, iconColor, onPress, isLoading = false }: CartIconButtonProps) {
  if (isLoading) {
    return <Skeleton className="w-14 h-14 rounded-2xl" />;
  }

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
