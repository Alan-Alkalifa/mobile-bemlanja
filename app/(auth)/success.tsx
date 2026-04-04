import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { Button } from "../../components/ui/Button";

export default function SuccessScreen() {
  const router = useRouter();
  const {
    title = "Success!",
    message = "Your action was completed successfully.",
    actionLabel = "Back to Sign In",
    actionRoute = "/(auth)/login",
  } = useLocalSearchParams<{
    title?: string;
    message?: string;
    actionLabel?: string;
    actionRoute?: string;
  }>();

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center p-6">
        <View className="w-20 h-20 bg-green-100 dark:bg-green-950 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark" size={40} color="#4ade80" />
        </View>

        <Text className="text-3xl font-bold text-foreground mb-4 text-center">
          {title}
        </Text>

        <Text className="text-base text-muted-foreground text-center mb-8 px-4">
          {message}
        </Text>

        <View className="w-full max-w-sm mt-4">
          <Button
            label={actionLabel}
            onPress={() => router.replace(actionRoute as any)}
          />
        </View>
      </View>
    </View>
  );
}
