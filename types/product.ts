export interface Product {
  productId: string;
  orgId: string;
  name: string;
  description: string;
  price: string;
  image_url: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ProductImage {
  imageId: string;
  productId: string;
  url: string;
  sort_order: number;
  createdAt: string;
}

export interface ProductVariant {
  variantId: string;
  productId: string;
  name: string;
  price: string;
  stock: number;
  weight_grams: number;
  createdAt: string;
}

export interface ProductReview {
  reviewId: string;
  productId: string;
  userId: string;
  rating: number;
  body: string;
  createdAt: string;
  product_review_images?: ProductReviewImage[];
  reviewer_name?: string;
  reviewer_avatar_url?: string | null;
}

export interface ProductReviewImage {
  imageId: string;
  reviewId: string;
  url: string;
  createdAt: string;
}

export interface OrganizationCoupon {
  couponId: string;
  orgId: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: string;
  min_purchase: string;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export interface ProductDetail extends Product {
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  product_reviews: ProductReview[];
}
