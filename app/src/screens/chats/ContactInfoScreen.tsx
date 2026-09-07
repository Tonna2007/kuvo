import { StyleSheet, Text, View } from 'react-native';
import { BackRow } from '../../components/ui/BackRow';
import { Avatar } from '../../components/ui/Avatar';
import { Screen } from '../../components/ui/Screen';
import { useApp } from '../../context/AppContext';
import type { RootScreenProps } from '../../navigation/types';
import { colors, fonts, spacing } from '../../theme';

export function ContactInfoScreen({ navigation, route }: RootScreenProps<'ContactInfo'>) {
  const { chatId } = route.params;
  const { chats } = useApp();
  const chat = chats.find((item) => item.id === chatId);

  if (!chat) {
    return (
      <Screen padded>
        <BackRow onPress={() => navigation.goBack()} />
        <Text style={styles.muted}>Contact not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen padded>
      <BackRow onPress={() => navigation.goBack()} />
      <View style={styles.hero}>
        <Avatar
          initials={chat.kind === 'group' ? chat.initials || 'GR' : chat.initials}
          tone={chat.kind === 'group' ? 'gold' : chat.tone}
          size={64}
          uri={chat.avatarUri}
        />
        <Text style={styles.name}>{chat.name}</Text>
        <Text style={styles.kind}>{chat.kind === 'group' ? 'Group chat' : 'Direct chat'}</Text>
      </View>
      {chat.members ? (
        <View>
          <Text style={styles.section}>Members</Text>
          {chat.members.map((member) => (
            <View key={member} style={styles.member}>
              <Text style={styles.memberName}>{member}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.muted}>
          {chat.online ? 'Currently online on campus.' : 'Last seen recently.'}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 18,
  },
  name: {
    fontFamily: fonts.serifSemi,
    fontSize: 22,
    color: colors.textDark,
    marginTop: 12,
  },
  kind: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    fontFamily: fonts.sansSemi,
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 8,
  },
  member: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberName: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textDark,
  },
  muted: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
});
