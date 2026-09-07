import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { fonts, spacing, useColors } from '../../theme';

type Props = {
  icon?: ReactNode;
  label: string;
  hint?: string;
  onPress?: () => void;
  chevron?: boolean;
};

export function SettingRow({ icon, label, hint, onPress, chevron = true }: Props) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && onPress && { backgroundColor: colors.card },
      ]}
    >
      {icon ? (
        <View style={[styles.ic, { backgroundColor: colors.card }]}>{icon}</View>
      ) : null}
      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.textDark }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text> : null}
      </View>
      {chevron && onPress ? <ChevronRight size={15} color={colors.textMuted} strokeWidth={2} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  ic: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: 2,
  },
});
