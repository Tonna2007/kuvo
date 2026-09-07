import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, spacing, useColors } from '../../theme';
import type { Chat } from '../../types';
import { Avatar } from '../ui/Avatar';

type Props = {
  chat: Chat;
  onPress: () => void;
};

export function ChatRow({ chat, onPress }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.card },
      ]}
    >
      <Avatar
        initials={chat.kind === 'group' ? chat.initials || 'GR' : chat.initials}
        tone={chat.kind === 'group' ? 'gold' : chat.tone}
        uri={chat.avatarUri}
      />
      <View style={styles.meta}>
        <Text style={[styles.name, { color: colors.textDark }]} numberOfLines={1}>
          {chat.name}
        </Text>
        <Text style={[styles.preview, { color: colors.textMuted }]} numberOfLines={1}>
          {chat.preview}
        </Text>
      </View>
      <View style={styles.side}>
        {chat.time ? <Text style={[styles.time, { color: colors.textMuted }]}>{chat.time}</Text> : null}
        {chat.unread > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.green }]}>
            <Text style={styles.badgeText}>{chat.unread}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4DE',
  },
  pressed: {
    backgroundColor: '#F1F5F1',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.sansSemi,
    fontSize: 14.5,
    color: '#1E1E1C',
    fontWeight: '600',
  },
  preview: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: '#5B5D57',
    marginTop: 2,
  },
  side: {
    alignItems: 'flex-end',
    gap: 5,
  },
  time: {
    fontFamily: fonts.sans,
    fontSize: 10.5,
    color: '#5B5D57',
  },
  badge: {
    backgroundColor: '#145C38',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
