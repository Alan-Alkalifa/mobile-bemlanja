import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductList } from '../components/products/ProductList';
import { useAuth } from '../contexts/AuthProvider';

export default function App() {
  const { user, isInitialized, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const spinnerColor = colorScheme === 'dark' ? '#fafafa' : '#18181b';
  const headerBg = colorScheme === 'dark' ? '#09090b' : '#ffffff';

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={spinnerColor} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href='/(auth)/login' />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: headerBg }}>
      <View
        className="px-4 py-3 border-b border-border flex-row justify-between items-center"
        style={{ backgroundColor: headerBg }}
      >
        <View>
          <Text className="text-xl font-bold text-foreground tracking-tight">Home</Text>
          <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
        <TouchableOpacity
          onPress={signOut}
          activeOpacity={0.7}
          className="bg-muted px-4 py-2 rounded-xl"
        >
          <Text className="text-foreground text-sm font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ProductList />
    </SafeAreaView>
  );
}
