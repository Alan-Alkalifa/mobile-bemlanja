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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithEmail() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      // AuthProvider will automatically redirect thanks to onAuthStateChange mapping in _layout/index
      router.replace("/");
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
            Welcome Back
          </Text>
          <Text className="text-lg text-muted-foreground">
            Sign in to continue
          </Text>
        </View>

        {error && <Alert type="error" message={error} />}

        <View className="mb-6">
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
          />

          <View className="items-end mb-4 -mt-2">
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-medium text-foreground">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <Button label="Sign In" onPress={signInWithEmail} isLoading={loading} />

        <View className="flex-row justify-center mt-8">
          <Text className="text-base text-muted-foreground">
            Don't have an account?{" "}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-base font-bold text-foreground underline">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
