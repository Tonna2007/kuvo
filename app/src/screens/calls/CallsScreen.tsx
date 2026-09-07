import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Phone } from 'lucide-react-native';
import { ChatRow } from '../../components/chat/ChatRow';
import { FabMenu } from '../../components/ui/FabMenu';
import { AppHeader, HeaderIconButton } from '../../components/ui/AppHeader';
import { Avatar } from '../../components/ui/Avatar';
import { Screen } from '../../components/ui/Screen';
import { useApp } from '../../context/AppContext';
import { initialsFromName } from '../../lib/format';
import { t } from '../../i18n';
import type { TabScreenProps } from '../../navigation/types';
import { fonts, spacing, useColors } from '../../theme';
import { useState } from 'react';

export function CallsScreen({ navigation }: TabScreenProps<'CallsTab'>) {
  const { profile, callLog, startDirect } = useApp();
  const colors = useColors();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Screen>
      <AppHeader
        title={t('tabs.calls')}
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
      <ScrollView>
        {callLog.map((item) => (
          <ChatRow
            key={item.id}
            chat={{
              id: item.id,
              kind: 'direct',
              name: item.name,
              preview: item.direction === 'in' ? 'Incoming' : 'Outgoing',
              time: item.time,
              unread: 0,
              initials: initialsFromName(item.name),
              tone: 'green',
            }}
            onPress={() =>
              navigation.navigate('Call', {
                username: item.username,
                name: item.name,
                direction: 'out',
              })
            }
          />
        ))}
        {callLog.length === 0 ? (
          <View style={styles.empty}>
            <Phone size={28} color={colors.textMuted} strokeWidth={1.8} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('calls.empty')}</Text>
          </View>
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
  empty: {
    paddingHorizontal: spacing.xl,
    paddingTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 21,
    textAlign: 'center',
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
