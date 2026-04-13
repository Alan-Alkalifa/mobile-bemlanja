import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProductOrgCardProps {
  orgName: string;
  orgSubtitle?: string | null;
  orgLocation?: string | null;
  isOfficial?: boolean;
  initials: string;
  logoUrl?: string | null;
  iconColor: string;
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
