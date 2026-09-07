import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

type Props = {
  children: ReactNode;
};

export function PhoneFrame({ children }: Props) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.page}>
      <View style={styles.device}>
        <View style={styles.notch} />
        <View style={styles.screen}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: '100%' as unknown as number,
    backgroundColor: colors.greenDarker,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  device: {
    width: 390,
    height: 844,
    maxHeight: '96%' as unknown as number,
    backgroundColor: colors.black,
    borderRadius: 46,
    padding: 12,
    overflow: 'hidden',
    boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
  } as Record<string, unknown>,
  notch: {
    position: 'absolute',
    top: 18,
    left: '50%',
    width: 118,
    height: 28,
    marginLeft: -59,
    backgroundColor: colors.black,
    borderRadius: 16,
    zIndex: 20,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 34,
    overflow: 'hidden',
  },
});
