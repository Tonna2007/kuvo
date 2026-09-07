import { Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useColors } from '../../theme';

type Props = {
  onPress: () => void;
};

export function BackRow({ onPress }: Props) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} hitSlop={12} style={styles.row}>
      <ChevronLeft size={18} color={colors.textMuted} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 20,
    alignSelf: 'flex-start',
  },
});
