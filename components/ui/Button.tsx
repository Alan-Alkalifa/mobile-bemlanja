import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
}

export function Button({
  label,
  variant = "primary",
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    "flex-row items-center justify-center rounded-lg py-3 px-4";

  let variantStyles = "";
  let textStyles = "text-base font-medium";

  switch (variant) {
    case "primary":
      variantStyles = "bg-primary";
      textStyles += " text-primary-foreground";
      break;
    case "secondary":
      variantStyles = "bg-muted";
      textStyles += " text-foreground";
      break;
    case "outline":
      variantStyles = "border border-border bg-transparent";
      textStyles += " text-foreground";
      break;
    case "ghost":
      variantStyles = "bg-transparent";
      textStyles += " text-foreground";
      break;
  }

  const disabledStyles = disabled || isLoading ? "opacity-70" : "";
  const spinnerColor = variant === "primary" ? "white" : "black";

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles} ${disabledStyles} ${className || ""}`}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <View className="flex-row items-center justify-center gap-2">
          <ActivityIndicator color={spinnerColor} size="small" />
          <Text className={textStyles}>Loading...</Text>
        </View>
      ) : (
        <Text className={textStyles}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
