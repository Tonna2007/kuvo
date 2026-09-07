import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useColors, useIsDark } from '../../theme';

type Props = {
  children: ReactNode;
  dark?: boolean;
  padded?: boolean;
  keyboard?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, dark, padded, keyboard, edges = ['top'], style }: Props) {
  const colors = useColors();
  const themeDark = useIsDark();
  const useDarkChrome = dark ?? themeDark;
  const inner = <View style={[styles.inner, padded && styles.padded]}>{children}</View>;

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.base,
        { backgroundColor: dark ? colors.greenDarker : colors.surface },
        style,
      ]}
    >
      <StatusBar style={useDarkChrome ? 'light' : 'dark'} />
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.xxl,
  },
});
