import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { SubscreenHeader } from '../../components/ui/SubscreenHeader';
import { TextField } from '../../components/ui/TextField';
import { useApp } from '../../context/AppContext';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, useColors } from '../../theme';

export function NewCallScreen({ navigation }: RootScreenProps<'NewCall'>) {
  const { profile } = useApp();
  const colors = useColors();
  const [username, setUsername] = useState('');

  return (
    <Screen padded keyboard>
      <SubscreenHeader title="New call" onBack={() => navigation.goBack()} />
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        Enter a Kuvo username. They must have the app open. Your username is @{profile.username || 'not set'}.
      </Text>
      <TextField
        label="Username"
        value={username}
        onChangeText={(value) => setUsername(value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
        placeholder="theirname"
        autoCapitalize="none"
      />
      <PrimaryButton
        label="Call"
        disabled={username.trim().length < 2}
        onPress={() => {
          if (username === profile.username) {
            Alert.alert('Call', 'Call someone else — You is for notes chat.');
            return;
          }
          navigation.replace('Call', { username: username.trim(), name: username.trim(), direction: 'out' });
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
