import { Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { fonts, radii, useColors } from '../../theme';

type Props = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  prefix?: string;
  onPrefixPress?: () => void;
  autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  prefix,
  onPrefixPress,
  autoFocus,
  autoCapitalize,
  editable = true,
}: Props) {
  const colors = useColors();

  return (
    <View>
      {label ? <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          {
            borderColor: editable ? colors.border : colors.card,
            backgroundColor: editable ? 'transparent' : colors.card,
          },
        ]}
      >
        {prefix ? (
          <Pressable onPress={onPrefixPress} disabled={!onPrefixPress}>
            <Text style={[styles.prefix, { color: colors.textMuted, borderRightColor: colors.border }]}>
              {prefix}
            </Text>
          </Pressable>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize}
          editable={editable}
          style={[styles.input, { color: editable ? colors.textDark : colors.textMuted }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 20,
  },
  prefix: {
    fontFamily: fonts.sans,
    fontSize: 15,
    borderRightWidth: 1.5,
    paddingRight: 10,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 15,
    padding: 0,
  },
});
