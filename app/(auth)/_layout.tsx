import { Stack } from 'expo-router';

const StackLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f0f0f',
        },
        headerTintColor: '#fff',
      }}>
      <Stack.Screen
        name="list"
        options={{
          headerTitle: 'My Files',
        }}></Stack.Screen>
    </Stack>
  );
};

export default StackLayout;
