import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Skeleton } from '../ui/Skeleton';

interface ProductOrgCardProps {
  orgName: string;
  orgSubtitle?: string | null;
  orgLocation?: string | null;
  isOfficial?: boolean;
  initials: string;
  logoUrl?: string | null;
  iconColor: string;
  totalProducts?: number | null;
  avgRating?: number | null;
  onVisitOrg: () => void;
}

export function ProductOrgCard({
  orgName,
  orgSubtitle,
  orgLocation,
  isOfficial,
  initials,
  logoUrl,
  iconColor,
  totalProducts,
  avgRating,
  onVisitOrg,
}: ProductOrgCardProps) {
  return (
    <View className="border border-border rounded-2xl bg-muted/30 p-4">
      <View className="flex-row items-start gap-3">
        <View className="w-12 h-12 rounded-full border border-border bg-background items-center justify-center overflow-hidden">
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <Text className="text-foreground font-semibold">{initials}</Text>
          )}
        </View>

        <View className="flex-1 gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-foreground text-lg font-extrabold flex-1 pr-2" numberOfLines={1}>
              {orgName}
            </Text>
            {isOfficial && (
              <View className="px-2 py-0.5 rounded-full border border-border bg-background">
                <Text className="text-primary text-[10px] font-semibold">Official Store</Text>
              </View>
            )}
          </View>

          {/* <Text className="text-muted-foreground text-sm" numberOfLines={1}>
            {orgSubtitle || 'Trusted partner store'}
          </Text> */}

          {orgLocation ? (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="location-outline" size={14} color={iconColor} />
              <Text className="text-muted-foreground text-sm" numberOfLines={1}>
                {orgLocation}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="cube-outline" size={14} color={iconColor} />
              <Text className="text-muted-foreground text-sm">
                {typeof totalProducts === 'number' ? `${totalProducts} products` : '- products'}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text className="text-muted-foreground text-sm">
                {typeof avgRating === 'number' ? avgRating.toFixed(1) : '-'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-4">
        <TouchableOpacity
          onPress={onVisitOrg}
          className="h-11 rounded-xl bg-primary items-center justify-center"
          activeOpacity={0.8}
        >
          <Text className="text-primary-foreground text-sm font-semibold">Visit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ProductOrgCardSkeleton() {
  return (
    <View className="border border-border rounded-2xl bg-muted/30 p-4">
      <View className="flex-row items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <View className="flex-row gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-14" />
          </View>
        </View>
      </View>
      <Skeleton className="h-11 w-full rounded-xl mt-4" />
    </View>
  );
}
