import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { fonts, useColors } from '../../theme';
import type { AvatarTone } from '../../types';

type Props = {
  initials: string;
  tone?: AvatarTone;
  size?: number;
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
  badge?: string | null;
  verified?: boolean;
};

export function Avatar({ initials, tone = 'green', size = 48, uri, style, badge, verified }: Props) {
  const colors = useColors();
  const toneStyles: Record<AvatarTone, { backgroundColor: string; color: string }> = {
    green: { backgroundColor: colors.green, color: colors.white },
    gold: { backgroundColor: colors.gold, color: colors.greenDarker },
    dark: { backgroundColor: colors.greenDark, color: colors.white },
  };
  const palette = toneStyles[tone];
  const mark = Math.max(16, Math.round(size * 0.36));
  return (
    <View style={[{ width: size, height: size, flexShrink: 0 }, style]}>
      <View
        style={[
          styles.base,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: palette.backgroundColor,
          },
        ]}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: size, height: size }} />
        ) : (
          <Text
            style={[
              styles.text,
              { color: palette.color, fontSize: size < 30 ? 9 : size < 40 ? 12 : size < 48 ? 14 : 16 },
            ]}
          >
            {initials}
          </Text>
        )}
      </View>
      {badge ? (
        <View
          style={[
            styles.badge,
            {
              width: mark,
              height: mark,
              borderRadius: mark / 2,
              backgroundColor: verified ? colors.gold : colors.green,
              borderColor: colors.surface,
              right: -2,
              bottom: -2,
            },
          ]}
        >
          <Text style={[styles.badgeText, { fontSize: mark < 18 ? 7 : 9, color: verified ? colors.greenDarker : colors.white }]}>
            {badge.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontFamily: fonts.sansBold,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeText: {
    fontFamily: fonts.sansBold,
    fontWeight: '700',
  },
});
