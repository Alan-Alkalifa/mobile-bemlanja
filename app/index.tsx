import { Text, View, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthProvider";
import { Redirect } from "expo-router";

export default function App() {
  const { user, isInitialized, signOut } = useAuth();

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#18181b" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-3xl font-bold text-foreground mb-2 text-center">
        Welcome to Default App
      </Text>
      <Text className="text-base text-muted-foreground mb-8 text-center">
        You are logged in as {user.email}
      </Text>
      
      <View className="w-full max-w-sm">
        <Text 
          className="text-primary font-medium text-center p-4 border border-border rounded-lg"
          onPress={signOut}
        >
          Sign Out
        </Text>
      </View>
    </View>
  );
}
