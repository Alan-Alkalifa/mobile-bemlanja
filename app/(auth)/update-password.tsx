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

export default function UpdatePasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validatePassword = (pass: string) => {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(pass);
  };

  async function updatePassword() {
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      router.replace({
        pathname: "/(auth)/success",
        params: {
          title: "Password Updated",
          message:
            "Your password has been updated successfully. You can now log in with your new password.",
          actionLabel: "Go to Sign In",
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
            Update Password
          </Text>
          <Text className="text-lg text-muted-foreground">
            Enter your new password below
          </Text>
        </View>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <View className="mb-6">
          <Input
            label="New Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
          />
          <Input
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
          />
        </View>

        <Button
          label="Update Password"
          onPress={updatePassword}
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
