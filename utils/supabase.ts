import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const isWeb = Platform.OS === 'web';
const isSSR = typeof window === 'undefined';

const universalStorage = {
  getItem: async (key: string) => {
    if (isSSR) return null;
    if (isWeb) return window.localStorage.getItem(key);
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (isSSR) return;
    if (isWeb) {
      window.localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (isSSR) return;
    if (isWeb) {
      window.localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: universalStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
