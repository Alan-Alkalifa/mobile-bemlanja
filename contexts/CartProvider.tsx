import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../utils/supabase';

interface AddToCartInput {
  productId: string;
  variantId: string | null;
  quantity: number;
  maxStock?: number | null;
  productName: string;
}

interface AddToCartResult {
  ok: boolean;
  message: string;
}

interface CartContextType {
  cartCount: number;
  isAddingToCart: boolean;
  refreshCartCount: () => Promise<void>;
  addToCart: (input: AddToCartInput) => Promise<AddToCartResult>;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  isAddingToCart: false,
  refreshCartCount: async () => {},
  addToCart: async () => ({ ok: false, message: 'Cart context not ready.' }),
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const refreshCartCount = useCallback(async () => {
    if (!user?.id) {
      setCartCount(0);
      return;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('userId', user.id);
    if (error) return;

    const total = (data ?? []).reduce((sum, row) => sum + Number(row.quantity || 0), 0);
    setCartCount(total);
  }, [user?.id]);

  const addToCart = useCallback(
    async ({ productId, variantId, quantity, maxStock, productName }: AddToCartInput) => {
      if (!user?.id) {
        return { ok: false, message: 'Please login first to add items to cart.' };
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return { ok: false, message: 'Please enter a valid quantity.' };
      }

      try {
        setIsAddingToCart(true);
        let existingQuery = supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('userId', user.id)
          .eq('productId', productId);

        existingQuery = variantId
          ? existingQuery.eq('variantId', variantId)
          : existingQuery.is('variantId', null);

        const { data: existingItem, error: existingError } = await existingQuery.maybeSingle();
        if (existingError) throw existingError;
        const existingQuantity = Number(existingItem?.quantity ?? 0);

        if (typeof maxStock === 'number') {
          if (existingQuantity >= maxStock) {
            return { ok: false, message: 'This variant has reached its stock limit in your cart.' };
          }

          if (existingQuantity + quantity > maxStock) {
            const remaining = maxStock - existingQuantity;
            return { ok: false, message: `Only ${remaining} item(s) available to add for this variant.` };
          }
        }

        if (existingItem) {
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({
              quantity: existingQuantity + quantity,
              updatedAt: new Date().toISOString(),
            })
            .eq('id', existingItem.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              userId: user.id,
              productId,
              variantId,
              quantity,
            });
          if (insertError) throw insertError;
        }

        await refreshCartCount();
        return { ok: true, message: `${productName} has been added to your cart.` };
      } catch (err: any) {
        return { ok: false, message: err?.message || 'Please try again.' };
      } finally {
        setIsAddingToCart(false);
      }
    },
    [refreshCartCount, user?.id]
  );

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, isAddingToCart, refreshCartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
