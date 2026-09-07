import { useEffect, useRef } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, MoreVertical } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Composer } from '../../components/chat/Composer';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { Avatar } from '../../components/ui/Avatar';
import { Screen } from '../../components/ui/Screen';
import { useApp } from '../../context/AppContext';
import { useKeyboardPad } from '../../lib/keyboard';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, useColors, wallpaperColor, wallpaperImage } from '../../theme';

export function ConversationScreen({ navigation, route }: RootScreenProps<'Conversation'>) {
  const { chatId } = route.params;
  const { chats, messages, profile, sendMessage, openSheet, markRead, appWallpaper, chatWallpapers } = useApp();
  const theme = useColors();
  const kb = useKeyboardPad();
  const insets = useSafeAreaInsets();
  const chat = chats.find((item) => item.id === chatId);
  const thread = messages.filter((message) => message.chatId === chatId);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    markRead(chatId);
  }, [chatId, markRead]);

  if (!chat) {
    return (
      <Screen padded>
        <Text style={styles.missing}>This chat is no longer available.</Text>
      </Screen>
    );
  }

  const isGroup = chat.kind === 'group';
  const status = isGroup
    ? (chat.members ?? []).slice(0, 3).join(', ') +
      ((chat.members?.length ?? 0) > 3 ? ` + ${(chat.members?.length ?? 0) - 3} more` : '')
    : chat.online
      ? 'online'
      : 'last seen recently';

  return (
    <Screen>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <ChevronLeft size={18} color={theme.textMuted} strokeWidth={2} />
        </Pressable>
        <Avatar
          initials={isGroup ? chat.initials || 'GR' : chat.initials}
          tone={isGroup ? 'gold' : chat.tone}
          size={34}
          uri={chat.avatarUri}
        />
        <Pressable
          style={styles.meta}
          onPress={() =>
            navigation.navigate(isGroup ? 'GroupInfo' : 'ContactInfo', { chatId })
          }
        >
          <Text style={[styles.name, { color: theme.textDark }]} numberOfLines={1}>
            {chat.name}
          </Text>
          <Text style={[styles.status, { color: theme.textMuted }]} numberOfLines={1}>
            {status}
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            openSheet(isGroup ? 'group-menu' : 'convo-menu', { title: chat.name, chatId })
          }
          hitSlop={10}
        >
          <MoreVertical size={18} color={theme.textMuted} strokeWidth={2} />
        </Pressable>
      </View>
      <View style={[styles.flex, { paddingBottom: kb }]}>
        {(() => {
          const wallpaper = chatWallpapers[chatId] || appWallpaper || 'plain';
          const image = wallpaperImage(wallpaper);
          const color = wallpaperColor(wallpaper) || theme.surface;
          const content = (
            <ScrollView
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={[styles.msgs, { paddingBottom: kb > 0 ? 20 : 0 }]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {thread.map((message) => (
                <MessageBubble key={message.id} message={message} isGroup={isGroup} lowDataMode={profile.lowDataMode} />
              ))}
            </ScrollView>
          );
          return image ? (
            <ImageBackground source={image} style={styles.flex} imageStyle={{ opacity: 0.92 }}>
              {content}
            </ImageBackground>
          ) : (
            <View style={[styles.flex, { backgroundColor: color }]}>{content}</View>
          );
        })()}
        <Composer
          onSend={(text) => sendMessage({ chatId, text })}
          onAttach={() => openSheet('attach', { chatId })}
          bottomInset={kb > 0 ? 6 : Math.max(insets.bottom, 10)}
          onVoice={(duration) =>
            sendMessage({ chatId, kind: 'voice', voiceDuration: duration, text: `Voice note ${duration}` })
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4DE',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    fontWeight: '600',
  },
  status: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
  },
  flex: {
    flex: 1,
  },
  msgs: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  missing: {
    fontFamily: fonts.sans,
    marginTop: 24,
  },
});
