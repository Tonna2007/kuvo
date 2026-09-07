import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActionSheet } from './src/components/sheets/ActionSheet';
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';
import { PhoneFrame } from './src/components/ui/PhoneFrame';
import { AppProvider, useApp } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/theme';

const webSafeArea = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 28, left: 0, right: 0, bottom: 12 },
};

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ErrorBoundary>
      <PhoneFrame>
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider initialMetrics={Platform.OS === 'web' ? webSafeArea : undefined}>
            <AppProvider>
              <ThemedApp />
            </AppProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PhoneFrame>
    </ErrorBoundary>
  );
}

function ThemedApp() {
  const { profile, language } = useApp();
  const scheme = useColorScheme();

  return (
    <ThemeProvider
      mode={profile.themeMode}
      themeColor={profile.themeColor}
      systemDark={scheme === 'dark'}
    >
      <RootNavigator key={language} />
      <ActionSheet />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#072A1A',
  },
});
