import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, spacing, useColors } from '../../theme';

type Props = {
  title: string;
  titleSize?: number;
  right?: ReactNode;
};

export function AppHeader({ title, titleSize = 26, right }: Props) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { fontSize: titleSize, color: colors.textDark }]}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

export function HeaderIconButton({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 2,
    paddingBottom: 10,
  },
  title: {
    fontFamily: fonts.serifSemi,
    color: '#1E1E1C',
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
