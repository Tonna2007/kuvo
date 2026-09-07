import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { fonts, spacing, useColors } from '../../theme';

type Props = {
  title: string;
  onBack: () => void;
};

export function SubscreenHeader({ title, onBack }: Props) {
  const colors = useColors();

  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={12}>
        <ChevronLeft size={18} color={colors.textMuted} strokeWidth={2} />
      </Pressable>
      <Text style={[styles.title, { color: colors.textDark }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    paddingBottom: 16,
  },
  title: {
    fontFamily: fonts.serifSemi,
    fontSize: 21,
    fontWeight: '600',
  },
});
