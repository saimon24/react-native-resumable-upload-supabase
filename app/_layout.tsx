import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../provider/AuthProvider';

const InitialLayout = () => {
  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    // console.log('CHANGED: ', session);

    if (session && !inAuthGroup) {
      console.log('REDIRECTING TO LIST');

      router.replace('/list');
    } else if (!session) {
      console.log('REDIRECTING TO LOGIN');

      router.replace('/');
    }
  }, [session, initialized]);

  return <Slot />;
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
};

export default RootLayout;
