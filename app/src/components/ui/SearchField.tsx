import { StyleSheet, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { fonts, radii, useColors } from '../../theme';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

export function SearchField({ value, onChangeText, placeholder }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.field, { borderColor: colors.border }]}>
      <Search size={16} color={colors.textMuted} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.textDark }]}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    padding: 0,
  },
});
