import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ProductReview } from '../../types/product';
import { getProductImageUrl } from '../../utils/images';
import { Skeleton } from '../ui/Skeleton';

interface ProductReviewCardProps {
  review: ProductReview;
  warningColor: string;
}

export function ProductReviewCard({ review, warningColor }: ProductReviewCardProps) {
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);
  const date = new Date(review.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const reviewImages = review.product_review_images ?? [];
  const reviewerName = review.reviewer_name || 'Satisfied Customer';
  const maskedReviewerName = reviewerName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const normalized = word.toLowerCase();
      if (normalized.length <= 1) return normalized;
      if (normalized.length === 2) return `${normalized[0]}*`;
      return `${normalized[0]}${'*'.repeat(normalized.length - 2)}${normalized[normalized.length - 1]}`;
    })
    .join(' ');
  const avatarInitial = reviewerName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <View className="bg-muted/40 border border-border/50 rounded-2xl p-5 gap-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          <View className="w-9 h-9 rounded-full overflow-hidden items-center justify-center bg-background border border-border">
            {review.reviewer_avatar_url ? (
              <Image
                source={{ uri: getProductImageUrl(review.reviewer_avatar_url) }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Text className="text-foreground font-semibold text-xs">{avatarInitial}</Text>
            )}
          </View>
          <View className="gap-1 flex-1">
            <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
              {maskedReviewerName}
            </Text>
            <View className="flex-row gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= review.rating ? 'star' : 'star-outline'}
                  size={12}
                  color={warningColor}
                />
              ))}
            </View>
          </View>
        </View>
        <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{date}</Text>
      </View>
      <View>
        <Text className="text-muted-foreground text-sm leading-6">
          {review.body || 'This product exceeded my expectations! The quality is amazing and it feels very premium.'}
        </Text>
      </View>
      {reviewImages.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {reviewImages.map((image) => (
              <TouchableOpacity
                key={image.imageId}
                activeOpacity={0.85}
                onPress={() => setPreviewImageUrl(getProductImageUrl(image.url))}
              >
                <Image
                  source={{ uri: getProductImageUrl(image.url) }}
                  style={{ width: 72, height: 72, borderRadius: 12 }}
                  contentFit="cover"
                  transition={200}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={Boolean(previewImageUrl)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View className="flex-1 bg-black/90">
          <Pressable className="flex-1 items-center justify-center px-5" onPress={() => setPreviewImageUrl(null)}>
            {previewImageUrl ? (
              <Image
                source={{ uri: previewImageUrl }}
                style={{ width: '100%', height: '70%' }}
                contentFit="contain"
                transition={200}
              />
            ) : null}
          </Pressable>
          {/* <TouchableOpacity
            className="absolute top-14 right-5 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            onPress={() => setPreviewImageUrl(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={22} color="#ffffff" />
          </TouchableOpacity> */}
        </View>
      </Modal>
    </View>
  );
}

export function ProductReviewCardSkeleton() {
  return (
    <View className="bg-muted/40 border border-border/50 rounded-2xl p-5 gap-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <Skeleton className="w-9 h-9 rounded-full" />
          <View className="flex-1 gap-1.5">
            <Skeleton className="h-4 w-28" />
            <View className="flex-row gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={`review-star-skeleton-${idx}`} className="h-3 w-3 rounded-full" />
              ))}
            </View>
          </View>
        </View>
        <Skeleton className="h-3 w-16" />
      </View>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-4/5" />
      <View className="flex-row gap-2">
        <Skeleton className="w-[72px] h-[72px] rounded-xl" />
        <Skeleton className="w-[72px] h-[72px] rounded-xl" />
      </View>
    </View>
  );
}
