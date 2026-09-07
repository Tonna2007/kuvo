import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../components/ui/Avatar';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { TextField } from '../../components/ui/TextField';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { pickPhoto, uploadMedia } from '../../lib/media';
import type { RootScreenProps } from '../../navigation/types';
import type { ChatMember } from '../../types';
import { fonts, spacing, useColors } from '../../theme';

export function GroupInfoScreen({ navigation, route }: RootScreenProps<'GroupInfo'>) {
  const { chatId } = route.params;
  const { chats, exitGroup, demoMode, setChatAvatar } = useApp();
  const colors = useColors();
  const chat = chats.find((item) => item.id === chatId);
  const members: ChatMember[] = chat?.memberMeta ?? (chat?.members ?? []).map((name) => ({
    name,
    username: '',
    role: 'member',
    initials: name.slice(0, 2).toUpperCase(),
    avatarUri: null,
  }));
  const isAdmin = chat?.myRole === 'owner' || chat?.myRole === 'admin';
  const [title, setTitle] = useState(chat?.name ?? '');
  const [addUser, setAddUser] = useState('');

  if (!chat) {
    return (
      <Screen>
        <SubscreenHeader title="Group info" onBack={() => navigation.goBack()} />
        <Text style={[styles.missing, { color: colors.textMuted }]}>This group is no longer available.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <SubscreenHeader title="Group info" onBack={() => navigation.goBack()} />
      <View style={styles.hero}>
        <Pressable onPress={() => {
          if (!isAdmin) return;
          void pickPhoto().then(async (picked) => {
            if (!picked) return;
            const uri = demoMode ? picked.uri : await uploadMedia(picked.uri, picked.mime).catch(() => picked.uri);
            setChatAvatar(chatId, uri);
          });
        }}>
          {chat.avatarUri ? <Image source={{ uri: chat.avatarUri }} style={styles.groupImage} /> : <Avatar initials={chat.initials} tone="gold" size={76} />}
        </Pressable>
        <Text style={[styles.name, { color: colors.textDark }]}>{chat.name}</Text>
        {isAdmin ? (
          <Text style={[styles.count, { color: colors.green }]}>Tap the circle to set a group photo</Text>
        ) : null}
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {members.length} members · {isAdmin ? 'You are an admin' : 'Member'}
        </Text>
      </View>
      <ToggleRow label="Mute notifications" value={false} onValueChange={() => undefined} />
      {isAdmin ? (
        <View style={{ paddingHorizontal: spacing.xl }}>
          <Text style={[styles.section, { color: colors.textMuted, paddingHorizontal: 0 }]}>ADMIN</Text>
          <TextField label="Group name" value={title} onChangeText={setTitle} />
          <PrimaryButton
            label="Save name"
            onPress={() => {
              if (demoMode) return;
              void api.renameGroup(chatId, title.trim()).catch((err) =>
                Alert.alert('Could not rename', err instanceof Error ? err.message : 'Try again'),
              );
            }}
          />
          <TextField
            label="Add member (phone or username)"
            value={addUser}
            onChangeText={setAddUser}
            placeholder="8012345678 or name"
            autoCapitalize="none"
          />
          <PrimaryButton
            label="Add"
            disabled={addUser.trim().length < 2}
            onPress={() => {
              if (demoMode) return;
              void api
                .addGroupMember(chatId, addUser.trim())
                .then(() => setAddUser(''))
                .catch((err) =>
                  Alert.alert('Could not add', err instanceof Error ? err.message : 'Try again'),
                );
            }}
          />
        </View>
      ) : null}
      <Text style={[styles.section, { color: colors.textMuted }]}>MEMBERS</Text>
      <ScrollView>
        {members.map((member, index) => (
          <View key={`${member.username}-${member.name}-${index}`} style={[styles.member, { borderBottomColor: colors.border }]}>
            <Avatar initials={member.initials} tone={index % 3 === 0 ? 'gold' : 'green'} size={38} uri={member.avatarUri} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.memberName, { color: colors.textDark }]}>{member.name}</Text>
              <Text style={[styles.role, { color: colors.textMuted }]}>
                {member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : 'Member'}
                {member.username ? ` · @${member.username}` : ''}
              </Text>
            </View>
            {chat.myRole === 'owner' && member.role !== 'owner' ? (
              <Pressable
                onPress={() => {
                  if (demoMode || !member.username) return;
                  const next = member.role === 'admin' ? 'member' : 'admin';
                  void api.setGroupRole(chatId, member.username, next).catch(() => undefined);
                }}
              >
                <Text style={{ color: colors.green, fontSize: 12, fontWeight: '600' }}>
                  {member.role === 'admin' ? 'Remove admin' : 'Make admin'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </ScrollView>
      <Text
        style={styles.exit}
        onPress={() =>
          Alert.alert('Exit group', 'Leave this group?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Exit',
              style: 'destructive',
              onPress: () => {
                exitGroup(chatId);
                navigation.navigate('Tabs', { screen: 'ChatsTab' });
              },
            },
          ])
        }
      >
        Exit group
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  groupImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  name: {
    fontFamily: fonts.serifSemi,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  count: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    letterSpacing: 0.3,
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    paddingBottom: 6,
  },
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.xl,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  memberName: {
    fontFamily: fonts.sansSemi,
    fontSize: 13.5,
    fontWeight: '600',
  },
  role: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    marginTop: 1,
  },
  exit: {
    fontFamily: fonts.sansSemi,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#C0392B',
    textAlign: 'center',
    paddingVertical: 14,
  },
  missing: {
    fontFamily: fonts.sans,
    paddingHorizontal: spacing.xl,
  },
});
