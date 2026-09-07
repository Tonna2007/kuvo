import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChatRow } from '../../components/chat/ChatRow';
import { AppHeader, HeaderIconButton } from '../../components/ui/AppHeader';
import { Avatar } from '../../components/ui/Avatar';
import { FabMenu } from '../../components/ui/FabMenu';
import { Screen } from '../../components/ui/Screen';
import { useApp } from '../../context/AppContext';
import { initialsFromName } from '../../lib/format';
import type { TabScreenProps } from '../../navigation/types';
import { fonts, spacing, useColors } from '../../theme';
import { useState } from 'react';

export function GroupsScreen({ navigation }: TabScreenProps<'GroupsTab'>) {
  const { chats, markRead, profile, startDirect } = useApp();
  const colors = useColors();
  const [menuOpen, setMenuOpen] = useState(false);
  const groups = chats.filter((chat) => chat.kind === 'group');

  return (
    <Screen>
      <AppHeader
        title="Groups"
        right={
          <HeaderIconButton onPress={() => setMenuOpen((open) => !open)}>
            <Avatar initials={initialsFromName(profile.name || 'You')} size={28} uri={profile.avatarUri} />
          </HeaderIconButton>
        }
      />
      {menuOpen ? (
        <View style={[styles.fly, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            style={styles.flyItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Profile');
            }}
          >
            <Text style={[styles.flyLabel, { color: colors.textDark }]}>Settings</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={[styles.section, { color: colors.textMuted }]}>
        {profile.campus ? `${profile.campus.name.toUpperCase()} GROUPS` : 'YOUR CAMPUS GROUPS'}
      </Text>
      <ScrollView>
        {groups.map((chat) => (
          <ChatRow
            key={chat.id}
            chat={{
              ...chat,
              preview: `${chat.members?.length ?? 0} members · ${chat.preview}`,
            }}
            onPress={() => {
              markRead(chat.id);
              navigation.navigate('Conversation', { chatId: chat.id });
            }}
          />
        ))}
        {groups.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            No groups yet. Tap + then Group — or You to keep notes for yourself.
          </Text>
        ) : null}
      </ScrollView>
      <FabMenu
        onAction={(action) => {
          if (action === 'chat') navigation.navigate('NewChat');
          if (action === 'group') navigation.navigate('NewGroupMembers');
          if (action === 'call') navigation.navigate('NewCall');
          if (action === 'you') {
            void startDirect(profile.username || 'me').then((chat) =>
              navigation.navigate('Conversation', { chatId: chat.id }),
            );
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontFamily: fonts.sansSemi,
    fontSize: 11.5,
    fontWeight: '600',
    paddingHorizontal: spacing.xl,
    paddingBottom: 6,
  },
  empty: {
    fontFamily: fonts.sans,
    fontSize: 13,
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
  },
  fly: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 100,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  flyItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4DE',
  },
  flyLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: '500',
  },
});
