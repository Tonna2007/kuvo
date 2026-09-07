import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, spacing, useColors } from '../../theme';

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
};

export function ToggleRow({ label, description, value, onValueChange }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.info}>
        <Text style={[styles.label, { color: colors.textDark }]}>{label}</Text>
        {description ? (
          <Text style={[styles.desc, { color: colors.textMuted }]}>{description}</Text>
        ) : null}
      </View>
      <Pressable
        onPress={() => onValueChange(!value)}
        style={[
          styles.track,
          { backgroundColor: value ? colors.green : colors.border },
        ]}
      >
        <View style={[styles.knob, value && styles.knobOn]} />
      </Pressable>
    </View>
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
  info: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 13.5,
    fontWeight: '500',
  },
  desc: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
  },
  track: {
    width: 42,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginLeft: 2,
  },
  knobOn: {
    marginLeft: 20,
  },
});
