import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

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

export const supabase = createClient(
  'https://kolrncrjvromhaivenfp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvbHJuY3JqdnJvbWhhaXZlbmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg0Nzc1MTAsImV4cCI6MjAwNDA1MzUxMH0.QlBUWRQByC9NibQFivFDSeT2FPkq5r_Owyj0MQSQbLQ',
  {
    auth: {
      storage: ExpoSecureStoreAdapter as any,
      detectSessionInUrl: false,
    },
  }
);
