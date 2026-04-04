import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlertProps {
  type: 'error' | 'success';
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  if (!message) return null;

  const isError = type === 'error';
  
  return (
    <View className={`flex-row items-center p-3 rounded-lg mb-4 ${
      isError 
        ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900' 
        : 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900'
    }`}>
      <Ionicons 
        name={isError ? 'alert-circle' : 'checkmark-circle'} 
        size={20} 
        color={isError ? '#f87171' : '#4ade80'} 
      />
      <Text className={`ml-2 flex-1 text-sm ${
        isError ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'
      }`}>
        {message}
      </Text>
    </View>
  );
}
