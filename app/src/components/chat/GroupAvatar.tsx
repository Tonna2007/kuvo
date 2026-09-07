import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';
import type { AvatarTone } from '../../types';
import { Avatar } from '../ui/Avatar';

type Props = {
  primary: { initials: string; tone: AvatarTone };
  secondary: { initials: string; tone: AvatarTone };
};

export function GroupAvatar({ primary, secondary }: Props) {
  return (
    <View style={styles.stack}>
      <Avatar initials={primary.initials} tone={primary.tone} size={32} style={styles.front} />
      <Avatar initials={secondary.initials} tone={secondary.tone} size={32} style={styles.back} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    width: 48,
    height: 42,
    position: 'relative',
  },
  front: {
    position: 'absolute',
    top: 0,
    left: 16,
    zIndex: 2,
    borderWidth: 2,
    borderColor: colors.white,
  },
  back: {
    position: 'absolute',
    top: 10,
    left: 0,
    zIndex: 1,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
