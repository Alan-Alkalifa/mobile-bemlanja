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

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validatePassword = (pass: string) => {
    // Requires at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(pass);
  };

  async function signUpWithEmail() {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
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

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setLoading(false);
      router.replace({
        pathname: "/(auth)/success",
        params: {
          title: "Account Created",
          message:
            "Registration successful! Please check your email to verify your account.",
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
            Create Account
          </Text>
          <Text className="text-lg text-muted-foreground">
            Sign up to get started
          </Text>
        </View>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <View className="mb-6">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
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
        </View>

        <Button label="Sign Up" onPress={signUpWithEmail} isLoading={loading} />

        <View className="flex-row justify-center mt-8">
          <Text className="text-base text-muted-foreground">
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-base font-bold text-foreground underline">
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
