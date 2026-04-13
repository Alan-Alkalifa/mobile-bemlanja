import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { OrganizationCoupon } from '../../types/product';
import { Skeleton } from '../ui/Skeleton';

interface OrganizationCouponsSectionProps {
  coupons: OrganizationCoupon[];
}

const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(value));

const formatExpiryDate = (value: string | null) => {
  if (!value) return 'No expiry date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No expiry date';
  return `Valid until ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)}`;
};

const formatDiscount = (coupon: OrganizationCoupon) => {
  if (coupon.discount_type === 'percentage') {
    return `${Number(coupon.discount_value)}% off`;
  }
  return `${formatCurrency(coupon.discount_value)} off`;
};

export function OrganizationCouponsSection({ coupons }: OrganizationCouponsSectionProps) {
  if (coupons.length === 0) return null;

  return (
    <View className="gap-3">
      <Text className="text-foreground font-bold text-lg">Available Coupons</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
      >
        <View className="flex-row gap-3">
          {coupons.map((coupon) => (
            <View
              key={coupon.couponId}
              className="border border-border rounded-2xl bg-muted/30 p-4 gap-1.5 w-72"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-foreground text-base font-extrabold">{coupon.code}</Text>
                <Text className="text-primary text-sm font-bold">{formatDiscount(coupon)}</Text>
              </View>
              <Text className="text-muted-foreground text-sm">
                Minimum purchase {formatCurrency(coupon.min_purchase)}
              </Text>
              <Text className="text-muted-foreground text-sm">{formatExpiryDate(coupon.expires_at)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function OrganizationCouponsSectionSkeleton() {
  return (
    <View className="gap-3">
      <Skeleton className="h-5 w-40" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <View
              key={`coupon-skeleton-${index}`}
              className="border border-border rounded-2xl bg-muted/30 p-4 gap-2 w-72"
            >
              <View className="flex-row items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </View>
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-3/4" />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
