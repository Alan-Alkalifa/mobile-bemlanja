import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ProductReview } from '../../types/product';
import { getProductImageUrl } from '../../utils/images';

interface ProductReviewCardProps {
  review: ProductReview;
  warningColor: string;
}

export function ProductReviewCard({ review, warningColor }: ProductReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const reviewImages = review.product_review_images ?? [];
  const reviewerName = review.reviewer_name || 'Satisfied Customer';
  const reviewerInitial = reviewerName.trim().charAt(0).toUpperCase() || 'U';

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
              <Text className="text-foreground font-semibold text-xs">{reviewerInitial}</Text>
            )}
          </View>
          <View className="gap-1 flex-1">
            <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
              {reviewerName}
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
              <Image
                key={image.imageId}
                source={{ uri: getProductImageUrl(image.url) }}
                style={{ width: 72, height: 72, borderRadius: 12 }}
                contentFit="cover"
                transition={200}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
