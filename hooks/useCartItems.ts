import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useCart } from '../contexts/CartProvider';
import { supabase } from '../utils/supabase';

interface CartRow {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
}

interface CartProduct {
  productId: string;
  orgId: string;
  name: string;
  price: string;
  image_url: string | null;
}

interface CartVariant {
  variantId: string;
  productId: string;
  name: string;
  price: string;
  stock: number;
}

interface CartOrganization {
  orgId: string;
  orgName: string;
  logoUrl: string | null;
}

export interface CartDisplayItem {
  id: string;
  quantity: number;
  product: CartProduct | null;
  variant: CartVariant | null;
  organization: CartOrganization | null;
  unitPrice: number;
  lineTotal: number;
}

export function useCartItems() {
  const { user } = useAuth();
  const { refreshCartCount } = useCart();
  const [items, setItems] = useState<CartDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingItemId, setProcessingItemId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: cartRows, error: cartError } = await supabase
        .from('cart_items')
        .select('id, productId, variantId, quantity')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });

      if (cartError) throw cartError;

      const rows = (cartRows ?? []) as CartRow[];
      if (rows.length === 0) {
        setItems([]);
        return;
      }

      const productIds = [...new Set(rows.map((row) => row.productId).filter(Boolean))];
      const variantIds = [...new Set(rows.map((row) => row.variantId).filter(Boolean))] as string[];

      const [{ data: products, error: productsError }, { data: variants, error: variantsError }] =
        await Promise.all([
          supabase.from('products').select('productId, orgId, name, price, image_url').in('productId', productIds),
          variantIds.length > 0
            ? supabase.from('product_variants').select('variantId, productId, name, price, stock').in('variantId', variantIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

      if (productsError) throw productsError;
      if (variantsError) throw variantsError;

      const orgIds = [...new Set((products ?? []).map((product: any) => product.orgId).filter(Boolean))];
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('orgId, orgName, logoUrl')
        .in('orgId', orgIds);
      if (orgError) throw orgError;

      const productMap = new Map<string, CartProduct>((products ?? []).map((item: any) => [item.productId, item]));
      const variantMap = new Map<string, CartVariant>((variants ?? []).map((item: any) => [item.variantId, item]));
      const orgMap = new Map<string, CartOrganization>(
        (orgs ?? []).map((item: any) => [
          item.orgId,
          {
            orgId: item.orgId,
            orgName: item.orgName || 'Unknown Merchant',
            logoUrl: item.logoUrl || null,
          },
        ])
      );

      const nextItems = rows.map((row) => {
        const product = productMap.get(row.productId) ?? null;
        const variant = row.variantId ? (variantMap.get(row.variantId) ?? null) : null;
        const organization = product?.orgId ? orgMap.get(product.orgId) ?? null : null;
        const unitPrice = Number(variant?.price ?? product?.price ?? 0);
        const quantity = Number(row.quantity || 0);

        return {
          id: row.id,
          quantity,
          product,
          variant,
          organization,
          unitPrice,
          lineTotal: unitPrice * quantity,
        };
      });

      setItems(nextItems);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateQuantity = useCallback(
    async (item: CartDisplayItem, nextQuantity: number) => {
      if (nextQuantity <= 0) {
        return false;
      }

      if (typeof item.variant?.stock === 'number' && nextQuantity > item.variant.stock) {
        return false;
      }

      setProcessingItemId(item.id);
      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity: nextQuantity,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', item.id);
      setProcessingItemId(null);

      if (error) return false;
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? {
                ...row,
                quantity: nextQuantity,
                lineTotal: row.unitPrice * nextQuantity,
              }
            : row
        )
      );
      await refreshCartCount();
      return true;
    },
    [refreshCartCount]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      setProcessingItemId(itemId);
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      setProcessingItemId(null);
      if (error) return false;
      setItems((prev) => prev.filter((row) => row.id !== itemId));
      await refreshCartCount();
      return true;
    },
    [refreshCartCount]
  );

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.lineTotal, 0), [items]);

  return {
    items,
    loading,
    processingItemId,
    subtotal,
    fetchItems,
    updateQuantity,
    removeItem,
  };
}
