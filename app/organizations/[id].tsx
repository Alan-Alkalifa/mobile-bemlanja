import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useMemo } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { OrganizationProductsSection } from '../../components/products/OrganizationProductsSection';
import { Skeleton } from '../../components/ui/Skeleton';
import { useOrganizationDetail } from '../../hooks/useOrganizationDetail';

const HEADER_HEIGHT = 260;

export default function OrganizationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    organization,
    loading,
    error,
    fetchOrganization,
    initials,
    locationLine,
    openExternalUrl,
  } = useOrganizationDetail(id);
  const { colorScheme } = useColorScheme();

  const palette = useMemo(
    () =>
      colorScheme === 'dark'
        ? {
            foreground: '#fafafa',
            background: '#09090b',
            muted: '#27272a',
            border: '#27272a',
            primary: '#fafafa',
            primaryForeground: '#18181b',
            mutedForeground: '#a1a1aa',
            warning: '#f59e0b',
            error: '#f87171',
          }
        : {
            foreground: '#09090b',
            background: '#ffffff',
            muted: '#f4f4f5',
            border: '#e4e4e7',
            primary: '#18181b',
            primaryForeground: '#fafafa',
            mutedForeground: '#71717a',
            warning: '#f59e0b',
            error: '#ef4444',
          },
    [colorScheme]
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <Skeleton className="w-full rounded-none" style={{ height: HEADER_HEIGHT }} />
        <View className="px-5 pt-6 gap-4">
          <View className="flex-row items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <View className="flex-1 gap-2">
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-2/5" />
            </View>
          </View>
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </View>
      </View>
    );
  }

  if (!organization || error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-10">
        <View className="bg-muted p-6 rounded-3xl items-center w-full">
          <Ionicons name="alert-circle" size={48} color={palette.error} />
          <Text className="text-foreground font-bold text-xl mt-4 text-center">Organization not found</Text>
          <Text className="text-muted-foreground text-sm text-center mt-2 mb-6 leading-5">
            {error || "We couldn't load this organization."}
          </Text>
          <TouchableOpacity
            onPress={fetchOrganization}
            className="bg-primary w-full py-4 rounded-2xl items-center"
          >
            <Text className="text-primary-foreground font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-muted-foreground font-medium underline">Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View
        className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-4"
        style={Platform.OS === 'ios' ? { paddingTop: 60 } : {}}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.9}
          className="self-start bg-background/80 w-11 h-11 items-center justify-center rounded-full border border-border"
        >
          <Ionicons name="chevron-back" size={24} color={palette.foreground} />
        </TouchableOpacity>
      </View>

      <OrganizationProductsSection
        orgId={organization.orgId}
        listHeaderComponent={
          <>
        <View className="bg-muted" style={{ height: HEADER_HEIGHT }}>
          {organization.bannerUrl ? (
            <Image
              source={{ uri: organization.bannerUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={400}
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="storefront-outline" size={48} color={palette.mutedForeground} />
            </View>
          )}
        </View>

        <View className="px-5 pb-10">
          <View className="-mt-12 flex-row items-end justify-between">
            <View className="w-24 h-24 rounded-full border-4 border-background bg-muted overflow-hidden items-center justify-center">
              {organization.logoUrl ? (
                <Image
                  source={{ uri: organization.logoUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={250}
                />
              ) : (
                <Text className="text-foreground text-xl font-bold">{initials}</Text>
              )}
            </View>
            {organization.orgEmailVerified && (
              <View className="mb-2 px-3 py-1 rounded-full border border-border bg-background">
                <Text className="text-primary text-xs font-semibold">Official Store</Text>
              </View>
            )}
          </View>

          <View className="mt-4 gap-2">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="text-foreground text-3xl font-extrabold flex-1">{organization.orgName}</Text>
              <View className="flex-row items-center gap-2 pt-1">
                {!!organization.websiteUrl && (
                  <TouchableOpacity
                    onPress={() => openExternalUrl(organization.websiteUrl)}
                    activeOpacity={0.8}
                    className="w-10 h-10 rounded-full border border-border bg-background items-center justify-center"
                  >
                    <Ionicons name="globe-outline" size={18} color={palette.mutedForeground} />
                  </TouchableOpacity>
                )}
                {!!organization.instagramUrl && (
                  <TouchableOpacity
                    onPress={() => openExternalUrl(organization.instagramUrl)}
                    activeOpacity={0.8}
                    className="w-10 h-10 rounded-full border border-border bg-background items-center justify-center"
                  >
                    <Ionicons name="logo-instagram" size={18} color={palette.mutedForeground} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {!!locationLine && (
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="location-outline" size={16} color={palette.mutedForeground} />
                <Text className="text-muted-foreground text-sm">{locationLine}</Text>
              </View>
            )}
          </View>

          <View className="mt-6 border border-border rounded-2xl bg-muted/30 p-4">
            <Text className="text-foreground font-bold text-lg mb-2">About organization</Text>
            <Text className="text-muted-foreground text-base leading-6">{organization.description}</Text>
          </View>
        </View>
          </>
        }
      />
    </View>
  );
}
