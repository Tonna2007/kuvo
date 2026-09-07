import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors as staticColors, fonts, radii, useColors } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  muted?: boolean;
};

export function PrimaryButton({ label, onPress, style, disabled }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.primaryLabel, { color: colors.greenDarker }]}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress, style, muted }: Props) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghost, pressed && styles.pressed, style]}>
      <Text style={[styles.ghostLabel, { color: muted ? colors.textMuted : colors.textOnDarkMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, style }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondary,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.secondaryLabel, { color: colors.textDark }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: staticColors.gold,
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  primaryLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: staticColors.greenDarker,
    fontWeight: '600',
  },
  ghost: {
    marginTop: 14,
    alignItems: 'center',
  },
  ghostLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: staticColors.textOnDarkMuted,
  },
  ghostMuted: {
    color: staticColors.textMuted,
  },
  secondary: {
    backgroundColor: staticColors.white,
    borderRadius: radii.lg,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: staticColors.border,
  },
  secondaryLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: staticColors.textDark,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
});
