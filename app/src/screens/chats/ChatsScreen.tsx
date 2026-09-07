import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Search, Zap } from 'lucide-react-native';
import { ChatRow } from '../../components/chat/ChatRow';
import { AppHeader, HeaderIconButton } from '../../components/ui/AppHeader';
import { Avatar } from '../../components/ui/Avatar';
import { FabMenu } from '../../components/ui/FabMenu';
import { Screen } from '../../components/ui/Screen';
import { SearchField } from '../../components/ui/SearchField';
import { useApp } from '../../context/AppContext';
import { t } from '../../i18n';
import { initialsFromName } from '../../lib/format';
import type { TabScreenProps } from '../../navigation/types';
import { fonts, radii, spacing, useColors } from '../../theme';

export function ChatsScreen({ navigation }: TabScreenProps<'ChatsTab'>) {
  const { chats, profile, markRead, startDirect, language } = useApp();
  void language;
  const colors = useColors();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return chats;
    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(needle) || chat.preview.toLowerCase().includes(needle),
    );
  }, [chats, query]);

  return (
    <Screen>
      <AppHeader
        title="Kuvo"
        right={
          <>
            <HeaderIconButton
              onPress={() => {
                setSearchOpen((open) => !open);
                if (searchOpen) setQuery('');
              }}
            >
              <Search size={20} color={colors.textMuted} strokeWidth={2} />
            </HeaderIconButton>
            <HeaderIconButton onPress={() => setMenuOpen((open) => !open)}>
              <Avatar
                initials={initialsFromName(profile.name || 'You')}
                size={28}
                uri={profile.avatarUri}
                badge={profile.campus?.initials}
                verified={profile.verified}
              />
            </HeaderIconButton>
          </>
        }
      />
      {menuOpen ? (
        <View style={[styles.fly, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            style={styles.flyItem}
            onPress={() => {
              setMenuOpen(false);
              setSearchOpen(true);
            }}
          >
            <Text style={[styles.flyLabel, { color: colors.textDark }]}>{t('header.search')}</Text>
          </Pressable>
          <Pressable
            style={styles.flyItem}
            onPress={() => {
              setMenuOpen(false);
              setQuery(' ');
              setSearchOpen(true);
            }}
          >
            <Text style={[styles.flyLabel, { color: colors.textDark }]}>{t('header.pinned')}</Text>
          </Pressable>
          <Pressable
            style={styles.flyItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('NewChat');
            }}
          >
            <Text style={[styles.flyLabel, { color: colors.textDark }]}>{t('header.newChat')}</Text>
          </Pressable>
          <Pressable
            style={styles.flyItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Profile');
            }}
          >
            <Text style={[styles.flyLabel, { color: colors.textDark }]}>{t('header.settings')}</Text>
          </Pressable>
        </View>
      ) : null}
      {searchOpen ? (
        <View style={styles.searchWrap}>
          <SearchField value={query} onChangeText={setQuery} placeholder={t('chats.search')} />
        </View>
      ) : null}
      {profile.lowDataMode ? (
        <Pressable
          onPress={() => navigation.navigate('Data')}
          style={[styles.pill, { backgroundColor: colors.pillBg }]}
        >
          <Zap size={11} color={colors.pillText} fill={colors.pillText} />
          <Text style={[styles.pillText, { color: colors.pillText }]}>Low data mode on</Text>
        </Pressable>
      ) : null}
      <ScrollView>
        {visible.map((chat) => (
          <ChatRow
            key={chat.id}
            chat={chat}
            onPress={() => {
              markRead(chat.id);
              navigation.navigate('Conversation', { chatId: chat.id });
            }}
          />
        ))}
        {visible.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            {query.trim()
              ? 'No chats match that search.'
              : t('chats.empty')}
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
  searchWrap: {
    paddingHorizontal: spacing.xl,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    marginHorizontal: spacing.xl,
    marginBottom: 12,
  },
  pillText: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    fontWeight: '600',
  },
  empty: {
    fontFamily: fonts.sans,
    fontSize: 13,
    padding: spacing.xl,
  },
  fly: {
    position: 'absolute',
    right: 16,
    top: 52,
    zIndex: 20,
    minWidth: 160,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  flyItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flyLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    fontWeight: '600',
  },
});
