import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

// Use a custom secure storage solution for the Supabase client to store the JWT
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Initialize the Supabase client
export const supabase = createClient('YOUR-SUPABASE-URL', 'YOUR-SUPABASE-ANON-KEY', {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    detectSessionInUrl: false,
  },
});
