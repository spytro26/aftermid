import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { StorageProvider } from '@/hooks/StorageProvider';
import { FreezerStorageProvider } from '@/hooks/FreezerStorageProvider';
import { BlastStorageProvider } from '@/hooks/BlastStorageProvider';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <StorageProvider>
      <FreezerStorageProvider>
        <BlastStorageProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(freezer)" options={{ headerShown: false }} />
            <Stack.Screen name="(blast)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </BlastStorageProvider>
      </FreezerStorageProvider>
    </StorageProvider>
  );
}
