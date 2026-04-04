import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  isPassword,
  className,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  return (
    <View className="mb-4 w-full">
      {label && (
        <Text className="text-sm font-medium text-foreground mb-1">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center border rounded-lg bg-background px-3 h-12 ${
          error ? "border-error" : "border-border"
        }`}
      >
        <TextInput
          className={`flex-1 text-base text-foreground h-full ${className || ""}`}
          placeholderTextColor="#a1a1aa" // zinc-400
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            className="ml-2"
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color="#71717a"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="text-xs text-error mt-1">{error}</Text>}
    </View>
  );
}
