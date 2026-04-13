import React, { createContext, useContext, useMemo, useState } from 'react';

interface CartSelectionContextType {
  selectedItemIds: string[];
  selectedOrgId: string | null;
  isSelected: (itemId: string) => boolean;
  toggleItemSelection: (itemId: string, orgId: string) => { ok: boolean; message?: string };
  clearSelection: () => void;
  reconcileSelection: (items: { id: string; orgId: string }[]) => void;
}

const CartSelectionContext = createContext<CartSelectionContextType>({
  selectedItemIds: [],
  selectedOrgId: null,
  isSelected: () => false,
  toggleItemSelection: () => ({ ok: false, message: 'Selection context not ready.' }),
  clearSelection: () => {},
  reconcileSelection: () => {},
});

export function CartSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const isSelected = (itemId: string) => selectedItemIds.includes(itemId);

  const toggleItemSelection = (itemId: string, orgId: string) => {
    const alreadySelected = selectedItemIds.includes(itemId);

    if (!alreadySelected && selectedOrgId && selectedOrgId !== orgId) {
      return {
        ok: false,
        message: 'Checkout can only include items from one merchant. Unselect other merchant items first.',
      };
    }

    if (alreadySelected) {
      const next = selectedItemIds.filter((id) => id !== itemId);
      setSelectedItemIds(next);
      if (next.length === 0) {
        setSelectedOrgId(null);
      }
      return { ok: true };
    }

    const next = [...selectedItemIds, itemId];
    setSelectedItemIds(next);
    setSelectedOrgId(orgId);
    return { ok: true };
  };

  const clearSelection = () => {
    setSelectedItemIds([]);
    setSelectedOrgId(null);
  };

  const reconcileSelection = (items: { id: string; orgId: string }[]) => {
    const validIdSet = new Set(items.map((item) => item.id));
    const nextSelected = selectedItemIds.filter((id) => validIdSet.has(id));

    if (nextSelected.length !== selectedItemIds.length) {
      setSelectedItemIds(nextSelected);
    }

    if (nextSelected.length === 0) {
      if (selectedOrgId !== null) {
        setSelectedOrgId(null);
      }
      return;
    }

    const orgById = new Map(items.map((item) => [item.id, item.orgId]));
    const firstOrg = orgById.get(nextSelected[0]) ?? null;
    const allSameOrg = nextSelected.every((id) => orgById.get(id) === firstOrg);

    if (!allSameOrg || !firstOrg) {
      setSelectedItemIds([]);
      setSelectedOrgId(null);
      return;
    }

    if (selectedOrgId !== firstOrg) {
      setSelectedOrgId(firstOrg);
    }
  };

  const value = useMemo(
    () => ({
      selectedItemIds,
      selectedOrgId,
      isSelected,
      toggleItemSelection,
      clearSelection,
      reconcileSelection,
    }),
    [selectedItemIds, selectedOrgId]
  );

  return <CartSelectionContext.Provider value={value}>{children}</CartSelectionContext.Provider>;
}

export const useCartSelection = () => useContext(CartSelectionContext);
