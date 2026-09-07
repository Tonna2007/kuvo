import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { GhostButton, PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { TextField } from '../../components/ui/TextField';
import { useApp } from '../../context/AppContext';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, useColors } from '../../theme';

export function NewChatScreen({ navigation }: RootScreenProps<'NewChat'>) {
  const { startDirect, profile } = useApp();
  const colors = useColors();
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <Screen padded keyboard>
      <SubscreenHeader title="New chat" onBack={() => navigation.goBack()} />
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        Use their phone number (same as WhatsApp) or their Kuvo username. Yours is{' '}
        {profile.phone ? `${profile.countryCode} ${profile.phone}` : 'no number'}
        {profile.username ? ` · @${profile.username}` : ''}.
      </Text>
      <TextField
        label="Phone or username"
        value={username}
        onChangeText={setUsername}
        placeholder="801 234 5678 or theirname"
        autoCapitalize="none"
        keyboardType="default"
      />
      <PrimaryButton
        label={busy ? 'Opening…' : 'Start chat'}
        disabled={username.trim().length < 3 || busy}
        onPress={() => {
          void (async () => {
            setBusy(true);
            try {
              const chat = await startDirect(username.trim());
              navigation.replace('Conversation', { chatId: chat.id });
            } catch (err) {
              Alert.alert(
                'Could not start chat',
                err instanceof Error ? err.message : 'Check the username and try again.',
              );
              setBusy(false);
            }
          })();
        }}
      />
      <GhostButton
        label="Message yourself"
        muted
        onPress={() => {
          void startDirect(profile.username || 'me').then((chat) =>
            navigation.replace('Conversation', { chatId: chat.id }),
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: 20,
  },
});
