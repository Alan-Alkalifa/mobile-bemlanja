import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthProvider";
import { CartProvider } from "../contexts/CartProvider";
import { CartSelectionProvider } from "../contexts/CartSelectionProvider";
import "../globals.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <CartSelectionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </CartSelectionProvider>
      </CartProvider>
    </AuthProvider>
  );
}
