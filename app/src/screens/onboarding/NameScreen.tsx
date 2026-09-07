import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { Avatar } from '../../components/ui/Avatar';
import { BackRow } from '../../components/ui/BackRow';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { TextField } from '../../components/ui/TextField';
import { useApp } from '../../context/AppContext';
import { initialsFromName } from '../../lib/format';
import type { RootScreenProps } from '../../navigation/types';
import { fonts, useColors } from '../../theme';

export function NameScreen({ navigation }: RootScreenProps<'Name'>) {
  const { profile, setName, patchProfile, openSheet } = useApp();
  const colors = useColors();
  const suggested = profile.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 16);
  const [username, setUsername] = useState(profile.username);

  return (
    <Screen padded keyboard>
      <BackRow onPress={() => navigation.goBack()} />
      <Text style={[styles.title, { color: colors.textDark }]}>What's your name?</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        This is what people you chat with will see.
      </Text>
      <Pressable style={styles.avatarWrap} onPress={() => openSheet('photo-picker')}>
        <Avatar initials={initialsFromName(profile.name || 'EE')} size={88} uri={profile.avatarUri} />
        <View style={[styles.cam, { backgroundColor: colors.gold, borderColor: colors.surface }]}>
          <Camera size={14} color={colors.greenDarker} strokeWidth={2.2} />
        </View>
      </Pressable>
      <Text style={[styles.add, { color: colors.textMuted }]} onPress={() => openSheet('photo-picker')}>
        Add photo
      </Text>
      <TextField
        label="Full name"
        value={profile.name}
        onChangeText={setName}
        placeholder="e.g. Eme Emmanuel"
        autoCapitalize="words"
      />
      <TextField
        label="Username"
        value={username}
        onChangeText={(value) => setUsername(value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
        placeholder={suggested || 'yourname'}
        autoCapitalize="none"
      />
      <Text style={[styles.add, { color: colors.textMuted }]}>
        Friends can find you by username or phone number.
      </Text>
      <PrimaryButton
        label="Continue"
        disabled={profile.name.trim().length < 2}
        onPress={() => {
          patchProfile({
            name: profile.name.trim(),
            username: username.trim() || suggested,
          });
          navigation.navigate('Campus');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.serifSemi,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 8,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    marginBottom: 8,
  },
  cam: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 18,
  },
});
