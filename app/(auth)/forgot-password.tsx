import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { supabase } from "../../utils/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function requestPasswordReset() {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    // Dynamically generates exp:// URL for Expo Go or custom scheme for standalone apps
    const redirectUrl = Linking.createURL("/update-password");
    console.log("Supabase magic link redirecting to:", redirectUrl);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      router.replace({
        pathname: "/(auth)/success",
        params: {
          title: "Email Sent",
          message:
            "If an account matches that email, a password reset link has been sent to your inbox.",
          actionLabel: "Return to Sign In",
          actionRoute: "/(auth)/login",
        },
      });
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerClassName="flex-1 justify-center p-6">
        <View className="mb-8">
          <Text className="text-4xl font-bold text-foreground mb-2">
            Reset Password
          </Text>
          <Text className="text-lg text-muted-foreground">
            We'll send you instructions to reset your password
          </Text>
        </View>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <View className="mb-6">
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Button
          label="Send Reset Link"
          onPress={requestPasswordReset}
          isLoading={loading}
        />

        <View className="flex-row justify-center mt-8">
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-base font-bold text-foreground underline">
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
